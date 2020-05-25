import { expect } from 'chai';
import 'mocha';
import * as recast from 'recast';
import { codeHasChanged, getVars, parseCode } from '../main/lib/code-parser';

const format = (s: string) => recast.prettyPrint(recast.parse(s)).toString();
const parse = (code: string) => parseCode('a', code);
const hasChanged = (code: string) => codeHasChanged('a', code);

describe('code-parser', () => {
  describe('parseCode', () => {
    it('parses the code with inline global variables', () => {
      expect(format(parse(`
        let myNumber = 1;
        fn(myNumber);

        function fn(n) {
          let v = 2;
          console.log(v + n + myNumber);
        }
      `))).to.equal(format(`
        __AllVars["a2"] = 1;
        __AllVars["a6"] = 2;

        let myNumber = __AllVars.a2;
        fn(__AllVars.a2);

        function fn(n) {
          let v = __AllVars.a6;
          console.log(v + n + __AllVars.a2);
        }
      `));
    });
  });

  describe('getVars', () => {
    describe('with sending the current line of code', () => {
      it(`returns only that var and if it is a global assignment,
        and it does not send any global assignment vars if not`, () => {
        const code = `let a = 1;
          fill(255);
          let b = a + 2;

          function draw() {
            let c = 1;
            fill(c);
          }
        `;
        const allVarsNoGlobals = {
          a2: 255,
          a6: 1,
        };

        // changing a global
        expect(getVars(code, 1)).to.deep.eq({
          a1: 1,
        });

        // not changing a global
        expect(getVars(code, 2)).to.deep.eq(allVarsNoGlobals);

        // changing a global
        expect(getVars(code, 3)).to.deep.eq({
          a3: 2,
        });

        // not changing a global
        expect(getVars(code, undefined)).to.deep.eq(allVarsNoGlobals);
      });
    });

    it('hashes variables', () => {
      expect(getVars('function fn() { let a = 1; }')).to.deep.eq({
        a1: 1,
      });

      expect(getVars('function fn() { const a = 1; }')).to.deep.eq({
        a1: 1,
      });

      expect(getVars('function fn() { const a = 1; const b = 1; }')).to.deep.eq({
        a1: 1,
        a1_1: 1,
      });
    });

    it('hashes simple method calls', () => {
      expect(getVars('m(1);')).to.deep.eq({
        a1: 1,
      });
      expect(getVars('m(1, 1);')).to.deep.eq({
        a1: 1,
        a1_1: 1,
      });

      expect(getVars('m(1,\n1);')).to.deep.eq({
        a1: 1,
        a2: 1,
      });

      expect(getVars('m(1,\n\t\t1);')).to.deep.eq({
        a1: 1,
        a2: 1,
      });
    });

    it('hashes nested method calls', () => {
      expect(getVars('m(1, m2(1));')).to.deep.eq({
        a1: 1,
        a1_1: 1,
      });
      expect(getVars('m(1, m(1));')).to.deep.eq({
        a1: 1,
        a1_1: 1,
      });
    });
  });

  describe('codeHasChanged', () => {
    it('detects if the code has changed', () => {
      parse(`
        let a = 1;
      `);
      expect(hasChanged(`
        let a = 1;
      `)).to.be.false;

      parse(`
        let a = 1;
      `);
      expect(hasChanged(`
        let b = 1;
      `)).to.be.true;

      parse(`
        console.log('a');
        `);
      expect(hasChanged(`
        console.log('a', 'b');
      `)).to.be.true;
    });

    it('ignores formatting changes', () => {
      parse(`
        let a = 1;
        console.log(a);
      `);
      expect(hasChanged(`
        let a = 1;

             console.log(a);
      `)).to.be.false;
    });

    it('ignores literal value changes', () => {
      parse(`
        let a = 1;
        console.log('a');
        `);
      expect(hasChanged(`
        let a = 11;
        console.log('b');
      `)).to.be.false;
    });
  });
});
