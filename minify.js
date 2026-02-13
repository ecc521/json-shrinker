function shrinkNumber(num) {	
	//Remove plus from 1e+21
	let exponential = num.toExponential().split("+").join("")
	let str = num.toString()
	
	let shorterExpo = toShorterVersion(num)
	if (shorterExpo.length <= exponential.length) {
		if (Number(shorterExpo) === num) {
			//I don't trust my code...
			exponential = shorterExpo
		}
		else {console.warn("toShorterVersion failed on " + num)}
	}
	else {console.warn("toShorterVersion was longer for " + num + ". Native returned " + exponential + ".")}
	
	//Although using hexadecimal and octal can sometimes yield smaller representations, JSON does not allow them.
		
	//It would also be so nice if we could remove any starting zeroes...
	
	if (exponential.length < str.length) {
		return exponential
	}
	else {
		return str
	}
}


//My attempt to convert numbers to exponential form. Often smaller than built in designs.
function toShorterVersion(num) {
	
	if (Object.is(0, num)) {return "0"}
	if (Object.is(-0, num)) {return "-0"}

	let str = num.toString()

	if (str.includes("e")) {
		//Ideally we would still be able to parse these.
		//Remove the + if present - plus is inferred.
		return str.split("+").join("")
	}
	
	//Has to be greater than or equal to 1000 to be able to save space
	if (Math.abs(num) >= 1e3) {
		//Match trailing zeros
		let match = /0+$/.exec(str)

		let trailingZeros = (match && match[0].length) || 0
		let matchIndex = (match && match["index"]) || 0

		//1 trailing zero longer. 2 is even. 3+ smaller.
		if (trailingZeros > 2) {
			let beginning = str.slice(0, matchIndex)
			return beginning + "e" + trailingZeros
		}
	}
	//Has to be less than or equal to 0.009 to be able to save space. 
	else if (Math.abs(num) <= 9e-3) {
		//Match zeros after decimal point.
		let match = /.0+/.exec(str)
		if (match) {
			//Remove the . from the matched string
			match[0] = match[0].slice(1)
			match["index"]++
		}
		let leadingZeros = (match && match[0].length) || 0
		let matchIndex = (match && match["index"]) || 0

		//1 is even, 2+ is smaller. 
		if (leadingZeros > 1) {
			let ending = str.slice(matchIndex + leadingZeros)
			return ending + "e-" + (leadingZeros + ending.length)
		}
	}
	return str
}


//A JSON.stringify polyfill.

var toString = Object.prototype.toString;
var isArray = Array.isArray || function(a) {
	return toString.call(a) === '[object Array]';
};
var escMap = {
	'"': '\\"',
	'\\': '\\\\',
	'\b': '\\b',
	'\f': '\\f',
	'\n': '\\n',
	'\r': '\\r',
	'\t': '\\t'
};
var escFunc = function(m) {
	return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
};
var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;




function stringify(value, seen) {
	if (value == null) {
		return 'null';
	}
	else if (typeof value === 'number') {
		return isFinite(value) ? shrinkNumber(value) : 'null';
	}
	else if (typeof value === 'boolean') {
		return value.toString();
	}
	else if (typeof value === 'object') {
		seen = seen || new WeakSet();
		if (seen.has(value)) {
			throw new TypeError('Converting circular structure to JSON');
		}
		seen.add(value);
		var res;
		if (typeof value.toJSON === 'function') {
			res = stringify(value.toJSON(), seen);
		}
		else if (isArray(value)) {
			res = '[';
			for (var i = 0; i < value.length; i++)
				res += (i ? ',' : '') + stringify(value[i], seen);
			res += ']';
		}
		else if (toString.call(value) === '[object Object]') {
			var tmp = [];
			for (var k in value) {
				if (value.hasOwnProperty(k))
					tmp.push(stringify(k, seen) + ':' + stringify(value[k], seen));
			}
			res = '{' + tmp.join(',') + '}';
		}
		else {
			res = '"' + value.toString().replace(escRE, escFunc) + '"';
		}
		seen.delete(value);
		return res;
	}
	return '"' + value.toString().replace(escRE, escFunc) + '"';
};



function verifiedStringify(value) {
	//Quite a bit slower, this function simply makes sure the shrunk object works correctly, 
	//and also makes sure that it is smaller. (it is possible some technically correct objects
	//will not be shrunk because the underlying platform moves around the order of object keys, etc.)
	let shrunk = stringify(value)
	let native = JSON.stringify(value)
	
	if (JSON.stringify(JSON.parse(shrunk)) !== native || shrunk.length > native.length) {
		return native
	}
	return shrunk
}

function shrinkJSON(str) {return stringify(JSON.parse(str))}
function verifiedShrinkJSON(str) {return verifiedStringify(JSON.parse(str))}

module.exports = {
	stringify,
	verifiedStringify,
	shrinkJSON,
	verifiedShrinkJSON,
	shrinkNumber
}
