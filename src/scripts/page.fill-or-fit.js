'use strict';

if (module.hot) {
  module.hot.accept();
}

import '../styles/fill-or-fit/index.scss';

import InViewport from './in-viewport/InViewport';
import { OutOfViewport } from './fill-or-fit.js';
import fillOrFit from './fill-or-fit.js';

document.addEventListener("DOMContentLoaded", function (event) {

  fillOrFit.initialize();

  const $elements = document.querySelectorAll('.check-viewport, .container, .other-container');
  new OutOfViewport($elements);

  document.querySelector('.addAll').addEventListener('click', function () {
    const $items = document.querySelectorAll('.container');
    fillOrFit.activateInstances($items, { childSelector: '.video' });
  }, false);

  document.querySelector('.addAllOther').addEventListener('click', function () {
    const $itemsOther = document.querySelectorAll('.other-container');
    for (let $el of $itemsOther) {
      fillOrFit.activateInstance($el);
    }
  }, false);

  document.querySelector('.removeAll').addEventListener('click', function () {
    fillOrFit.destroy();
  }, false);
});
