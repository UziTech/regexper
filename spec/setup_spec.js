import util from '../src/js/util.js';

// Setup (and teardown) SVG container template
beforeEach(function() {
  const template = document.createElement('script');
  template.setAttribute('type', 'text/html');
  template.setAttribute('id', 'svg-container-base');
  template.innerHTML = [
    '<div class="svg"><svg></svg></div>',
    '<div class="progress"><div></div></div>',
  ].join('');
  document.body.appendChild(template);

  this.testablePromise = function() {
    const result = {};

    result.promise = new Promise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
    });

    return result;
  };
});

afterEach(function() {
  document.body.removeChild(document.body.querySelector('#svg-container-base'));
});

// Spy on util.track to prevent unnecessary logging
beforeEach(function() {
  spyOn(util, 'track');
});
