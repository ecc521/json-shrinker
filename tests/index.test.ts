import { stringify, shrinkNumber, shrinkJSON, verifiedStringify, verifiedShrinkJSON } from '../src/index';

describe('JSON Shrinker', () => {
  describe('Basic Types', () => {
    test('strings', () => {
      expect(stringify("hello")).toBe('"hello"');
      expect(stringify("")).toBe('""');
      expect(stringify("\n\t")).toBe('"\\n\\t"');
    });

    test('booleans', () => {
      expect(stringify(true)).toBe('true');
      expect(stringify(false)).toBe('false');
    });

    test('null', () => {
      expect(stringify(null)).toBe('null');
    });

    test('undefined (root)', () => {
      // function stringify(value) { if (value == null) return 'null'; ... }
      // undefined == null is true.
      expect(stringify(undefined)).toBe('null');
    });
  });

  describe('Numbers', () => {
    test('integers', () => {
      expect(stringify(123)).toBe('123');
      expect(stringify(0)).toBe('0');
      expect(stringify(-10)).toBe('-10');
    });

    test('floats', () => {
      expect(stringify(10.5)).toBe('10.5');
      // 0.0001 usually converts to 1e-4 in JS toString?
      // 0.0001.toString() is "0.0001".
      // shrinkNumber(0.0001) should produce 1e-4 if it's shorter.
      // "0.0001".length = 6. "1e-4".length = 4.
      expect(stringify(0.0001)).toBe('1e-4');
    });

    test('scientific notation shrinking', () => {
      // 10000000000 => 1e10 (length 4 vs 11)
      expect(stringify(10000000000)).toBe('1e10');

      // 1e21
      // JS prints 1e+21. Implementation removes +.
      expect(stringify(1e21)).toBe('1e21');
    });

    test('shrinkNumber specific logic', () => {
        // toShorterVersion logic
        // Trailing zeros > 2: 1000 -> 1e3
        expect(shrinkNumber(1000)).toBe('1e3');
        expect(shrinkNumber(100)).toBe('100'); // 1e2 is length 3, 100 is length 3. Not shorter, so returns str.

        // Leading zeros
        // 0.001 -> 1e-3
        expect(shrinkNumber(0.001)).toBe('1e-3');
        // 0.009 -> 9e-3
        expect(shrinkNumber(0.009)).toBe('9e-3');

        // Edge cases
        expect(shrinkNumber(0)).toBe('0');
        expect(shrinkNumber(-0)).toBe('0'); // shrinkNumber prefers shorter representation, so "0" instead of "-0"
    });
  });

  describe('Objects', () => {
    test('simple object', () => {
      expect(stringify({a:1, b:2})).toBe('{"a":1,"b":2}');
    });

    test('nested object', () => {
      expect(stringify({a: {b: 1}})).toBe('{"a":{"b":1}}');
    });

    test('object with undefined', () => {
       // Current behavior: undefined becomes null
       expect(stringify({a: undefined})).toBe('{"a":null}');
    });
  });

  describe('Arrays', () => {
    test('simple array', () => {
      expect(stringify([1, 2, 3])).toBe('[1,2,3]');
    });

    test('mixed array', () => {
      expect(stringify([1, "a", true, null])).toBe('[1,"a",true,null]');
    });

    test('array with undefined', () => {
        // [undefined] -> [null]
        expect(stringify([undefined])).toBe('[null]');
    });
  });

  describe('Complex Scenarios', () => {
      test('toJSON implementation', () => {
          const obj = {
              toJSON: () => "custom"
          };
          expect(stringify(obj)).toBe('"custom"');
      });
  });

  describe('shrinkJSON', () => {
      test('parses and shrinks', () => {
          const input = '{ "foo" : 10000 }';
          expect(shrinkJSON(input)).toBe('{"foo":1e4}');
      });
  });

  describe('verifiedStringify', () => {
      test('verifies output', () => {
          expect(verifiedStringify({a:1000})).toBe('{"a":1e3}');
      });
  });

  describe('Options', () => {
    test('removeUndefined: true', () => {
      expect(stringify({a: undefined}, {removeUndefined: true})).toBe('{}');
      expect(stringify({a: 1, b: undefined}, {removeUndefined: true})).toBe('{"a":1}');
    });

    test('removeUndefined: false (default)', () => {
      expect(stringify({a: undefined}, {removeUndefined: false})).toBe('{"a":null}');
    });

    test('removeNull: true', () => {
      expect(stringify({a: null}, {removeNull: true})).toBe('{}');
    });

    test('precision', () => {
      expect(stringify(1.23456789, {precision: 2})).toBe('1.23');
      expect(stringify(1.23456789, {precision: 5})).toBe('1.23457'); // Rounded
      expect(stringify({a: 10.1234}, {precision: 2})).toBe('{"a":10.12}');
    });

    test('verifiedStringify with lossy options', () => {
        // Should return the shrunk version even if it differs from native
        // Native: {"a":null}
        // Shrunk (removeNull): {}
        expect(verifiedStringify({a: null}, {removeNull: true})).toBe('{}');

        // Precision
        expect(verifiedStringify({a: 1.23456}, {precision: 2})).toBe('{"a":1.23}');
    });
  });
});
