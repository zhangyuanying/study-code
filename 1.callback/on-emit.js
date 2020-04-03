const fs = require("fs");
const path = require("path");

// 发布/订阅模式
class Event {
  constructor() {
    this.arr = [];
  }
  on(fn) {
    this.arr.push(fn);
  }
  emit() {
    this.arr.forEach(fn => fn());
  }
}
const e = new Event();
let renderObj = {};
e.on(() => {
  console.log("读取到了数据");
});
e.on(() => {
  if (Object.keys(renderObj).length == 2) {
    console.log("数据读取完了");
  }
});

fs.readFile(path.join(__dirname, "data/name.txt"), "utf8", (err, data) => {
  renderObj.name = data;
  e.emit()
});
fs.readFile(path.join(__dirname, "data/age.txt"), "utf8", (err, data) => {
  renderObj.age = data;
  e.emit()
});
