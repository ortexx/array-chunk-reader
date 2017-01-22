"use strict";

(function () {
  class ArrayChunkReader {
    constructor(array, options) {
      options = options || {};

      this.array = array;
      this.arrayLength = array.length;
      this.startFrom = options.startFrom || options.from || 0;
      this.startTo =  options.readTo || options.to || this.arrayLength;

      if (this.startFrom > array.length) {
        this.startFrom = length;
      }

      if(this.startTo < this.startFrom) {
        throw new Error('Wrong range for reading');
      }

      this.currentFrom = this.startFrom;
      this.currentTo = this.startTo;

      let defaults = {
        size: Math.floor(Math.sqrt(this.arrayLength)),
        timeout: 1,
        log: true
      };

      this.options = Object.assign(defaults, options || {});
    }

    getCurrentChunkSize()  {
      let diff = this.currentTo - this.currentFrom;

      if(diff < this.options.size) {
        return diff;
      }

      return this.options.size;
    }

    chunk(lastInfo, fn, fnChunk, callback) {
      lastInfo = lastInfo || {};

      let startChunk = Date.now();
      let length = this.startTo;
      let start = this.startFrom;

      let info = {
        iteration: (lastInfo.iteration || 0) + 1,
        length: length,
        from: lastInfo.to || start,
      };

      info.to = info.from + this.options.size;

      if (info.needTime < 0) {
        info.needTime = 0;
      }

      if (info.to > length) {
        info.to = length;
      }

      if (info.from >= length) {
        let result = {};

        result.avgChunkTime = lastInfo.avgTime || 0;
        result.chunkCount = lastInfo.iteration || 0;

        return callback(null, info, result);
      }

      this.currentFrom = info.from;
      this.currentTo = info.to;

      let promise = [];

      for (let i = info.from; i < info.to; i++) {
        try {
          promise.push(fn(this.array[i], info, lastInfo));
        }
        catch (err) {
          return callback(err);
        }
      }

      Promise.all(promise).then((data) => {
        if(fnChunk) {
          return fnChunk(data);
        }
      }).then(() => {
        let realLength = length - start;

        promise = null;
        info.time = Date.now() - startChunk;
        info.pastTime = (lastInfo.pastTime || 0) + info.time;
        info.avgTime = Math.floor(info.pastTime / info.iteration);
        info.needTime = Math.floor(realLength * info.avgTime / this.options.size) - info.pastTime;
        callback(null, info);
      }).catch((err) => {
        callback(err, info);
      });
    }

    start(fn, fnChunk) {
      let start = Date.now();

      let next = (lastInfo, fn, fnChunk, callback) => {
        this.chunk(lastInfo, fn, fnChunk, (err, info, result) => {
          if (err) {
            return callback(err);
          }
          else if (result) {
            result.time = Date.now() - start;

            return callback(null, result);
          }

          if (this.options.log) {
            console.log("chunk:", JSON.stringify(info, undefined, 1));
          }

          if (this.options.timeout == 0) {
            return next(info, fn, fnChunk, callback);
          }

          let timeout = setTimeout(() => {
            clearTimeout(timeout);
            next(info, fn, fnChunk, callback);
          }, this.options.timeout)
        });
      };

      return new Promise((res, rej) => {
        next(null, fn, fnChunk, (err, result) => {
          if (err) {
            rej(err);
          }
          else if (result) {
            res(result);
          }

          rej(new Error("Array chunk reader failed"));
        });
      })
    }
  }

  if (typeof module == "object" && typeof module.exports == "object") {
    module.exports = ArrayChunkReader;
  }
  else if (typeof window == "object") {
    window.ArrayChunkReader = ArrayChunkReader;
  }
})();

