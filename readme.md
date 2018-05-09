# Install
`npm install array-chunk-reader`

# About
Module for reading an array by chunks using a promise

# Example

```js
const arrayChunkReader = require("array-chunk-reader");
const array = [];

for (let i = 0; i < 1000000; i++) {
  array.push("item-" + i);
}

// Function to handle each item
const fn = value => Promise.resolve(value);

// Function to handle a chunk
const fnChunk = allChunkValuesList => Promise.resolve(allChunkValuesList);

const options = {
  size: 100,         // chunk size, default = Math.floor(Math.sqrt(array.length))
  timeout: 10,       // timeout after each chunk, default = 1
  log: true,         // to log the process, default = true
  from: 0,           // start position, default = 0
  to: array.length   // end position, default = array.length
}

const arrayReader = new arrayChunkReader(array, options);
arrayReader.start(fn, fnChunk).then(() => 'the end');
```

# Api
### .getCurrentChunkSize()
returns the current chunk size
