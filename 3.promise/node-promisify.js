// node api 的promisify
// 因为node的异步回调有两个参数：err，data
// 基于高阶函数可以实现一个将node异步函数转为promisify化
// 实际node中有一个util库
// util.promisify()可以使用

// notice: promisify返回的是一个函数，不是promise，这个返回的函数里是才是返回的promise
// 外部可以调用.then方法


// 高阶函数
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, function(err, data) {
        if (err) reject(err);
        resolve(data);
      });
    });
  };
}

const fs = require('fs')
const path = require('path')

let read = promisify(fs.readFile)
read(path.resolve(__dirname,'note.md'),'utf8').then(data=>{
  console.log('data',data)
})