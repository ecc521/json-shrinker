import { stringify } from '../src/index';

describe('Circular Reference DoS', () => {
    test('throws TypeError on circular reference by default', () => {
        const circularObj: any = {};
        circularObj.self = circularObj;

        // Expect TypeError: Converting circular structure to JSON
        expect(() => {
            stringify(circularObj);
        }).toThrow(TypeError);
    });

    test('omits circular reference when removeCircular option is true', () => {
        const circularObj: any = { a: 1 };
        circularObj.self = circularObj;

        // Should return {"a":1} and omit "self"
        const result = stringify(circularObj, { removeCircular: true });
        expect(result).toBe('{"a":1}');
    });
});
