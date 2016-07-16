function callbacks() {

  const responses = toFileObject(() => undefined);
  const renders = toFileObject(() => false);

  const rendered = x => renders[x];
  const allRendered = () => files.every(file => rendered(file));

  const contents = x => responses[x];
  const received = x => contents(x) !== undefined;

  start('callbacks');
  files.forEach(file => {
    getFile(file);
  });

  function getFile(file) {
    fakeAjax('callbacks', file, function(contents) {

      // store the current file response
      responses[file] = contents;

      // go through all the files
      // for each file, in order,
      // if it wasn't received
      // stop the loop
      // otherwise continue looping
      // and render unrendered files
      files.every(file => {
        if (received(file)) {
          if (!rendered(file)) {
            renderFile(file);
          }
          return true;
        } else {
          return false;
        }
      });
    });
  }

  function renderFile(file) {
    renders[file] = true;
    render('callbacks', file, contents(file));

    if (allRendered()) {
      finish('callbacks');
    }
  }
}
