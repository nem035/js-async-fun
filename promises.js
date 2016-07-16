/**
Promises are wrappers around
future values. They un-invert
the Inversion of Control,
provided by callbacks, giving
the control back to us.

A Promise can be imagined as
an event listener with a `then`
event.

<pre>let promise = getSomeDataWithPromise();

promise.then(function success() {
  // wheee
}, function fail() {
  // aughhh
})</pre>

How do Promises solve callback hell
when they still use callbacks? Can't
a Promise just call my callback twice?
Or not at all?

Promises are only guaranteed to only be
resolved once, with either success OR
error and are immutable once resolved.

<pre>var promise = new Promise((resolve, reject) => {
  resolve(1); // resolve once
  resolve(2); // resolve second time (this is ignored)
});

promise.then((result) => {
  result; // 1
});

promise.then((result) => {
  result; // still 1
});</pre>

In other words, a Promise is a pattern
for managing our callbacks in a trustable
fashion.

Promises are chainable!
*/
function promises() {

  start('promises');

  const promise1 = getFile('file1');
  const promise2 = getFile('file2');
  const promise3 = getFile('file3');

  promise1.then(contents1 => {
    renderFile('file1', contents1);
    return promise2;
  }).then(contents2 => {
    renderFile('file2', contents2);
    return promise3;
  }).then(contents3 => {
    renderFile('file3', contents3);
    finish('promises');
  });

  // A promise maker
  function getFile(file) {
    return new Promise(resolve => {
      fakeAjax('promises', file, resolve);
    });
  }

  function renderFile(file, contents) {
    render('promises', file, contents);
  }
}
