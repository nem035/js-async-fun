function promises() {

  start('promises');

  // concurrent ("parallel") requests
  const promise1 = getFile('file1');
  const promise2 = getFile('file2');
  const promise3 = getFile('file3');

  // sequential rendering of files
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
