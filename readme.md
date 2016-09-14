# Install 
`npm install array-chunk-reader`

# About
Module for read array by chunks with promise
You can shuffle big array by segments. 

# Example
```js
const arrayChunkReader = require("array-chunk-reade");
    let array = [];
    
    for(let i = 0; i < 1000000; i++) {
        array.push("element" + i);
    }
    
    let fn = (value) => {
        return Promise.resolve(value); 
    }
    
    /* 
    each chunk will wait until all functions(fn) are finished. Only then will a pause of the specified length and the next segment to be launched. If the function returns a promise, all functions in one chunk will be executed in parallel.    
    */
    
    let options = {
        size: 100, // chunk size, default = parseInt(Math.sqrt(array.length)) 
        timeout: 10, // timout after each chunk, default = 1 
        log: true // show all process information on log, default = true 
        startFrom: 0 // start position, default = 0
        readTo: array.length // end position, default = array.length
    }

    let arrayReader = new ArrayChunkReader(array, options);

    return arrayReader.start(fn).then(() => {
        // finish
    });

```
