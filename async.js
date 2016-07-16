/**
Exercise 1:

This exercise calls for you to write some async flow-control
code. To start of with, you'll use callbacks only.

Expected behavior:
  - Request all 3 files at the same time (in "parallel")
  - Render them ASAP (don't just blindly wait for all to finish
  loading)
  - BUT, render them in proper (obvious) order: "file1",
  "file2", "file3".
  - After all 3 are done, output "Complete!"
*/

function exercise1() {

  const files = ['file1', 'file2', 'file3'];

  const texts = files.reduce((obj, file) => {
    obj[file] = undefined;
    return obj;
  }, {});

  const renders = files.reduce((obj, file) => {
    obj[file] = false;
    return obj;
  }, {});

  const rendered = x => renders[x];
  const allRendered = () => files.every(file => rendered(file));

  const text = x => texts[x];
  const received = x => text(x) !== undefined;

  function getFile(file) {

    fakeAjax(file, function(text) {

      texts[file] = text;

      if (file === 'file1') {
        renderFile('file1');
        if (received('file2')) {
          renderFile('file2');
          if (received('file3')) {
            renderFile('file3');
          }
        }
      } else if (file === 'file2') {
        if (rendered('file1')) {
          renderFile('file2');
          if (received('file3')) {
            renderFile('file3');
          }
        }
      } else if (file === 'file3') {
        if (rendered('file1') && rendered('file2')) {
          renderFile('file3');
        }
      }
    });
  }

  // request all files at once
  start();
  files.forEach(file => {
    getFile(file);
  });

  function renderFile(file) {
    renders[file] = true;
    render(file, text(file));

    if (allRendered()) {
      finish();
    }
  }
}
