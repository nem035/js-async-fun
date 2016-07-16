const renderDelay = 100;

function fakeAjax(file, cb) {
  const fakeResponses = {
    file1: 'file1',
    file2: 'file2',
    file3: 'file3'
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
  const timer = document.querySelector(`.timer.${file}.loading`);
  const loader = findChildByClass(timer, 'loader');
  setTimeout(() => {
    loader.className += ' finished';
    timer.className += ' done';
  }, renderDelay);
  timer.className = timer.className.replace('loading', 'received');
}

function load(file, ms) {
  log(`Requesting: ${file}. Response time: ${ms}`);
  const timer = document.querySelector(`.timer.${file}.received`);
  timer.className = timer.className.replace('received', 'loading');
  const loader = findChildByClass(timer, 'loader');
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
  nodes('.file').forEach(node => {
    removeChildren(node);
    node.className = node.className.replace('rendered', '');
  });
}

function initLogs() {
  nodes('.timer').forEach((timer, idx) => {
    timer.className = `item file${idx + 1} timer received`;
    const loader = findChildByClass(timer, 'loader');
    loader.style.transitionDuration = '0ms';
    loader.className = loader.className.replace('animating', '');
    loader.className = loader.className.replace('finished', '');
  });
}

function start() {
  console.log('------ Callbacks ------');
  document.querySelector('button.run').disabled = true;
  initRenders();
  initLogs();
};

function finish() {
  document.querySelector('button.run').disabled = false;
}
