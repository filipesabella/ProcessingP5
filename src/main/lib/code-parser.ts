// sorry, future progammers

import * as types from 'ast-types';
import { builders as typeBuilders } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';
import * as recast from 'recast';

// the name of the global that holds all the values in the
// injected script
const AllVarsVariableName = '__AllVars';

// all previously parsed code files by filename
let previousCodes: { [key: string]: any } = {};

/**
 * Returns if the code has changed structurally or just literal
 * values have been modified.
 */
export function codeHasChanged(file: string, userCode: string): boolean {
  return detectCodeChanges(
    recast.parse(userCode).program.body,
    previousCodes[file].program.body);
}

/**
 * Given the user code, returns a parsed version with:
 * - an `__AllVars` global that holds all the literal values
 * - inlines all global variables with their __AllVars equivalent
 *
 * Receives:
 *
 * let myNumber = 1;
 * fn(myNumber);
 *
 * function fn(n) {
 *   let v = 2;
 *   console.log(v + n + myNumber);
 * }
 *
 * and returns:
 *
 * __AllVars["hash1"] = 1;
 * __AllVars["hash2"] = 2;
 *
 * let myNumber = __AllVars.hash1;
 * fn(__AllVars.hash1);
 *
 * function fn(n) {
 *   let v = __AllVars.hash2;
 *   console.log(v + n + __AllVars.hash1);
 * }
 *
 */
export function parseCode(file: string, userCode: string): string {
  const vars: { [key: string]: string } = {};
  const ast = recast.parse(userCode);

  // stores all variable declarations whose value was modified to access
  // the __AllVars
  const globalVarNamesAndKeys = {} as any;

  types.visit(ast, {
    visitLiteral: path => {
      const key = nodeToKey(path, vars);
      vars[key] = JSON.stringify(path.value.value);

      path.replace(
        typeBuilders.memberExpression(
          typeBuilders.identifier(AllVarsVariableName),
          typeBuilders.identifier(key)));

      if (isGlobalVarDeclaration(path)) {
        const varName = path.parentPath.value.id.name;
        globalVarNamesAndKeys[varName] = key;
      }

      return false;
    }
  });

  // replace all *global* variable references with a reference to their key
  // in the __AllVars
  types.visit(ast, {
    visitIdentifier: path => {
      const nodeName = path?.node?.name;
      if (globalVarNamesAndKeys[nodeName] !== undefined
        && !isVarDeclaration(path)) {

        path.replace(
          typeBuilders.memberExpression(
            typeBuilders.identifier(AllVarsVariableName),
            typeBuilders.identifier(globalVarNamesAndKeys[nodeName])));
      }
      return false;
    }
  });

  const modifiedUserCode = recast.prettyPrint(ast).code;

  previousCodes[file] = recast.parse(userCode);

  const varAssignments = Object.keys(vars).map(key => {
    return `${AllVarsVariableName}['${key}'] = ${vars[key]};`;
  }).join('');
  return `${varAssignments} ${modifiedUserCode}`;
}

/**
 * In theory
 *
 * Receives:
 * let a = 1;
 *
 * and returns:
 * {
 *   aHash: 1
 * }
 *
 * But this is way more complex.
 *
 * In the context of p5, there are a few different contexts to be taken into
 * consideration when grabbing the current variables values to be sent to the
 * running sketch.
 *
 * For instance:
 *
 * let x = 10;
 * let fillColor = 1;
 *
 * function draw() {
 *   background(255);
 *   fill(fillColor);
 *   rect(x, x, 10);
 *   x++;
 *   fillColor++;
 * }
 *
 * Is parsed to:
 *
 * const __AllVars = {
 *   x: 10,
 *   fillColor: 1,
 *   backgroundColor: 255,
 *   rectSize: 10,
 * };
 *
 * let x = __AllVars[x];
 * let fillColor = __AllVars[fillColor];
 *
 * function draw() {
 *   background(__AllVars[backgroundColor]);
 *   fill(fillColor);
 *   rect(x, x, __AllVars[rectSize]);
 *
 *   __AllVars[x]++;
 *   __AllVars[fillColor]++;
 * }
 *
 * Previously, when changing *any* literal, we would send an update hash with
 * all the values extracted from all literals from the code.
 *
 * This is an issue for globals, like `x` and `fillColor`, as they are updated
 * on each `draw` call, and we would essentially reset the sketch to the initial
 * configuration.
 *
 * This function now makes an important distinction, based on the type of
 * expression currently under the cursor in the code editor:
 * - when changing literals that are *not* globals, grab all variables that
 *   aren't globals to send to the sketch
 * - when changing a literal that *is* a global, send *only* that var to the
 *   sketch
 */
