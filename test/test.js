"use strict";

let assert = require('chai').assert;
let ArrayChunkReader = require('../array-chunk-reader');

describe('ArrayChunkReader:', function() {
  let array = [];
  let length = 100;
  let size = 11;
  let reader;

  for(let i = 0; i < length; i++) {
    array.push(i + 1);
  }

  describe('api', function() {
    describe('.constructor', function () {
      it('check instance', function () {
        reader = new ArrayChunkReader(array, {log: false, size: size});
        assert.instanceOf(reader, ArrayChunkReader);
      });
    });

    describe('.start()', function () {
      it('check returned fn value', function () {
        let counter = 1;
        let fn = (value) => {
          assert.equal(counter++, value, 'wrong fn values');
        };

        return reader.start(fn);
      });

      it('check returned fnChunk values', function () {
        let _values = [];

        let fn = (value) => {
          _values.push(value);

          return value;
        };

        let fnChunk = (values) => {
          let isEqual = _values.length == values.length && _values.every((v, i) => v === values[i]);
          assert.isOk(isEqual, 'values in fn and fnChunk are different');
          _values = [];
        };

        return reader.start(fn, fnChunk);
      });
    });

    describe('.stop()', function () {
      it('check returned fn value', function () {
        let counter = 0;
        let size = 5;
        reader = new ArrayChunkReader(array, {size: size, log: false});

        return reader.start(() => {
          counter++;

          if(counter == 3) {
            reader.stop();
          }
        }, () => {
          counter++;
        }).then(() => {
          assert.equal(counter, size);
        });
      });
    });

    describe('.getCurrentChunkSize()', function () {
      it('check chunk size in every fnChunk', function () {
        let fn = (value) => {
        };

        let fnChunk = (values) => {
          assert.equal(reader.getCurrentChunkSize(), values.length, 'wrong chunk size');
        };

        return reader.start(fn, fnChunk);
      });
    });    
  });

  describe('options', function() {
    it('check range reading', function () {
      let from = 2;
      let to = length - 1;
      let counter = 0;
      let currentLength = to - from;

      reader = new ArrayChunkReader(array, {log: false, size: size, from: from, to: to});

      return reader.start(() => {
        counter++;
      }).then(() => {
        assert.equal(counter, currentLength, 'wrong range size');
      });
    });
  });
});
