1. 三个状态：pending fulfilled rejected
2. class Promise中需要一个标识status来控制状态不可改变
3. 需要缓存成功的回调和失败的回调，当调用then时需要依次执行缓存的回调
4. 需要处理then中返回的值x，分别为 promise自己（throw）函数或者对象（递归使用resolvePromise 解析），普通值（直接返回）



### promise化：
- 只针对node的api，因为node的回调函数有两个参数：err和data