// 柯里化函数：核心思想就是“闭包”
// 闭包：函数执行

// 实现一个通用的currying函数
const currying = (fn, arr) => {
  // console.log("fn", fn);
  let len = fn.length; // 函数参数的个数
  return (...args) => {
    arr = [...arr, ...args];
    if (arr.length < len) {
      return currying(fn, arr);
    }
    return fn(...arr);
  };
};

currying(add, [1])(2)(3)(4);

const add = (a, b, c, d) => {
  let sum = a + b + c + d;
  console.log(sum);
  return sum;
};


// 通过currying思想实现bind
Function.prototype.bind = function(context) {
  let _args = Array.prototype.slice.call(arguments, 1);
  return (...args) => {
    return this.apply(context, [..._args, Array.prototype.slice.call(args)]);
  };
};

const test = add.bind(null, 1, 2, 3, 4);
test();