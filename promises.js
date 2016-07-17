function promises() {

  start('promises');

  const promise1 = getFile('file1');
  const promise2 = getFile('file2');
  const promise3 = getFile('file3');

  promise1.then(contents1 => {
    renderPromise('file1', contents1);
  }).then(() => {
    return promise2;
  }).then(contents2 => {
    renderPromise('file2', contents2);
  }).then(() => {
    return promise3;
  }).then(contents3 => {
    renderPromise('file3', contents3);
  }).then(() => {
    finish('promises');
  });

  // A promise maker
  function getFile(file) {
    return new Promise(resolve => {
      fakeAjaxPromise(file, resolve);
    });
  }
}

function promisesArray() {
  start('promisesArray');

  [ 'file1', 'file2', 'file3' ]
    .map(getFile)
    .reduce((chain, promise, idx) => {
      return chain.then(() => {
        return promise;
      }).then((contents) => {
        renderPromiseArray(`file${idx + 1}`, contents);
      });
    }, Promise.resolve()).then(() => {
      finish('promisesArray');
    });

  // A promise maker
  function getFile(file) {
    return new Promise(resolve => {
      fakeAjaxPromiseArray(file, resolve);
    });
  }
}
