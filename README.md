# JS-Async-Fun
Fun with Asynchronous JavaScript using various patterns to solve the following problem

## Problem

> Request `file1`, `file2` and `file3` **at the same time** (in "parallel")

> **Render them ASAP** (don't just blindly wait for all to finish loading)

> **Render them in proper (obvious) order**: `file1`, `file2`, `file3`.

> Output the string ``"Complete!"`` after all files are rendered.

## [Problem Solutions & Tests](https://nem035.github.io/js-async-fun/)

## Async Patterns

### Callbacks (Hell)

**TLDR;**

Although being the building blocks of asynchronous programming, callbacks on their own have 2 core deficiencies:

- Inversion of Control (we don't know if/when/how many times our code is called - its outside of our control)
- Non-sequential (un)reasoning (we don't know in what order separate callbacks have executed)

**More in depth**

Callbacks requires us to maintain some sort of state to ensure our reactions to those callbacks happen in a certain order.

Callbacks introduce what is known as Inversion of Control where the code is conceptually split into two parts:

- the one we execute first, and
- the callbacks which get handed off to the another party (control inversion) to be executed some time later

```javascript
// first half
setTimeout(function() {
  // second half
  // we are not in control if/when/how this gets executed
});
```

This introduces trust issues with the other party executing our callback. We have to trust that they will call it in the exact way we need them to and exactly as many times as we need them to but we have no guarantees on how the code actually gets called and if it gets called at all.

If we are executing multiple asynchronous code blocks, each with their own callback, the callbacks themselves do not provide us with a mechanism to "react" to their results in a sequential manner, other than nesting them within one another which would defy the purpose of parallel (concurrent) asynchronous code since each async block would wait on previous before running.

```javascript
getThingOneAsynchronously(function(value1) {
  // here we have value 1
});

getThingTwoAsynchronously(function(value2) {
  // here we have value 2
});

// What about code that needs both `value1` and `value2`?
```

[Problem](https://github.com/nem035/js-async-fun#problem) [Solution using callbacks](https://nem035.github.io/js-async-fun/#callbacks)

### Thunks

**TLDR;**

Thunks are functions that tackle the issue of async programming by **eliminating time as a concern** and serving as wrappers for values obtained in an async manner. They achieve this by wrapping the async code and the callback in a closure and call the callback only after the value is received. Unlike plain callbacks, thunks return immediately but call the callback provided to them later, once their internal async operation provides a value.

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

thunk(); // 25
thunk(); // 25
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
  sum; // 25
});
```

Thunks produce **time-independent** wrappers around values and are the basis for promises.

Additionally, thunks can be lazy or active.

- A lazy thunk is a thunk that computes its value the first time it is called, then returns it on all subsequent calls.
- An active thunk is a thunk that computes its value when created and then returns it on all subsequent calls.

```javascript
// asynchronous active thunk
function add(cb) {
  let x, y, fn;

  // async code that
  // - calls the callback with the results if the results were already requested, or
  // - caches its results in the closure variables
  setTimeout(function(a, b) {
    if (fn) {
      fn(a + b);
    } else {
      x = 10;
      y = 15;
    }
  }, 3000);

  // function that
  // calls the callback if the results were already received, or
  // caches the callback in the closure variable
  return function(cb) {
    if (x && y) {
      cb(x + y);
    } else {
      fn = cb;
    }
  }
}

add(function(sum) {
  sum; // 25
});
```

[Problem](https://github.com/nem035/js-async-fun#problem) [Solution using thunks](https://nem035.github.io/js-async-fun/#thunks)

### Promises

**TLDR;**

Promises are wrappers for future values. They:
- **eliminate time as a concern** from async code by conceptually serving as an event listener for the `"then"` event
- **eliminate the issues of trust and of Inversion of Control** by serving as a callback manager, internally managing the execution of our callbacks in a reliable manner.

**More in depth**

Promises represent wrappers around future values. They un-invert
the Inversion of Control provided by callbacks, giving the control back to us.

A promise can be imagined as an event listener with a `then` event.

```javascript
let promise = getSomeDataWithPromise();
promise.then(function success() {
  // all is good
}, function fail() {
  // error
})
```

How do promises solve callback hell when they still use callbacks? Can't a promise just call my callback twice? Or not at all?

Promises are **guaranteed** to only be resolvable once, with either success OR error and are immutable once resolved. Meaning the code within a promise runs once. After resolving, the promise becomes bound to the value with which it resolved and cannot be changed.

```javascript
let promise = new Promise(function(resolve, reject) {
  resolve(1); // resolve once
  resolve(2); // resolve second time (this is ignored)
});
promise.then(function(result) {
  result; // 1
});
promise.then(function(result) {
  result; // still 1
});
```

In other words, a promise is a pattern for managing our callbacks in a **trustable** fashion.

Additionally, promises are chainable, providing cleaner, sequential looking async code,
which is easier to reason about and requires no nesting.

```javascript
// both request happen concurrently ("in parallel")
let thing1 = getThingOneAsynchronously();
let thing2 = getThingTwoAsynchronously();

thing1
.then(function(value1) {
  console.log('first: ' + value1);
})
.then(function() {
  return thing2;
})
.then(function(value2) {
  console.log('second: ' + value2);
})
.then(function() {
  // both thing1 and thing2 are finished here
  console.log('done');
});
```

What about a promise that never resolves? Well, the way to deal with this is similar to how we would deal with any async code that might never run, which is to setup a timer. A convenient method we can use for this is [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), which takes an array of promises and resolves as soon as any of them resolve (or reject).

```javascript
let p = trySomeAsyncThingThatMightNeverFinish();
let timer = new Promise(function(_, reject) {
  setTimeout(function() {
    reject('Timeout!');
  });
});

Promise.race([ p, timer ]).then( success, fail );
```
[Problem](https://github.com/nem035/js-async-fun#problem) [Solution using thunks](https://nem035.github.io/js-async-fun/#promises)

### Generators

**TLDR;**

Generators solve the problem of non-sequential reasoning in asynchronous programming by allowing us to write async code in a synchronous manner. When combined with promises, they adopt the trust and reliability of promises and provide an API to sequentially execute asynchronous code, using promises as wrappers for future values.

**More in depth**

If promises are there to solve the Inversion of Control problem, generators are there to solve the non-sequential reasoning problem.

For the most part, JS has the semantic where code **runs to completion**, which allows us to reason in a single-threaded fashion. However, **generators do not have a run to completion** semantic, generators provide a way to to pause and resume code execution.

In other words, generators allow us to syntactically declare state machines. Simply put, generators are functions that can be paused and resumed where the **pausing blocks code locally in the generator**, leaving all other code unaffected.

A generator function returns an iterator, which has a method `next` that, when
called, runs the generator to the first `yield` and returns the yielded value in
the form:

```javascript
{
  value: yieldedValue,
  done: false
}
```
The generator remains paused until next time we call `next` on it, which continues from the last `yield` and runs to the next one and so on. If no `yield` is found, generator returns anything that its function block returns as the `value` with the `done` flag set as `true`.

Besides being able to pause execution and provide data, generators can also receive data and resume execution. This is also done through the `next` method, where wi can pass values which are then returned from the currently paused `yield`.

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

Generators do not have to fully finish. It's completely ok to partially consume a generator.

Generators enable us to write synchronous looking asynchronous code.

```javascript
function *gen() {
  const a = 1 + (yield getData(30));
  const b = 1 + (yield getData(10));    
  console.log(`The meaning of life is ${a + b}`);
}

let iter = gen();
iter.next();

function getData(d) {
  setTimeout(function() {
    iter.next(d);
  }, 1000);
}
```

The same way thunks & promises factor out time as a concern, generators factor out asynchronicity itself as an issue. By combining generators and promises, we can combine the reliable nature of  promises with the sequential nature of generators to achieve safe, trustable, asynchronous code.

```javascript
function *gen() {
  const p1 = getData(30);
  const p2 = getData(10);
  const a = 1 + (yield p1);
  const b = 1 + (yield p2);    
  yield(`The meaning of life is ${a + b}`);
}

let iter = gen();
iter.next().value.then(function(val1) {
  iter.next(val1).value.then(function(val2) {
    console.log(iter.next(val2).value);        
  });
});

function getData(d) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(d);
    }, 1000);
  });
}
```

[Problem](https://github.com/nem035/js-async-fun#problem) [Solution using thunks](https://nem035.github.io/js-async-fun/#generators)
