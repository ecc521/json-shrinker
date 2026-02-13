const assert = require('node:assert');
const { stringify, verifiedStringify } = require('./minify.js');

function test() {
    console.log('Starting tests...');

    // Case 1: Large number
    console.log('Testing large number...');
    const largeNum = 1000000;
    const shrunkLarge = stringify(largeNum);
    assert.strictEqual(shrunkLarge, '1e6');
    assert.strictEqual(verifiedStringify(largeNum), '1e6');

    // Case 2: Small decimal
    console.log('Testing small decimal...');
    const smallDec = 0.0001;
    const shrunkSmall = stringify(smallDec);
    assert.strictEqual(shrunkSmall, '1e-4');
    assert.strictEqual(verifiedStringify(smallDec), '1e-4');

    // Case 3: Simple object (equal length or native)
    console.log('Testing simple object...');
    const simpleObj = { a: 1 };
    const nativeSimple = JSON.stringify(simpleObj);
    const resultSimple = verifiedStringify(simpleObj);
    // Should be either same as native or valid JSON representing same object
    assert.strictEqual(JSON.stringify(JSON.parse(resultSimple)), nativeSimple);
    assert.ok(resultSimple.length <= nativeSimple.length);

    // Case 4: Complex object
    console.log('Testing complex object...');
    const complexObj = {
        a: 1000000,
        b: 0.0001,
        c: "hello",
        d: [10000, 20000],
        e: { f: 3000000 }
    };
    const resultComplex = verifiedStringify(complexObj);
    const nativeComplex = JSON.stringify(complexObj);
    assert.strictEqual(JSON.stringify(JSON.parse(resultComplex)), nativeComplex);
    assert.ok(resultComplex.length < nativeComplex.length);
    console.log(`Complex object: native length ${nativeComplex.length}, shrunk length ${resultComplex.length}`);

    // Case 5: null, boolean, arrays
    console.log('Testing primitives and arrays...');
    assert.strictEqual(verifiedStringify(null), 'null');
    assert.strictEqual(verifiedStringify(true), 'true');
    assert.strictEqual(verifiedStringify(false), 'false');
    assert.strictEqual(verifiedStringify([1, 2, 3]), '[1,2,3]');

    console.log('All tests passed!');
}

try {
    test();
} catch (err) {
    console.error('Test failed!');
    console.error(err);
    process.exit(1);
}
