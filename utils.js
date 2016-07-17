const renderDelay = 100;

function fakeAjax(card, file, cb) {
  const fakeResponses = {
    file1: 'file1',
    file2: 'file2',
    file3: 'file3'
  };

  const randomDelay = (Math.round(Math.random() * 1E4) % 5000) + 2000;
  load(card, file, randomDelay);
  console.info();
  setTimeout(() => {
    receive(card, file);
    cb(fakeResponses[file]);
  }, randomDelay);
}

function log(msg) {
  console.info(msg);
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

function toggleCode(card) {
  const { style: code } = document.querySelector(`.card.${card} .code-container`);
  const btnCaret = document.querySelector(`.card.${card} button.code span`);
  if (!code.display || code.display === 'none') {
    code.display = 'block';
    btnCaret.innerHTML = '&#9660';
  } else {
    code.display = 'none';
    btnCaret.innerHTML = '&#9650';
  }
}

function render(card, file, text) {
  setTimeout(() => {
    log(`Rendered ${file}: ${text}`);
    const fileBox = document.querySelector(`.card.${card} .file.${file}`);
    fileBox.appendChild(document.createTextNode(text));
    fileBox.className += ' rendered';
  }, renderDelay);
}

function rendererFactory(type) {
  return function(file, contents) {
    render(type, file, contents);
  };
}

const renderCallback = rendererFactory('callbacks');
const renderThunk = rendererFactory('thunks');
const renderPromise = rendererFactory('promises');
const renderGenerator = rendererFactory('generators');

function fakeAjaxFactory(type) {
  return function(file, contents) {
    fakeAjax(type, file, contents);
  };
}

const fakeAjaxCallback = fakeAjaxFactory('callbacks');
const fakeAjaxThunk = fakeAjaxFactory('thunks');
const fakeAjaxPromise = fakeAjaxFactory('promises');
const fakeAjaxGenerator = fakeAjaxFactory('generators');

function receive(card, file) {
  log(`Received ${file}`);
  const timer = document.querySelector(`.card.${card} .timer.${file}.loading`);
  const loader = findChildByClass(timer, 'loader');
  setTimeout(() => {
    loader.className += ' finished';
    timer.className += ' done';
  }, renderDelay);
  timer.className = timer.className.replace('loading', 'received');
}

function load(card, file, ms) {
  log(`Requesting: ${file}. Response time: ${ms}`);
  const timer = document.querySelector(`.card.${card} .timer.${file}.received`);
  timer.className = timer.className.replace('received', 'loading');
  const loader = findChildByClass(timer, 'loader');
  setTimeout(() => {
    loader.style.transitionDuration = `${ms + renderDelay}ms`;
    loader.className += ' animating';
  }, renderDelay);
}

function nodes(cls) {
  return Array.from(document.querySelectorAll(cls));
}

function initRenders(card) {
  nodes(`.card.${card} .file`).forEach(node => {
    removeChildren(node);
    node.className = node.className.replace('rendered', '');
  });
}

function initLogs(card) {
  nodes(`.card.${card} .timer`).forEach((timer, idx) => {
    timer.className = `item file${idx + 1} timer received`;
    const loader = findChildByClass(timer, 'loader');
    loader.style.transitionDuration = '0ms';
    loader.className = loader.className.replace('animating', '');
    loader.className = loader.className.replace('finished', '');
  });
}

function start(card) {
  log(`------ ${card} ------`);
  document.querySelector(`.card.${card} button.run`).disabled = true;
  initRenders(card);
  initLogs(card);
};

function finish(card) {
  setTimeout(() => {
    document.querySelector(`.card.${card} button.run`).disabled = false;
    log('Complete!');
  }, renderDelay);
}
