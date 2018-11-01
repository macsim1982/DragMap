


import {
    SEPARATOR
} from "./constants";

import Context from './Context';

const DEFAULT_OPTIONS = {
    context: 'window'
};

const NAMESPACE = 'in-viewport';

let keyCounter = 0;

export let allInstances = [];

export default class InViewport {
    constructor(options) {
        this.key = NAMESPACE + SEPARATOR + keyCounter;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        
        this.context = Context.findOrCreateByElement(this.options.element);
        this.context.add(this);

        allInstances[this.key] = this;

        

        this.bindEvents();

        keyCounter++;
        
    }

    bindEvents() {
        this.onResize = this.onResize.bind(this);

        if (!this.events) {
            window.addEventListener('resize', this.onResize, false);
            this.events = true;
        }
    }

    onResize() {
        Context.refreshAll();
    }

    static refreshAll() {
        Context.refreshAll();
    }
}