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

  const allRendered = () => files.every(file => rendered[file]);

  files.forEach(file => {
    getFile(file);
  });

  function getFile(file) {
    fakeAjax('callbacks', file, function(response) {

      // store the current file response
      contents[file] = response;

      // go through all the files
      // for each file, in order,
      // if it wasn't received
      // stop the loop
      // otherwise continue looping
      // and render unrendered files
      files.every(file => {
        if (contents[file]) {
          if (!rendered[file]) {
            rendered[file] = true;
            renderFile(file, contents[file]);
            if (allRendered()) {
              finish('callbacks');
            }
          }
          return true;
        } else {
          return false;
        }
      });
    });
  }

  function renderFile(file, contents) {
    render('callbacks', file, contents);
  }
}