export function getVars(
  userCode: string,
  lineUnderCursor?: number): any {
  const vars: { [key: string]: string } = {};
  const ast = recast.parse(userCode);

  let isLiteralUnderCursorAnAssignment = false;

  if (lineUnderCursor !== undefined) {
    types.visit(ast, {
      visitLiteral: path => {
        if (path.value.loc.start.line === lineUnderCursor
          && isGlobalVarDeclaration(path)) {
          isLiteralUnderCursorAnAssignment = true;
          vars[nodeToKey(path, vars)] = path.value.value;
        }

        return false;
      }
    });
  }

  if (!isLiteralUnderCursorAnAssignment) {
    types.visit(ast, {
      visitLiteral: (path) => {
        const key = nodeToKey(path, vars);

        if (!isGlobalVarDeclaration(path)) {
          vars[key] = path.value.value;
        }

        return false;
      }
    });
  }

  return vars;
}

/**
 * Returns a uniquely identifiable key given an AST node.
 */
function nodeToKey(path: any, vars: any): string {
  let key = `a${path.value.loc.start.line}`;
  let count = 1;
  while (key in vars) {
    key = `a${path.value.loc.start.line}_${count++}`;
  }

  return key;
}

/**
 * Here be dragons.
 * Tries to detect recursively if one AST is different from another, ignoring
 * literal value changes.
 */
function detectCodeChanges(actual: any, expected: any): boolean {
  // this returns true when comparing base types (strings, numbers, booleans)
  // we reach this case in many properties like an function's name.
  if (Object(actual) !== actual) {
    return actual !== expected;
  }

  if (Array.isArray(actual)) {
    if (actual.length !== expected.length) {
      return true;
    }
    for (let i = 0; i < actual.length; i++) {
      if (detectCodeChanges(actual[i], expected[i])) {
        return true;
      }
    }
    return false;
  }

  const actualIsLiteral = actual.type === 'Literal';
  const expectedIsLiteral = expected.type === 'Literal';

  if (actualIsLiteral && expectedIsLiteral) {
    return false;
  } else if (!actualIsLiteral && !expectedIsLiteral) {
    for (let attr in actual) {
      /**
       * Sadly there's no other way to compare AST nodes without treating each
       * type specifically, as there's no common interface.
       *
       * This code simply iterates through all object properties and compares
       * them. `loc`, however is a property that nodes have that can differ
       * between `actual` and `expected`, but we don't * necessarily care for
       * this change as it might just be a literal value changing.
       */
      if (expected && attr in expected) {
        if (attr !== 'loc' && detectCodeChanges(actual[attr], expected[attr])) {
          return true;
        }
      } else {
        return true;
      }
    }
  } else {
    return true;
  }

  return false;
}

function isGlobalVarDeclaration(path: NodePath<types.namedTypes.Literal, any>)
  : boolean {
  if (!path.scope.isGlobal) return false;

  while (path.parentPath) {
    if (path.value.type === 'VariableDeclarator') return true;
    path = path.parentPath;
  }
  return false;
}

function isVarDeclaration(path: NodePath): boolean {
  while (path.parentPath && path.value.type) {
    if (path.value.type === 'VariableDeclarator') return true;
    path = path.parentPath;
  }
  return false;
}
