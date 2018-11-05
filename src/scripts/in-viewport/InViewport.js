import Context from './Context';
import {
    SEPARATOR
} from "./constants";

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


const DEFAULT_OPTIONS = {
    context: 'window'
};

const NAMESPACE = 'in-viewport';

let keyCounter = 0;
export let allInstances = [];

class InViewport {
    constructor(options) {
        this.key = NAMESPACE + SEPARATOR + keyCounter;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);

        if (this.options.element && !allInstances[this.key]) {
            this.context = Context.findOrCreateByElement(this.options.element);
            this.context.add(this);

            allInstances[this.key] = this;
            InViewport.allInstances = allInstances;

            this.bindEvents();

            keyCounter++;
        }
    }


    bindEvents() {
        this.debouncedResize = debounced(200, this.onResize.bind(this));
        this.throttledScroll = throttled(10, this.onScroll.bind(this));

        window.addEventListener('resize', this.debouncedResize, false);
        document.addEventListener('scroll', this.throttledScroll, false);
    }

    unbindEvents() {
        window.removeEventListener('resize', this.debouncedResize, false);
        document.removeEventListener('scroll', this.throttledScroll, false);
    }

    onChangeViewportCB(key, previous, current) {
        // on change viewport callback...
        this.options.element.classList[current === 1 ? 'add' : 'remove'](key);
    }

    onChange(type, cb) {
        if (type && cb && typeof cb === 'function') {
            cb();
        }
    }

    onResize() {
        this.refreshAll();
    }

    onScroll() {
        this.refreshAll();
    }



    refresh() {
        // console.log('refresh', this.options, this.key);

        let rect = this.options.element.getBoundingClientRect();

        const c = {
            top: 0,
            bottom: window.innerHeight,
            left: 0,
            right: window.innerWidth
        };

        const el = {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right
        };

        // console.table({ 'ctop': ctop, 'cbot': cbot, 'etop': etop, 'ebot': ebot} );

        let obj = {
            'context': c,
            'el': el,
            'all-in-viewport': Number(el.top >= c.top && el.bottom <= c.bottom && el.left >= c.left && el.right <= c.right),
            'part-visible': Number(el.top <= c.bottom && el.bottom >= c.top && el.left <= c.right && el.right >= c.left),
        };

        // Refresh only if something has change
        for (let k in obj) {
            if (typeof this.obj === 'object') {
                if (this.obj[k] !== obj[k]) {
                    this.onChange(k, this.onChangeViewportCB.bind(this, k, this.obj[k], obj[k]));
                }
            }
        }

        // console.log(this.key, {
        //     key: this.key,
        //     all: obj["all-in-viewport"],
        //     part: obj["part-visible"],
        //     el: this.options.element
        // });

        this.obj = Object.assign({}, obj);

        return obj;
    }

    refreshAll() {
        const instances = InViewport.allInstances;

        for (let key in instances) {
            instances[key].refresh();
        }
    }

    static refreshAll() {
        // console.log('refreshAll', InViewport.allInstances);

        const instances = InViewport.allInstances;

        for (let key in instances) {
            instances[key].refresh();
        }
    }
}

export default InViewport;
