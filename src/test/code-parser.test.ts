import { expect } from 'chai';
import 'mocha';
import * as recast from 'recast';
import { codeHasChanged, getVars, parseCode } from '../main/lib/code-parser';

const format = (s: string) => recast.prettyPrint(recast.parse(s)).toString();
const parse = (code: string) => parseCode('a', code);
const hasChanged = (code: string) => codeHasChanged('a', code);

describe('code-parser', () => {
  describe('parseCode', () => {
    it('parses the code', () => {
      expect(format(parse(`
        let myNumber = 1;
        fn(myNumber);
      `))).to.equal(format(`
        __AllVars['a1'] = 1;
        let myNumber = __AllVars.a1;
        fn(myNumber);
      `));
    });
  });

  describe('getVars', () => {
    it('hashes variables', () => {
      expect(getVars('let a = 1;')).to.deep.eq({ a1: 1 });
      expect(getVars('const a = 1;')).to.deep.eq({ a1: 1 });
      expect(getVars('const a = 1; const b = 1;')).to.deep.eq({ a1: 1, a2: 1 });
      expect(getVars('const a = 1;\nconst b = 1;')).to.deep.eq({ a1: 1, a2: 1 });

      // illegal but lets handle it
      expect(getVars('const a = 1;const a = 1;')).to.deep.eq({ a1: 1, a2: 1 });
      expect(getVars('const a = 1;\nconst a = 1;')).to.deep.eq({ a1: 1, a2: 1 });
    });

    it('hashes simple method calls', () => {
      expect(getVars('m(1);')).to.deep.eq({ a1: 1 });
      expect(getVars('m(1, 1);')).to.deep.eq({ a1: 1, a1_1: 1 });
      expect(getVars('m(1,\n1);')).to.deep.eq({ a1: 1, a1_1: 1 });
      expect(getVars('m(1,\n\t\t1);')).to.deep.eq({ a1: 1, a1_1: 1 });
    });

    it('hashes nested method calls', () => {
      expect(getVars('m(1, m2(1));')).to.deep.eq({ a1: 1, a1_1: 1 });
      expect(getVars('m(1, m(1));')).to.deep.eq({ a1: 1, a1_1: 1 });
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
