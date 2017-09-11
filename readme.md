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

const fn = (value) => {
    return Promise.resolve(value);
}

const fnChunk = (allChunkValuesList) => {
    return Promise.resolve(allChunkValuesList);
}

const options = {
    size: 100, // chunk size, default = Math.floor(Math.sqrt(array.length))
    timeout: 10, // timeout after each chunk, default = 1
    log: true, // to log a process, default = true
    from: 0, // start position, default = 0 (you can use also .startFrom)
    to: array.length // end position, default = array.length (you can use also .readTo)
}

const arrayReader = new arrayChunkReader(array, options);

return arrayReader.start(fn, fnChunk).then(() => {
    // finish
});
```

# Description  
Every chunk waits of all "fn" functions completion. "fnChunk" function will be called after that.  
Then there will be a pause of a given length and the next chunk will start.  
If a function returns a promise, all functions in one chunk will be called in parallel.  

# Api
### .getCurrentChunkSize()
returns current chunk size
