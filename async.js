/**
Expected behavior:
  - Request all 3 files at the same time (in "parallel")
  - Render them ASAP (don't just blindly wait for all to finish
  loading)
  - BUT, render them in proper (obvious) order: "file1",
  "file2", "file3".
*/

function exercise1() {

  const files = ['file1', 'file2', 'file3'];

  const responses = toFileObject(undefined);
  const renders = toFileObject(false);

  const rendered = x => renders[x];
  const allRendered = () => files.every(file => rendered(file));

  const contents = x => responses[x];
  const received = x => contents(x) !== undefined;

  function getFile(file) {
    fakeAjax(file, function(contents) {

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

  start();
  files.forEach(file => {
    getFile(file);
  });

  function toFileObject(val) {
    return files.reduce((obj, file) => {
      obj[file] = val;
      return obj;
    }, {});
  }

  function renderFile(file) {
    renders[file] = true;
    render(file, contents(file));

    if (allRendered()) {
      finish();
    }
  }
}
