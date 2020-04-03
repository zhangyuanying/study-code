class Subject {
  constructor(name) {
    this.name = name;
    this.arr = [];
    this.state = "开心";
  }
  attach(observer) {
    this.arr.push(observer);
  }
  setState(newState) {
    this.state = newState
    this.arr.forEach(o=>o.update(this)) // 通知所有观察者更新状态，并且传入自己的实例
  }
}
class Observer {
  constructor(name) {
    this.name = name;
  }
  update(s) {
    console.log(
      `当前观察者：${this.name},被观察者${s.name}当前的状态是${s.state} `
    );
  }
}

let s = new Subject('宝宝')
let o1 = new Observer('妈妈')
let o2 = new Observer('爸爸')
s.attach(o1)
s.attach(o2)
s.setState('不开心')
s.setState('开心')