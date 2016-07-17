function generators() {
  start('generators');

  run(generator());

  // A generator
  function* generator() {

    // parallel requests
    const promise1 = getFile('file1');
    const promise2 = getFile('file2');
    const promise3 = getFile('file3');

    // sequential renders
    renderGenerator('file1', yield promise1);
    renderGenerator('file2', yield promise2);
    renderGenerator('file3', yield promise3);

    finish('generators');
  }

  // A generator runner
  function run(iter, prev) {
    let promise = iter.next(prev).value;
    if (promise) {
      promise.then(file => {
        run(iter, file);
      });
    }
  }

  // A promise maker
  function getFile(file) {
    return new Promise(resolve => {
      fakeAjaxGenerator(file, resolve);
    });
  }
}
