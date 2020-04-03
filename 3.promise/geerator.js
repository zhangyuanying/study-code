function * gen(){
  console.log('start')
  let r1 = yield 1;
  console.log('r1',r1)
  let r2 = yield 2;
  console.log('r2',r2)
  return r2
}
let i = gen()
console.log(i.next(1))
console.log(i.next(1))
console.log(i.next(2))
