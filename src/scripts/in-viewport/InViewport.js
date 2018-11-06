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

    onChangeViewportCB(key, previous, current, viewport) {
        // on change viewport callback...
        this.options.element.classList[current === 1 ? 'add' : 'remove'](key);

        // console.log(this.key, key, previous, current);


            // viewport[key][0] && console.log('leave to ' + key);
            // viewport[key][1] && console.log('enter from ' + key);

        if (this.options.element && !this.isAnimating) {
            for (let k in viewport) {
                if (viewport[k][1]) {
                    console.log(this.key, key, k, previous, current);
                    this.addClassAndRemoveOnAnimationEnd(NAMESPACE + '--enter-from-' + k, 300);
                }

                if (viewport[k][0]) {
                    console.log(this.key, key, k, previous, current);
                    this.addClassAndRemoveOnAnimationEnd(NAMESPACE + '--leave-to-' + k, 300);
                }
            }
        }


    }

    addClassAndRemoveOnAnimationEnd(className, duration) {
        this.isAnimating = true;

        this.options.element.classList.add(className);

        const timeOut = setTimeout(() => {
            this.options.element.classList.remove(className);
            this.isAnimating = false;

            clearTimeout(timeOut);
        }, duration);
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
        const context = (this.options.context === 'window') ? document.documentElement : this.options.context;
        const element = this.options.element;

        let elRect = element.getBoundingClientRect();
        let ctxRect = context.getBoundingClientRect();

        // console.table({ 'ctop': ctop, 'cbot': cbot, 'etop': etop, 'ebot': ebot} );

        let obj = {
            [NAMESPACE + '--all-in-viewport']: Number(elRect.top >= ctxRect.top && elRect.bottom <= ctxRect.bottom && elRect.left >= ctxRect.left && elRect.right <= ctxRect.right),
            [NAMESPACE + '--part-visible']: Number(elRect.top <= ctxRect.bottom && elRect.bottom >= ctxRect.top && elRect.left <= ctxRect.right && elRect.right >= ctxRect.left),
        };

        // Refresh only if something has change
        for (let k in obj) {
            if (typeof this.obj === 'object') {
                if (this.obj[k] !== obj[k]) {
                    const viewport = this.calculate(this.ctxRect, this.elRect, ctxRect, elRect);

                    this.onChange(k, this.onChangeViewportCB.bind(this, k, this.obj[k], obj[k], viewport));
                }
            }
        }

        this.elRect = elRect;
        this.ctxRect = ctxRect;
        this.obj = Object.assign({}, obj);

        return obj;
    }

    calculate(pc, pe, cc, ce) {
        function calculate(a, b, c, d) {
            return [a >= b && c < d, c >= d && a < b];
        }

        let top = calculate(cc.top, ce.bottom, pc.top, pe.bottom);
        let left = calculate(cc.left, ce.right, pc.left, pe.right);
        let right = calculate(pc.right, pe.left, cc.right, ce.left);
        let bottom = calculate(pc.bottom, pe.top, cc.bottom, ce.top);

        return {
            top, right, bottom, left
        };
    }

    refreshAll() {
        InViewport.refreshAll();
    }

    static refreshAll() {
        const instances = InViewport.allInstances;

        for (let key in instances) {
            instances[key].refresh();
        }
    }
}

export default InViewport;
