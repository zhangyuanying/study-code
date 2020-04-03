// 定义promise的三个状态：pending fulfilled rejected
const PENDING = "PENDING"; // 等待
const FULFILLED = "FULFILLED"; // 成功
const REJECTED = "REJECTED"; // 失败

const resolvePromise = (promise2, x, resolve, reject) => {
  // 可能你的promise会和别人的promise混用，需要做兼容处理
  // 1. x === promise2,永远等不到自己的resolve和reject的结果，需要抛出类型错误 Type Error
  if (promise2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  // 判断x的类型
  // 1. 先判断x是不是对象或者函数
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 由于promise的状态不可以改变，还需要兼容别人的promise，需要定义一个是否调用的called作为标识
    let called;
    try {
      let then = x.then;
      if (typeof then === "function") {
        // 判断x.then是否是一个函数，如果不是一个函数，只能认准不是promise了，直接返回
        // 如果是函数，就认为他是promise，需要调用then方法
        // 但是之前已经取出了then，不能再一次取then，所以需要使用call改变this并让then执行
        then.call(
          x,
          y => {
            // 如果x是一个promise 就采用这个promise的返回结果
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject); // 继续解析成功的值
          },
          r => {
            if (called) return;
            called = true;
            reject(r); // 直接用r 作为失败的结果
          }
        );
      } else {
        // x={then:'123'}
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // x不是对象或者函数，则不是promise，直接返回
    resolve(x);
  }
};

// 判断是否是一个promise
const isPromise = value => {
  if (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  ) {
    return typeof value.then === "function";
  }
  return false;
};

class Promise {
  constructor(executor) {
    this.status = PENDING; // 状态，默认为pengding
    this.value = undefined; // 成功的返回值
    this.reason = undefined; // 失败的原因
    this.onResolvedCallbacks = []; // 存放成功的回调,发布订阅模式
    this.onRejectedCallbacks = []; // 存放失败的回调
    let resolve = value => {
      if (value instanceof Promise) {
        // 递归解析，如果一直是promise，则一直递归，直到解析出一个普通值为止
        return value.then(resolve, reject);
      }
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };
    let reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    // try catch只能捕获同步异常
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  static resolve(value) {
    return new Promise(resolve => {
      //  resolve方法里放一个promise 会等待这个promise执行完成
      // 因为在Promise类中自己写的resolve中有判断value是否为promise实例，如果是会一直递归，直到解析到一个普通值为止返回
      resolve(value);
    });
  }
  static reject(reason) {
    return new Promise((null, reject) => {
      // reject是不会判断，直接原封不动的返回
      reject(reason);
    });
  }
  static all(promises) {
    return new Promise((resolve, reject) => {
      let arr = [];
      let index = 0;
      let processData = (i, data) => {
        arr[i] = data;
        if (++index === promises.length) {
          resolve(arr);
        }
      };
      for (let i = 0; i < promises.length; i++) {
        let current = promises[i];
        if (isPromise(current)) {
          current.then(
            data => {
              processData(i, data);
            },
            err => {
              return reject(err);
            }
          );
        } else {
          processData(i, current);
        }
      }
    });
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      // 谁快就返回谁
      for (let i = 0; i < promises.length; i++) {
        let current = promises[i];
        if (isPromise(current)) {
          current.then(resolve, reject);
        } else {
          resolve(current);
        }
      }
    });
  }

  then(onFulfilled, onRejected) {
    // 可选参数的处理，需要判断onFulfilled和onRejected的类型：如果不是函数，就封装成函数val=>val
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : val => val;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : err => {
            throw err;
          };
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 为了可以取到promise2，需要放在异步队列中
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  // catch实际上就是.then(null,rejection)或者.then(undefined,rejection)的别名
  catch(errCallback) {
    return this.then(null, errCallback);
  }
  finally(callback) {
    // 无论成功还是失败都会执行finally中的方法
    // 如果还链式调用了then，则是把finally之前的promise结果返回（成功或失败），与自己的结果无关
    return this.then(
      value => {
        // 等待finally方法执行完毕后 将上一个成功的结果向下传递
        return Promise.resolve(callback()).then(() => value);
      },
      err => {
        return Promise.reject(callback()).then(() => throw err);
      }
    );
  }
}

Promise.deferred = function() {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
module.exports = Promise;

// promises-aplus测试
// sudo npm install promises-aplus-tests -g
// promises-aplus-tests promise.js

