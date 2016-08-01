# JS-Async-Fun
Fun with Asynchronous JavaScript using (and comparing) various patterns to solve the following problem

## Problem

> Request `file1`, `file2` and `file3` **at the same time** (in "parallel")

> **Render them ASAP** (don't just blindly wait for all to finish loading)

> **Render them in proper (obvious) order**: `file1`, `file2`, `file3`.

> Output the string ``"Complete!"`` after all files are rendered.

## [Problem Solutions](https://nem035.github.io/js-async-fun/)

## Async Patterns

### [Callbacks](https://en.wikipedia.org/wiki/Callback_%28computer_programming%29) (Hell) ([MDN](https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/Using_js-ctypes/Declaring_and_Using_Callbacks))

**TLDR;**

Although being the building blocks of asynchronous programming, callbacks on their own have 2 core deficiencies:

- They **can't be trusted** -> we don't know if/when/how many times our code is called - its outside of our control
- They **exhibit non-sequential reasoning** -> we don't know in what order separate callbacks have executed

**More in depth**

First thing most people think of when they hear "Callback Hell", is the nested callback approach (also known as the pyramid of doom):

```javascript

getThingOneAsynchronously(function(value1) {
  getThingTwoAsynchronously(function(value2) {
    getThingThreeAsynchronously(function(value3) {
    // at this point, after all async portions have finished (one after the other!), we will have all the values
    });
  });
});
```

However, this code can easily be cleaned up with named functions and/or variables that hold these functions but it would still have the inherent problems that callbacks have.

One of the main issues that callbacks introduce is the problem of [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control). 
As an example, we can conceptually split our programs into two main parts:

- the one we execute first, and
- the callbacks which get handed off to the another party (Inversion of Control) to be executed by this party some time later

```javascript
// first half
someAsyncFunction(function() {
  // second half
  // we are not in control if/when/how this gets executed
});
```

This introduces trust issues with the other party executing our callback. We have to trust that they will call it in the exact way we expect them to and exactly as many times as we need them to but we have no guarantees on how the code actually gets called and if it gets called at all.

The other main problem with callbacks is that they, on their own, have no sense of execution order - they are inherently non-sequential portions of code. When we have two or more separate callbacks there is no way for us to determine in which order those callbacks have executed. This isn't a problem if we are performing asynchronous tasks in order but what if we are executing multiple asynchronous code blocks concurrently (in "parallel"), each with their own callback? In this case, callbacks themselves do not provide us with a mechanism to "react" to their results in a sequential manner.

```javascript
// concurrent ("parallel") requests
getThingOneAsynchronously(function(value1) {
  // here we have value 1
});
getThingTwoAsynchronously(function(value2) {
  // here we have value 2
});

// What about code that needs to run when we receive both `value1` and `value2`?
```

The only way we could handle this is to maintain some sort of shared global state outside of the callbacks where we can keep track of execution order.

```javascript
// flags indicating if a value for each callback is received
let received1 = false;
let received2 = false;

// variables holding the values for each callback
let value1;
let value2;

// concurrent ("parallel") requests
getData(30, function(result) {
  received1 = true;
  value1 = result;

  // if value 2 was already received, show the result
  if (received2) {
    console.log(`The meaning of life is ${value1 + value2}`);
  }
});
getData(10, function(result) {
  received2 = true;
  value2 = result;

  // if value 1 was already received, show the result
  if (received1) {
    console.log(`The meaning of life is ${value1 + value2}`);
  }
});

// callback wrapper
function getData(d, cb) {
  setTimeout(function() {
    cb(1 + d);
  }, 1000);
}
```

However, what if we wanted to get 5 things in the same manner? What about 10 things? Code would quickly become complex, bug-prone and hard to maintain.

#### [Problem](https://github.com/nem035/js-async-fun#problem) [Solution using callbacks](https://nem035.github.io/js-async-fun/#callbacks)

### [Thunks](https://en.wikipedia.org/wiki/Thunk)

**TLDR;**

Thunks, in async programming, are functions that tackle the issue of asynchonocity by **eliminating time as a concern** and serving as wrappers for values that will be obtained later. They achieve this by wrapping the async code and the callback in a closure and **call the callback only after the value is received**. Unlike plain callbacks, thunks return immediately but call the callback provided to them later, once their internal async operation provides a value.

**More in depth**

A thunk is a function that already contains everything it needs to perform its purpose. It is a container for its state and is independent from the outside world. Another way to think of a thunk is a wrapper for a value.

```javascript
// synchronous thunk
function add(x, y) {
  return x + y;
}

function thunk() {
  return add(10, 15);
}

console.log(thunk()); // 25
```

An asynchronous thunk is the same as a synchronous thunk except instead of returning a value, it accepts a callback that will provide the value.

```javascript
// asynchronous thunk
function add(x, y, cb) {
  setTimeout(function() {
    cb(x + y);
  }, 1000);
}

function thunk(cb) {
  return add(10, 15, cb);
}

thunk(function(sum) {
  console.log(sum); // 25
});
```

Thunks produce **time-independent** wrappers around values and are the basis for [promises](https://github.com/nem035/js-async-fun#promises).

Additionally, thunks can be lazy or active.

- A lazy thunk is a thunk that computes its value the first time it is called, then returns it on all subsequent calls.
- An active thunk is a thunk that computes its value when created and then returns it on all subsequent calls.

```javascript
// concurrent ("parallel") requests
let thunk1 = asyncThunk(30);
let thunk2 = asyncThunk(10);

// sequential (nested) thunks
thunk1(function(value1) {
  thunk2(function(value2) {
    console.log(`The meaning of life is ${value1 + value2}`);    
  });
});

// asynchronous active thunk
function asyncThunk(d) {
  let data;
  let fn;
  getData(d, function(res) {
    if (fn) {
      fn(res);
    } else {
      data = res;
    }
  });
  return function(cb) {
    if (data) {
      cb(data);
    } else {
      fn = cb;
    }
  }
}

// callback wrapper
function getData(d, cb) {
  setTimeout(function() {
    cb(1 + d);
  }, 1000);
}
```

#### [Problem](https://github.com/nem035/js-async-fun#problem) [Solution using thunks](https://nem035.github.io/js-async-fun/#thunks)

### [Promises](https://en.wikipedia.org/wiki/Futures_and_promises) ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

**TLDR;**

Promises are wrappers for future values. They:
- **eliminate time as a concern** from async code by conceptually serving as an event listener for the `"then"` event
- **eliminate the issues of trust and of Inversion of Control** by serving as a callback manager, internally managing the execution of our callbacks in a trustable manner.

**More in depth**

Promises represent wrappers around future values. They invert
the untrustability (Inversion of Control) provided by callbacks, giving the control back to us.

One way to imagine a promise is like an event listener with a `then` event.

```javascript
// pseudo code
let listener = getSomeDataAndReturnAPromise();
listener.on('success', success);
listener.on('fail', fail);

// actual code
let promise = getSomeDataAndReturnAPromise();
promise.then(success, fail);
```

**But wait**, how do promises solve callback hell when they still use callbacks? Can't a promise just call my callback twice? Or not at all?

Promises are **guaranteed** to only be resolvable once, with either success OR error and are immutable once resolved. Meaning the code within a promise runs once. After resolving or rejecting, the promise becomes bound to the value with which it resolved and that value cannot be changed. Any future resolutions of the same promise will **always return the same value** 

```javascript
let promise = new Promise(function(resolve, reject) {
  resolve(1); // resolve once
  resolve(2); // resolve second time (this is ignored)
});
promise.then(function(result) {
  console.log(result); // 1
});
promise.then(function(result) {
  console.log(`still ${result}`); // still 1
});
```

In other words, a promise is a pattern for managing our callbacks in a **trustable** fashion.

Ppromises are also chainable, providing cleaner, sequential looking async code, which is easier to reason about and requires no nesting.

```javascript
// concurrent ("parallel") requests
let promise1 = getData(30);
let promise2 = getData(10);

let value1;
let value2;

// promise chain that accumulates our results and prints them once both are received
promise1
.then(function(res1) {
  value1 = res1;
})
.then(function() {
  return promise2;
})
.then(function(res2) {
  value2 = res2;
})
.then(function() {
  console.log(`The meaning of life is ${value1 + value2}`);
});

// promise wrapper
function getData(d) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(1 + d);
    }, 1000);
  });
}
```

Additionally, we can use [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) to wait until all of our data is received, and then perform a certain operation.

```javascript
// concurrent ("parallel") requests
let promise1 = getData(30);
let promise2 = getData(10);

// print the result once both values are received
Promise.all([ promise1, promise2 ])
.then(function(values) {
  console.log(`The meaning of life is ${values[0] + values[1]}`);  
});

// promise wrapper
function getData(d) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(1 + d);
    }, 1000);
  });
}
```

What about a promise that never resolves? Well, the way to deal with this is similar to how we would deal with any async code that might never run, which is to setup a timer. A convenient method we can use for this is [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), which takes an array of promises and resolves as soon as any of them resolve (or reject).

```javascript
// promise that never resolves
let promise = new Promise(function() {});

// timed promise that rejects after 3 seconds
let timer = new Promise(function(_, reject) {
  setTimeout(function() {
    reject('Timeout!');
  }, 3000);
});

function success() {}
function fail(err) { console.error(err); }

Promise.race([ promise, timer ]).then( success, fail );
```
[Problem](https://github.com/nem035/js-async-fun#problem) [Solution using promises](https://nem035.github.io/js-async-fun/#promises)

### [Generators](https://en.wikipedia.org/wiki/Generator_%28computer_programming%29) ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator))

**TLDR;**

Generators solve the problem of non-sequential reasoning in asynchronous programming by **allowing us to write async code in a synchronous manner**. When combined with promises, they adopt the trustworthiness and reliability of promises and provide an API to sequentially execute asynchronous code, using promises as wrappers for future values.

**More in depth**

If promises are there to solve the Inversion of Control problem, generators are there to solve the non-sequential reasoning problem.

For the most part, JS has the semantic where code **runs to completion**, which allows us to reason in a single-threaded fashion. However, **generators do not have a run to completion** semantic, generators provide a way to to pause and resume code execution.

In other words, generators allow us to syntactically declare state machines. Simply put, generators are functions that can be paused and resumed where the **pausing blocks code locally in the generator**, leaving all other code unaffected.

```javascript
function *gen() {
  yield 'pause here';     // yield means pause here and return the string 'pause here'
  return 'now I finished';
}
```

A generator function returns an iterator, which has a method `next` that, when called, runs the generator to the first `yield` and returns the yielded value as a plain JS object with two fields:

```javascript
{
  value: yieldedValue,
  done: false
}
```

The generator remains paused until next time we call `next` on it, which continues from our current paused position and runs to the next `yield` and so on. If no `yield` is found, generator returns like any other JS function, by returning whatever was specified with the `return` statement or `undefined`. Anything that was specified as the return value becomes the `value` of the returned object and the `done` flag gets set as `true`.

Besides being able to pause execution and provide data, generators can also receive data and resume execution. This is also done through the `next` method where we can pass values which are then returned from the currently paused `yield`.

```javascript
function *gen() {
  const a = 1 + (yield 'The meaning');
  const b = 1 + (yield 'of life is');
  return (a + b);
}

// create an iterator from a generator
let iter = gen();

// run until the first yield and return its yielded value
let first = iter.next();    // { value: 'The meaning', done: false }

// pass 30 as the return from the first yield and run to the second yield and return its yielded value
let second = iter.next(30); // { value: 'of life is', done: false }

// pass 10 as the return from the second yield and run until the return statement and return the value
let result = iter.next(10); // { value: 42, done: true }

console.log(`${first.value} ${second.value} ${result.value}`);
```

Generators enable us to write synchronous looking asynchronous code.

```javascript
function *gen() {
  const value1 = yield getData(30);
  const value2 = yield getData(10);    
  console.log(`The meaning of life is ${value1 + value2}`);
}

let iter = gen();
iter.next();

function getData(d) {
  setTimeout(function() {
    iter.next(1 + d);
  }, 1000);
}
```

However, the code above still has the issue of Inversion of Control that requires some outside party (in this case `setTimeout`) to call our generator's `next` method.

The way to regain control back is to combine generators with promises.

In the same way thunks & promises factor out time as a concern, generators factor out asynchronicity itself as an issue. By combining generators and promises, we can combine the reliable nature of promises with the sequential nature of generators to achieve safe, trustable, asynchronous code.

```javascript
run(gen());

function *gen() {
  // concurrent ("parallel") requests
  const p1 = getData(30);
  const p2 = getData(10);

  // obtain results from our async request by yielding promises
  const value1 = yield p1;
  const value2 = yield p2;   

  console.log(`The meaning of life is ${value1 + value2}`);
}

// run promises in order (recursively)
function run(iter, prev) {
  let result = iter.next(prev).value;
  if (result) {
    result.then(function(file) {
      run(iter, file);
    });
  }
}

// promise wrapper
function getData(d) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(1 + d);
    }, 1000);
  });
}
```

[Problem](https://github.com/nem035/js-async-fun#problem) [Solution using generators](https://nem035.github.io/js-async-fun/#generators)
