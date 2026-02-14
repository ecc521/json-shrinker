import { stringify, shrinkJSON, ShrinkOptions } from '../src/index';

describe('Complex Structures', () => {
    describe('Sparse Arrays', () => {
        test('basic gaps', () => {
            expect(stringify([1, , 3])).toBe('[1,null,3]');
        });

        test('multiple consecutive gaps', () => {
            expect(stringify([1, , , 4])).toBe('[1,null,null,4]');
        });

        test('leading/trailing gaps', () => {
            expect(stringify([, 1])).toBe('[null,1]');
            expect(stringify([1, ,])).toBe('[1,null]');
        });

        test('new Array(n)', () => {
            expect(stringify(new Array(3))).toBe('[null,null,null]');
        });

        test('array with delete', () => {
            const arr = [1, 2, 3];
            delete arr[1];
            expect(stringify(arr)).toBe('[1,null,3]');
        });

        test('nested sparse arrays', () => {
            expect(stringify([1, [2, , 3], 4])).toBe('[1,[2,null,3],4]');
        });

        test('object with sparse array', () => {
            expect(stringify({ a: [1, , 2] })).toBe('{"a":[1,null,2]}');
        });

        test('sparse array with undefined/null', () => {
            expect(stringify([1, undefined, , null])).toBe('[1,null,null,null]');
        });
    });

    describe('BigInt', () => {
        test('should throw TypeError', () => {
            expect(() => stringify(1n)).toThrow(TypeError);
        });

        test('should throw TypeError inside object', () => {
            expect(() => stringify({ a: 1n })).toThrow(TypeError);
        });

        test('should throw TypeError inside array', () => {
            expect(() => stringify([1n])).toThrow(TypeError);
        });
    });

    describe('Map and Set', () => {
        test('Map should be empty object', () => {
            expect(stringify(new Map())).toBe('{}');
            expect(stringify(new Map([['a', 1]]))).toBe('{}');
        });

        test('Set should be empty object', () => {
            expect(stringify(new Set())).toBe('{}');
            expect(stringify(new Set([1, 2, 3]))).toBe('{}');
        });

        test('WeakMap should be empty object', () => {
            expect(stringify(new WeakMap())).toBe('{}');
        });

        test('WeakSet should be empty object', () => {
            expect(stringify(new WeakSet())).toBe('{}');
        });

        test('Map with custom toJSON', () => {
            class CustomMap extends Map {
                toJSON() { return { custom: 'map' }; }
            }
            expect(stringify(new CustomMap())).toBe('{"custom":"map"}');
        });
    });

    describe('Wrapper Objects', () => {
        test('String object', () => {
            // JSON.stringify(new String("foo")) -> "foo"
            expect(stringify(new String("foo"))).toBe('"foo"');
        });

        test('Number object', () => {
            // JSON.stringify(new Number(1)) -> "1" (number string)
            expect(stringify(new Number(1))).toBe('1');
        });

        test('Boolean object', () => {
            // JSON.stringify(new Boolean(true)) -> "true"
            expect(stringify(new Boolean(true))).toBe('true');
        });
    });

    describe('Other Objects', () => {
        test('RegExp should be empty object', () => {
            expect(stringify(/abc/)).toBe('{}');
        });

        test('Error should be empty object (unless toJSON)', () => {
            expect(stringify(new Error("msg"))).toBe('{}');
        });

        test('TypedArray (Int8Array)', () => {
            const int8 = new Int8Array([1, 2]);
            // JSON.stringify treats TypedArrays as objects with numeric keys
            // {"0":1,"1":2}
            expect(stringify(int8)).toBe('{"0":1,"1":2}');
        });

        test('Arguments object', () => {
            const args = (function(..._args: any[]) { return arguments; })(1, 2);
            // {"0":1,"1":2}
            expect(stringify(args)).toBe('{"0":1,"1":2}');
        });
    });
});
