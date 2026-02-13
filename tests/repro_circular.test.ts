import { stringify } from '../src/index';

describe('Circular Reference DoS', () => {
    test('demonstrate circular reference vulnerability', () => {
        const circularObj: any = {};
        circularObj.self = circularObj;

        // We expect this NOT to throw an error (i.e. handle circular refs gracefully)
        // Currently, this will fail with RangeError: Maximum call stack size exceeded
        expect(() => {
            stringify(circularObj);
        }).not.toThrow();
    });
});
