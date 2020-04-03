// 直接node xxx.js中拿到的this不是global
// 因为node中有模块化的概念，node为了实现模块化给每一个文件都包装了一个函数，这个函数中的this就被更改
console.log(this === global); // =》false
console.log(this === module.exports); //true

// 概念
// 1. process 进程
console.log(process.platform) // 进程运行的平台
console.log(process.argv) // 当前进程执行是带的参数，是一个数组，前两个为固定参数
// 1. node的执行命令文件
// 2. 当前执行的文件 
console.log(process.cwd()) // 当前进程执行的工作目录
console.log(process.env) // 当前进程的环境变量
