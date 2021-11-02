
function swap(y) {
console.log("y1: " + JSON.stringify(y));
  let boat = y.tx;
  y.tx = [];
console.log("b: " + boat);
console.log("y2: " + y);
}

let taobj = { tx : [1,2,3,4] }
console.log("taobj1: " + JSON.stringify(taobj));
swap(taobj);

console.log("taobj2: " + JSON.stringify(taobj));

