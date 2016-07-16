# JS-Async-Fun
Fun with Asynchronous JavaScript
<a name="callbacks"></a>

## callbacks()
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

<pre>// first half
later(() => {
  // second half
  // we are not in control
  // if/when this gets executed
});</pre>

This introduces trust issues with the
other party executing our callback. We
have to trust that they will call it
in the exact way we need them to and
exactly as many times as we need them
to but we have no guarantess on how
the code actually gets called and if
it gets called at all.

**Kind**: global function  
<a name="thunks"></a>

## thunks()
A thunk is a function that
already contains everything
it needs to perform its
purpose. It is a container
for its state and is fully
independent from the outside
world. Another way to think
of a thunk is a wrapper for
a value.

<pre>// synchronous thunk
function add(x, y) {
  return x + y;
}

function thunk() {
  return add(10, 15);
}</pre>

An asynchronous thunk is the
same as a synchronous thunk
except instead of returning
a value, it accepts a callback
that will provide the value.
They produce **time-independent**
wrappers around values.

Thunks are the basis for Promises.

<pre>// asynchronous thunk
function add(x, y, cb) {
  cb(x + y);
}

function thunk(cb) {
  return add(10, 15, cb);
}

thunk(function(sum) {
  sum; // 25
});</pre>

We can create a function that will
create thunks for us

<pre>function makeThunk(fn, ...args) {
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
});</pre>

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

<pre>// asynchronous active thunk
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
});</pre>

**Kind**: global function  
