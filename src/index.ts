
// Helper functions
function toShorterVersion(num: number): string {
    if (Object.is(0, num)) { return "0"; }
    if (Object.is(-0, num)) { return "-0"; }

    let str = num.toString();

    if (str.includes("e")) {
        return str.split("+").join("");
    }

    if (Math.abs(num) >= 1e3) {
        let match = /0+$/.exec(str);
        let trailingZeros = (match && match[0].length) || 0;
        let matchIndex = (match && match.index) || 0;

        if (trailingZeros > 2) {
            let beginning = str.slice(0, matchIndex);
            return beginning + "e" + trailingZeros;
        }
    } else if (Math.abs(num) <= 9e-3) {
        let match = /.0+/.exec(str);
        if (match) {
            // Remove the . from the matched string
            // match[0] is a string in the array, so we can replace the element
            match[0] = match[0].slice(1);
            match.index++;
        }
        let leadingZeros = (match && match[0].length) || 0;
        let matchIndex = (match && match.index) || 0;

        if (leadingZeros > 1) {
            let ending = str.slice(matchIndex + leadingZeros);
            return ending + "e-" + (leadingZeros + ending.length);
        }
    }
    return str;
}

export interface ShrinkOptions {
    removeUndefined?: boolean;
    removeNull?: boolean;
    precision?: number;
    removeCircular?: boolean;
}

export function shrinkNumber(num: number): string {
    //Remove plus from 1e+21
    let exponential = num.toExponential().split("+").join("");
    let str = num.toString();

    let shorterExpo = toShorterVersion(num);
    if (shorterExpo.length <= exponential.length) {
        if (Number(shorterExpo) === num) {
            exponential = shorterExpo;
        } else {
            console.warn("toShorterVersion failed on " + num);
        }
    } else {
        console.warn("toShorterVersion was longer for " + num + ". Native returned " + exponential + ".");
    }

    if (exponential.length < str.length) {
        return exponential;
    } else {
        return str;
    }
}

const escMap: { [key: string]: string } = {
    '"': '\\"',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t'
};

const escFunc = function (m: string): string {
    return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
};

const escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;

export function stringify(value: any, options?: ShrinkOptions, stack: any[] = []): string {
    if (typeof value === 'bigint') {
        throw new TypeError("Do not know how to serialize a BigInt");
    }
    if (value == null) {
        return 'null';
    } else if (typeof value === 'number') {
        let num = value;
        if (options && options.precision !== undefined) {
             num = parseFloat(num.toFixed(options.precision));
        }
        return isFinite(num) ? shrinkNumber(num) : 'null';
    } else if (typeof value === 'boolean') {
        return value.toString();
    } else if (typeof value === 'object') {
        if (stack.indexOf(value) !== -1) {
             if (options && options.removeCircular) {
                 return 'undefined'; // This needs to be handled by caller to actually remove key
             }
             throw new TypeError("Converting circular structure to JSON");
        }
        stack.push(value);

        if (typeof value.toJSON === 'function') {
            const res = stringify(value.toJSON(), options, stack);
            stack.pop();
            return res;
        }

        if (value instanceof Number) {
             const res = stringify(value.valueOf(), options, stack);
             stack.pop();
             return res;
        }
        if (value instanceof String) {
             const res = stringify(value.valueOf(), options, stack);
             stack.pop();
             return res;
        }
        if (value instanceof Boolean) {
             const res = stringify(value.valueOf(), options, stack);
             stack.pop();
             return res;
        }

        if (Array.isArray(value)) {
            let res = '[';
            for (let i = 0; i < value.length; i++) {
                let str = stringify(value[i], options, stack);
                if (str === 'undefined') str = 'null'; // Arrays can't have missing indices
                res += (i ? ',' : '') + str;
            }
            stack.pop();
            return res + ']';
        } else {
            let tmp = [];
            for (let k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    let v = value[k];

                    if (options && options.removeUndefined && v === undefined) {
                        continue;
                    }
                    if (options && options.removeNull && v === null) {
                        continue;
                    }

                    const str = stringify(v, options, stack);
                    if (str !== 'undefined') {
                        tmp.push(stringify(k, options, stack) + ':' + str);
                    }
                }
            }
            stack.pop();
            return '{' + tmp.join(',') + '}';
        }
    }
    return '"' + value.toString().replace(escRE, escFunc) + '"';
}

export function shrinkJSON(str: string, options?: ShrinkOptions): string {
    return stringify(JSON.parse(str), options);
}
