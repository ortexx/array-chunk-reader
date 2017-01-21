# Install
`npm install array-chunk-reader`

# About
Module for reading array by chunks using promise

# Example
```js
const arrayChunkReader = require("array-chunk-reader");
let array = [];

for(let i = 0; i < 1000000; i++) {
    array.push("element" + i);
}

let fn = (value) => {
    return Promise.resolve(value);
}

let fnChunk = (allChunkValuesList) => {
    return Promise.resolve(allChunkValuesList);
}

/*
    Each chunk waits of completion all functions(fn). fnChunk is called after that.
    Then there is a pause of the specified length and the next chunk starts.
    If the function returns a promise, all functions in one chunk are called in parallel.
*/

let options = {
    size: 100, // chunk size, default = parseInt(Math.sqrt(array.length))
    timeout: 10, // timeout after each chunk, default = 1
    log: true, // show all process information on log, default = true
    from: 0, // start position, default = 0 (you can use also .startFrom)
    to: array.length // end position, default = array.length (you can use also .readTo)
}

let arrayReader = new arrayChunkReader(array, options);

return arrayReader.start(fn, fnChunk).then(() => {
    // finish
});
```

# Api
### .getCurrentChunkSize()
returns current chunk size
