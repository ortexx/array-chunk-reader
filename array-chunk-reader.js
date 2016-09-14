"use strict";

(function() {
    class ArrayChunkReader  { 
        constructor(array, options) {
            this.array = array;
            this.arrayLength = array.length;
            
            let defaults = {
                size: Math.floor(Math.sqrt(this.arrayLength)),
                timeout: 1,
                log: true
            }
            
            this.options = Object.assign(defaults, options || {});
        }
        
        chunk(lastInfo, fn, callback) {
            lastInfo = lastInfo || {};
            
            let startChunk = Date.now();
            let length = this.options.readTo || this.arrayLength;
            let start = this.options.startFrom || 0;
            
            let info = {
                iteration: (lastInfo.iteration || 0) + 1,
                length: length,
                from: lastInfo.to || start,
            }
            
            info.to = info.from + this.options.size;
            
            if(info.needTime < 0) {
                info.needTime = 0;
            }
            
            if(info.to > length) {
                info.to = length;
            }
            
            if(info.from >= length) {
                let result = {};
                
                result.avgChunkTime = lastInfo.avgTime || 0; 
                result.chunkCount = lastInfo.iteration || 0;
                
                return callback(null, info, result);
            }
            
            let promise = [];
            
            for(var i = info.from; i < info.to; i++) {
                try {
                    promise.push(fn(this.array[i], info, lastInfo));
                }
                catch(err) {
                    return callback(err);
                }
            }
            
            Promise.all(promise).then(() => {
                let realLength = length - start;
                
                info.time = Date.now() - startChunk;
                info.pastTime = (lastInfo.pastTime || 0) + info.time;
                info.avgTime = Math.floor(info.pastTime / info.iteration);
                info.needTime = Math.floor(realLength * info.avgTime / this.options.size) - info.pastTime;                
                callback(null, info);                        
            }).catch((err) => {
                callback(err, info);
            })
        }
        
        start(fn) {
            let start = Date.now();
            
            let next = (lastInfo, fn, callback) => {
                this.chunk(lastInfo, fn, (err, info, result) => {
                    if(err) {
                        return callback(err);
                    }
                    else if(result) {
                        result.time = Date.now() - start;
                        
                        return callback(null, result);
                    }
                    
                    if(this.options.log) {  
                        console.log("chunk:", JSON.stringify(info, undefined, 1));
                    }
                    
                    if(this.options.timeout == 0) {
                        return next(info, fn, callback);
                    }
                    
                    let timeout = setTimeout(() => {
                        clearTimeout(timeout);
                        next(info, fn, callback);
                    }, this.options.timeout)  
                });  
            }
            
            return new Promise((res, rej) => {          
                next(null, fn, (err, result) => {
                    if(err) {
                        rej(err);
                    }
                    else if(result) {
                        res(result);
                    }
                    
                    rej(new Error("Array chunk reader failed"));
                });              
            })
        } 
    }   
    
    if(module && typeof module == "object" && typeof module.exports == "object") {
        module.exports = ArrayChunkReader;
    }
    else if(window) {
       window.ArrayChunkReader = ArrayChunkReader;
    }
})()

