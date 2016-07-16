function promises() {

  start('promises');

  const promise1 = getFile('file1');
  const promise2 = getFile('file2');
  const promise3 = getFile('file3');

  promise1.then(contents1 => {
    renderFile('file1', contents1);
  }).then(() => {
    return promise2;
  }).then(contents2 => {
    renderFile('file2', contents2);
  }).then(() => {
    return promise3;
  }).then(contents3 => {
    renderFile('file3', contents3);
  }).then(() => {
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
