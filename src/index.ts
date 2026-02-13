
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

export function stringify(value: any, options?: ShrinkOptions): string {
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
        if (typeof value.toJSON === 'function') {
            return stringify(value.toJSON(), options);
        } else if (Array.isArray(value)) {
            let res = '[';
            for (let i = 0; i < value.length; i++)
                res += (i ? ',' : '') + stringify(value[i], options);
            return res + ']';
        } else if (Object.prototype.toString.call(value) === '[object Object]') {
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

                    tmp.push(stringify(k, options) + ':' + stringify(v, options));
                }
            }
            return '{' + tmp.join(',') + '}';
        }
    }
    return '"' + value.toString().replace(escRE, escFunc) + '"';
}

export function verifiedStringify(value: any, options?: ShrinkOptions): string {
    let shrunk = stringify(value, options);
    let native = JSON.stringify(value);

    // If lossy options are used, native comparison might fail.
    // We check if options are "lossy".
    // precision: lossy.
    // removeNull: lossy (native keeps null).
    // removeUndefined: matches native behavior (native removes undefined).
    const isLossy = options && (options.precision !== undefined || options.removeNull);

    if (!isLossy) {
        if (JSON.stringify(JSON.parse(shrunk)) !== native || shrunk.length > native.length) {
            return native;
        }
    }
    return shrunk;
}

export function shrinkJSON(str: string, options?: ShrinkOptions): string {
    return stringify(JSON.parse(str), options);
}

export function verifiedShrinkJSON(str: string, options?: ShrinkOptions): string {
    return verifiedStringify(JSON.parse(str), options);
}
