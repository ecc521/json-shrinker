# json-shrinker

A lightweight library to minify JSON by removing whitespace and using scientific notation for numbers. Now fully written in TypeScript with optional lossy compression features.

## Features

- **Whitespace Removal**: `{ "foo" : "bar" }` => `{"foo":"bar"}`
- **Scientific Notation**: `{"foo": 10000000000}` => `{"foo":1e10}`
- **TypeScript Support**: Fully typed.
- **Configurable**: Options for lossy compression (removing undefined/null, precision).
- **Zero Dependencies**: Lightweight.

## Installation

```bash
npm install json-shrinker
```

## Usage

### TypeScript / ES Modules

```typescript
import { shrinkJSON, stringify, ShrinkOptions } from 'json-shrinker';

// Shrink a JSON string
const bigJSONString = '{ "foo" : 10000 }';
const smallerJSON = shrinkJSON(bigJSONString);
console.log(smallerJSON); // {"foo":1e4}

// Stringify an object
const obj = { a: "hi", b: 10000000000, c: 0.00001 };
const smallJSON = stringify(obj);
console.log(smallJSON); // {"a":"hi","b":1e10,"c":1e-5}
```

### CommonJS

```javascript
const { shrinkJSON, stringify } = require("json-shrinker");

// ... same usage
```

## Configuration Options

You can pass an optional `options` object to `stringify`, `shrinkJSON`, etc.

```typescript
interface ShrinkOptions {
  removeUndefined?: boolean; // Default: false
  removeNull?: boolean;      // Default: false
  precision?: number;        // Default: undefined (no rounding)
}
```

### `removeUndefined` (Lossy)
If `true`, properties with `undefined` values in objects will be omitted (mimics standard `JSON.stringify` behavior).
Default is `false` (lossless), which converts them to `null` to preserve the key.

```javascript
stringify({ a: undefined }); // '{"a":null}'
stringify({ a: undefined }, { removeUndefined: true }); // '{}'
```

### `removeNull` (Lossy)
If `true`, properties with `null` values in objects will be omitted.

```javascript
stringify({ a: null }); // '{"a":null}'
stringify({ a: null }, { removeNull: true }); // '{}'
```

### `precision` (Lossy)
Limits the number of decimal places for numbers.

```javascript
stringify({ a: 1.23456789 }); // '{"a":1.23456789}'
stringify({ a: 1.23456789 }, { precision: 2 }); // '{"a":1.23}'
```

## API

### `stringify(value: any, options?: ShrinkOptions): string`
Stringifies a JavaScript value, applying shrinking techniques.

### `shrinkJSON(jsonString: string, options?: ShrinkOptions): string`
Parses a JSON string and re-stringifies it with shrinking.

### `verifiedStringify(value: any, options?: ShrinkOptions): string`
Stringifies the value and verifies that it is valid JSON and smaller than standard `JSON.stringify`.
**Note:** Verification of correctness against `JSON.stringify` is disabled if lossy options are used.

### `verifiedShrinkJSON(jsonString: string, options?: ShrinkOptions): string`
Same as `verifiedStringify` but takes a JSON string as input.

## License

MIT
