# JS-Async-Fun
Fun with Asynchronous JavaScript using various patterns to solve the
following problem

> Request `file1`, `file2` and `file3` **at the same time** (in "parallel")
> **Render them ASAP** (don't just blindly wait for all to finish loading)
> **Render them in proper (obvious) order**: `file1`, `file2`, `file3`.

## Patterns

### Callbacks
Callbacks requires us to maintain
some sort of state to ensure our
reactions to those callbacks happen
in certain order.

Callbacks introduce what is known as
Inversion of Control where the code
is conceptually split into two parts:

- the one we execute first, and
- the callbacks which get handed
off to the another party (control
inversion) to be executed some time
later

```javascript
// first half
later(() => {
  // second half
  // we are not in control
  // if/when this gets executed
});
```

This introduces trust issues with the
other party executing our callback. We
have to trust that they will call it
in the exact way we need them to and
exactly as many times as we need them
to but we have no guarantess on how
the code actually gets called and if
it gets called at all.

<a name="thunks"></a>

### Thunks
A thunk is a function that
already contains everything
it needs to perform its
purpose. It is a container
for its state and is fully
independent from the outside
world. Another way to think
of a thunk is a wrapper for
a value.

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

An asynchronous thunk is the
same as a synchronous thunk
except instead of returning
a value, it accepts a callback
that will provide the value.

Thunks produce **time-independent**
wrappers around values.

Thunks are the basis for Promises.

```javascript
// asynchronous thunk
function add(x, y, cb) {
  cb(x + y);
}
function thunk(cb) {
  return add(10, 15, cb);
}
thunk(function(sum) {
  sum; // 25
});
```

Additionally, thunks can be
lazy or active.

A lazy thunk is a thunk that
computes its value the first
time it is called, then
returns it on all subsequent
calls.

An active thunk is a thunk that
pcomputes its value when created
and then returns it on all
subsequent calls.

```javascript
// asynchronous active thunk
function add(cb) {
  let x, y, fn;
  setTimeout((a, b) => {
    if (!fn) {
      x = 10;
      y = 15;
    } else {
      fn(a + b);
    }
  }, 3000);
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

<a name="promises"></a>

### Promises
Promises are wrappers around
future values. They un-invert
the Inversion of Control
provided by callbacks, giving
the control back to us.

A Promise can be imagined as
an event listener with a `then`
event.

```javascript
let promise = getSomeDataWithPromise();
promise.then(function success() {
  // all is good
}, function fail() {
  // error
})
```

How do Promises solve callback hell
when they still use callbacks? Can't
a Promise just call my callback twice?
Or not at all?

Promises are **guaranteed** to only be
resolved once, with either success OR
error and are immutable once resolved.
Meaning the code within a promise runs
once. After resolving, the Promise
becomes bound to the value with which
it was resolved or rejected and is
immutable.

```javascript
var promise = new Promise((resolve, reject) => {
  resolve(1); // resolve once
  resolve(2); // resolve second time (this is ignored)
});
promise.then((result) => {
  result; // 1
});
promise.then((result) => {
  result; // still 1
});
```

In other words, a Promise is a pattern
for managing our callbacks in a trustable
fashion.

Promises are chainable!
