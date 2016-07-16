/**
Callbacks requires us to maintain
some sort of state to ensure our
reactions to those callbacks happen
in certain order.

Callbacks introduce what is known as
Inversion of Control where the code
is conceptually split into two parts:

- the one we execute first, and
- the callbacks which get handed
off to the another party (control
inversion) to be executed some time
later

<pre>
// first half
later(() => {
  // second half
  // we are not in control
  // if/when this gets executed
});
</pre>

This introduces trust issues with the
other party executing our callback. We
have to trust that they will call it
in the exact way we need them to and
exactly as many times as we need them
to but we have no guarantess on how
the code actually gets called and if
it gets called at all.
*/
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
