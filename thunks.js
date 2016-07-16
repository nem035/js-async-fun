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

<pre>
// synchronous thunk
function add(x, y) {
  return x + y;
}

function thunk() {
  return add(10, 15);
}
</pre>

An asynchronous thunk is the
same as a synchronous thunk
except instead of returning
a value, it accepts a callback
that will provide the value.
They produce **time-independent**
wrappers around values.

Thunks are the basis for Promises.

<pre>
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
</pre>

We can create a function that will
create thunks for us

<pre>
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
</pre>

All of the above were examples
of lazy thunks.
A lazy thunk is a thunk that
computes its value the first
time it is called, then
returns it on all subsequent
calls.

On the other hand, an active thunk
is a thunk that precomputes its
value when created and then returns
it on all subsequent calls.

<pre>
// asynchronous active thunk
function add(x, y, cb) {
  cb(x + y);
}

function getFromServer(cb) {
  setTimeout(() => {
    cb(10, 15);
  }, 3000);
}

function makeActiveThunk() {
  let x, y, fn;
  getFromServer((a, b) => {
    if (!fn) {
      x = a;
      y = b;
    } else {
      fn(a + b);
    }
  });
  return function(cb) {
    if (x && y) {
      cb(x + y);
    } else {
      fn = cb;
    }
  }
}

const th = makeActiveThunk();
th(function(sum) {
  sum; // 25
});
</pre>
*/
function thunks() {

  start('thunks');

  const thunk1 = getFile('file1');
  const thunk2 = getFile('file2');
  const thunk3 = getFile('file3');

  thunk1(contents1 => {
    renderFile('file1', contents1);
    thunk2(contents2 => {
      renderFile('file2', contents2);
      thunk3(contents3 => {
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
