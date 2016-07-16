function thunks() {

  start('thunks');

  const thunk1 = getFile('file1');
  const thunk2 = getFile('file2');
  const thunk3 = getFile('file3');

  thunk1(contents1 => {
    renderThunk('file1', contents1);
    thunk2(contents2 => {
      renderThunk('file2', contents2);
      thunk3(contents3 => {
        renderThunk('file3', contents3);
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
}
