/**
A thunk is a function that
already contains everything
it needs to perform its
purpose. It is a container
for its state and is fully
independent from the outside
world. Another way to think
of a thunk is a wrapper for
a value.

@example
// synchronous thunk
function add(x, y) {
  return x + y;
}

function thunk() {
  return add(10, 15);
}

An asynchronous thunk is the
same as a synchronous thunk
except instead of returning
a value, it accepts a callback
that will provide the value.
They produce **time-independent**
wrappers around values.

Thunks are the basis for Promises.

@example
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

We can create a function that will
create thunks for us

@example
function toThunk(fn, ...args) {
  return function(cb) {
    args.push(cb)
    fn(...args);
  }
}

function add(x, y, cb) {
  cb(x + y);
}

const thunk = toThunk(add, 10, 15);

thunk(function(sum) {
  sum; // 25
});
*/
function thunks() {

}
