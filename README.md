# json-shrinker

### Minify JSON by Removing Whitespace and by using Scientific Notation for Numbers


Whitespace Removal
Example: ```{ "foo" : "bar" }``` => ```{"foo":"bar"}```

Scientific Notation
Example: ```{"foo": 10000000000}``` => ```{"foo":1e10}```


JSON-minify is best suited for JSON files containing alot of numbers, such as timestamps, and allows you to make JSON files take up less space, without the hassle of changing to [msgpack](https://msgpack.org/index.html), or another much smaller format. 


### Installation:
```npm install json-shrinker```

### Usage:
```const jsonShrinker = require("json-shrinker")```

#### shrinkJSON - Shrink a JSON string
```let smallerJSON = jsonShrinker.shrinkJSON(bigJSONString)```

#### stringify - Stringify an Object
```let smallJSON = jsonShrinker.stringify({a:"hi", b:10000000000, c:0.00001})```
