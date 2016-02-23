# Async function compiler

## Brief
  When you have lots of asynchronous function and if they have dependencies, quickly your code may look like spaghetti.

  This tool allows you write asynchronous function like synchronous function without the need to deal with callbacks, promises, etc..

## Example
Let's say you have add and mul, both are asynchronous, and you want to utilize those to do something more complex
```
function add(x, y) {
  return Promise.resolve(x + y);
}
function mul(x, y) {
  return Promise.resolve(x * y);
}
```
If we want to compute mul(add(3, 4), add(5, 6)), we could use promise and have some code below:
```
function foo() {
  // we want to return mul(add(3, 4), add(5, 6))

  return add(3, 4).then(function(v) {
    return add(5, 6).then(function(w) {
      return mul(v, w);
    });
  });
}

foo().then(function(v) {
  console.log(`v = ${v}`);
});
```
The code is pretty difficult to understand, and once you have many async calls, quickly your code becomes unreadable.

Now, consider if you can write code like below:
```
var AsyncTool = require('async-compiler-runtime');

function add(x, y) {
  return Promise.resolve(x + y);
}

function mul(x, y) {
  return Promise.resolve(x * y);
}

/** @async **/
function foo() {
  return mul(add(3, 4), add(5, 6));
}

foo().then(function(result) {
  console.info(result);
});
```
Your code is now much simpler, all you need to do is add a jsdoc comment `/** @async **/` at the beginning of async function.

## Usage
```
node --harmony node_modules/async-compiler/compile.js --input <input file> --output <output>
```

## Example
```
node --harmony node_modules/async-compiler/compile.js --input abc.js --output def.js
node --harmony def.js
```
