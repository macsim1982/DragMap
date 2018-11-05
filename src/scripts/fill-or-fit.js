function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date()).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

export class OutOfViewport {
  constructor($elements, options) {

    this.lastValues = [];
    this.$elements = $elements;
    this.debouncedResize = debounced(200, this.onResize.bind(this));
    this.throttledScroll = throttled(10, this.onScroll.bind(this));

    window.addEventListener('resize', this.debouncedResize, false);
    document.addEventListener('scroll', this.throttledScroll, false);

    this.checkViewport();
  }

  viewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  onChangeViewport($el, current, previous) {
    // if (current.top) {
    //   console.log('OUT OF VIEWPORT - leave to bottom');
    // }

    // if (current.bottom) {
    //   console.log('OUT OF VIEWPORT - leave to top');
    // }

    if (current.top || current.bottom) {
      $el.classList.remove('in-viewport');
    }

    if (!current.top && !current.bottom) {
      // if (previous && previous.top) {
      //   console.log('IN VIEWPORT - enter from bottom');
      // }
      // if (previous && previous.bottom) {
      //   console.log('IN VIEWPORT - enter from top');
      // }

      $el.classList.add('in-viewport');

    }
  }

  checkViewport() {
    let i = 0;
    for (let $el of this.$elements) {
      var isOut = this.isOutOfViewport($el);


      // console.log('checkViewport', $el, isOut != this.lastValues[i]);

      if (JSON.stringify(isOut) !== JSON.stringify(this.lastValues[i])) {
        this.onChangeViewport($el, isOut, this.lastValues[i]);
      }

      this.lastValues[i] = isOut;

      i++;
    }
  }

  isOutOfViewport($el) {
    if ($el) {
      var rect = $el.getBoundingClientRect();

      var outCheck = {};

      // outCheck.above = rect.top < 0;
      outCheck.top = rect.bottom < 0;
      // outCheck.below = rect.bottom > this.viewportHeight();
      outCheck.bottom = rect.top > this.viewportHeight();

      return outCheck;
    }
  }

  onResize() {
    this.checkViewport();
  }

  onScroll() {
    this.checkViewport();
  }
}

const crypto = window.crypto || window['msCrypto'];

function debounced(delay, fn) {
  let timerId;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => // eslint-disable-line
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
const DEFAULT_SELECTOR = '.js-fill-or-fit';

const DEFAULT_OPTIONS = {
  childSelector: '.js-fill-or-fit-child', // Selector that determine on which child to apply the fill or fit style
  fitMode: 'fill' // Determine which mode to apply on elements
};

let instances = [];

/**
 * Fill Or Fit class
 * @param $el       NodeElement on which to apply the fill or fit
 * @param options   See DEFAULT_OPTIONS to see which options are available
 */
class FillOrFit {
  constructor($el, options) {
    this.$wrapper = $el;

    if (this.$wrapper) {
      this.options = Object.assign({}, DEFAULT_OPTIONS, options);
      this.$child = this.$wrapper.querySelector(this.options.childSelector);

      if (this.$child) {
        this.initialize();
      }
    }
  }

  initialize() {
    this.fillOrFitId = uuidv4();
    this.initialSize = this.getInitialSize(this.$child);
    this.setParentStyle(this.$wrapper);
    this.setChildStyle(this.$child);
    this.fillOrFit(this.$wrapper, this.$child);
  }

  setParentStyle($el) {
    $el.style.position = 'relative';
    $el.style.overflow = 'hidden';
  }

  setChildStyle($el) {
    $el.style.position = 'absolute';
    $el.style.left = '50%';
    $el.style.top = '50%';
    $el.style.transform = 'translate(-50%, -50%)';
  }

  getInitialSize($el) {
    const rect = $el.getBoundingClientRect();

    return {
      width: rect.width,
      height: rect.height
    };
  }

  resetProperties($el, props) {
    for (let prop of props) {
      $el.style.removeProperty(prop);
    }
  }

  onResize() {
    this.fillOrFit(this.$wrapper, this.$child);
  }

  fillOrFit($wrapper, $child) {
    const rect = $wrapper.getBoundingClientRect();
    const parentWidth = rect.width;
    const parentHeight = rect.height;
    const parentRatio = parentWidth / parentHeight;
    const childRatio = this.initialSize.width / this.initialSize.height;
    const compare = (this.options.fitMode === 'fill') ? parentRatio > childRatio : parentRatio < childRatio;

    if (compare) {
      $child.style.width = parentWidth + 'px';
      $child.style.height = Math.round(parentWidth / childRatio) + 'px';
    } else {
      $child.style.width = Math.round(parentHeight * childRatio) + 'px';
      $child.style.height = parentHeight + 'px';
    }
  }

  desactivate() {
    this.resetProperties(this.$child, ['position', 'overflow', 'left', 'top', 'transform', 'width', 'height']);
    this.resetProperties(this.$wrapper, ['position', 'overflow']);

    delete this.fillOrFitId;
    delete this.initialSize;
  }
}

const fillOrFit = {
  initialize: function () {
    this.activateInstances(document.querySelectorAll(DEFAULT_SELECTOR), DEFAULT_OPTIONS);

    this.debouncedResize = debounced(200, this.onResize.bind(this));

    window.addEventListener('resize', this.debouncedResize, false);
  },

  activateInstances: function ($items, options) {
    for (let $el of $items) {
      if (!$el.fillOrFitId) {
        this.activateInstance($el, options);
      }
    }
  },

  activateInstance: function ($el, options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    let instance = new FillOrFit($el, {
      childSelector: $el.dataset.childSelector || options.childSelector,
      fitMode: $el.dataset.fitMode || options.fitMode
    });

    instances.push(instance);

    return instance;
  },

  desactivateInstance: function (index) {
    if (instances[index]) {
      instances[index].desactivate();
      instances.splice(index, 1);
    }
  },

  desactivateInstanceAtIndex: function (index) {
    this.desactivateInstance(index);
  },

  desactivateAllInstances: function () {
    while (instances.length > 0) {
      this.desactivateInstanceAtIndex(0);
    }
  },

  onResize: function () {
    for (let instance of instances) {
      instance.onResize();
    }
  },

  destroy: function () {
    this.desactivateAllInstances();
    window.removeEventListener('resize', this.debouncedResize, false);
  }
};

export default fillOrFit;
