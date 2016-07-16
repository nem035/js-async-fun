const renderDelay = 100;

function fakeAjax(file, cb) {
  const fakeResponses = {
    file1: 'The first text',
    file2: 'The middle text',
    file3: 'The last text'
  };

  const randomDelay = (Math.round(Math.random() * 1E4) % 8000) + 1000;
  load(file, randomDelay);
  console.info();
  setTimeout(function() {
    receive(file);
    cb(fakeResponses[file]);
  }, randomDelay);
}

function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function findChildByClass({ childNodes }, cls) {
  return Array.from(childNodes)
    .find(node =>
      node.className !== undefined &&
      node.className.indexOf(cls) !== -1
    );
}

function render(file, text) {
  setTimeout(() => {
    log(`Rendered ${file}: ${text}`);
    const fileBox = document.querySelector(`.file.${file}`);
    fileBox.appendChild(document.createTextNode(text));
    fileBox.className += ' rendered';
  }, renderDelay);
}

function receive(file) {
  log(`Received ${file}`);
  const logBox = document.querySelector(`.timer.${file}.loading`);
  logBox.className = logBox.className.replace('loading', 'received');
}

function load(file, ms) {
  log(`Requesting: ${file}. Response time: ${ms}`);
  const logBox = document.querySelector(`.timer.${file}.received`);
  logBox.className = logBox.className.replace('received', 'loading');
  const loader = findChildByClass(logBox, 'loader');
  setTimeout(() => {
    loader.style.transitionDuration = `${ms + renderDelay}ms`;
    loader.className += ' animating';
  }, renderDelay);
}

function log(msg) {
  console.info(msg);
}

function nodes(cls) {
  return Array.from(document.querySelectorAll(cls));
}

function initRenders() {
  nodes('.item.file').forEach(node => {
    removeChildren(node);
    node.className = node.className.replace('rendered', '');
  });
}

function initLogs() {
  nodes('.item.timer').forEach((node, idx) => {
    node.className = `item file${idx + 1} timer received`;
    const loader = findChildByClass(node, 'loader');
    loader.style.transitionDuration = '0ms';
    loader.className = loader.className.replace('animating', '');
  });
}

function start() {
  document.querySelector('button.run').disabled = true;
  initRenders();
  initLogs();
};

function finish() {
  document.querySelector('button.run').disabled = false;
}
