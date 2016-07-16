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
function makeThunk(fn, ...args) {
  return function(cb) {
    args.push(cb)
    fn(...args);
  }
}

function add(x, y, cb) {
  cb(x + y);
}

const thunk = makeThunk(add, 10, 15);

thunk(function(sum) {
  sum; // 25
});

An active thunk is a thunk that
precomputes its value when created
and then returns it on all
subsequent calls.

A lazy thunk is a thunk that
computes its value the first
time it is called, then
returns it on all subsequent
calls.
*/
function thunks() {

  start('thunks');

  const thunkFile1 = getFile('file1');
  const thunkFile2 = getFile('file2');
  const thunkFile3 = getFile('file3');

  thunkFile1(contents1 => {
    renderFile('file1', contents1);
    thunkFile2(contents2 => {
      renderFile('file2', contents2);
      thunkFile3(contents3 => {
        renderFile('file3', contents3);
        finish('thunks');
      });
    });
  });

  // A thunk maker that caches the
  // callback or the response,
  // depending on which is obtained
  // first and executes the callback
  // with the response, once both are
  // received
  function getFile(file) {
    let contents;
    let callback;
    fakeAjax('thunks', file, (response) => {
      if (callback === undefined) {
        contents = response;
      } else {
        callback(response);
      }
    });
    return function(cb) {
      if (contents === undefined) {
        callback = cb;
      } else {
        cb(contents);
      }
    };
  }

  function renderFile(file, contents) {
    render('thunks', file, contents);
  }
}
