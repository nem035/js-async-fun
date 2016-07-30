function callbacks() {

  start('callbacks');

  const files = ['file1', 'file2', 'file3'];

  // map containing contents of each file
  const contents = {
    file1: undefined,
    file2: undefined,
    file3: undefined
  };

  // map containing a flag indicating if file is rendered
  const rendered = {
    file1: false,
    file2: false,
    file3: false
  };

  files.forEach(file => {
    getFile(file);
  });

  function getFile(file) {
    fakeAjaxCallback(file, function(response) {

      // store the current file response
      contents[file] = response;

      // go through all the files
      // for each file, in order,
      // if it wasn't received
      // stop the loop
      // otherwise continue looping
      // and render unrendered files
      const allRendered = files.every(file => {
        if (contents[file]) {
          if (!rendered[file]) {
            rendered[file] = true;
            renderCallback(file, contents[file]);
          }
          return true;
        } else {
          return false;
        }
      });

      if (allRendered) {
        finish('callbacks');
      }
    });
  }
}
