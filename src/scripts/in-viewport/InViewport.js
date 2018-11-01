


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
        this.onResize = this.onResize.bind(this);

        if (!this.events) {
            window.addEventListener('resize', this.onResize, false);
            this.events = true;
        }
    }

    onResize() {
        this.refreshAll();
    }

    refresh() {
        // console.log('refresh', this.options, this.key);
        let rect = this.options.element.getBoundingClientRect();

        let ctop = this.context.top = 0;
        let cbot = this.context.bottom = window.innerHeight;

        let etop = this.options.element.top = rect.top;
        let ebot = this.options.element.bottom = rect.bottom;

        // console.table({ 'ctop': ctop, 'cbot': cbot, 'etop': etop, 'ebot': ebot} );

        let obj = {
            'all-in-viewport': Number(etop >= ctop && ebot <= cbot),
            'part-visible': Number(etop <= cbot && ebot >= ctop),
        };

        console.log(this.key, {
            key: this.key,
            all: obj["all-in-viewport"],
            part: obj["part-visible"],
            el: this.options.element
        });

        return obj;
        
    }

    refreshAll() {
        const instances = InViewport.allInstances;

        for (let key in instances) {
            instances[key].refresh();
        }
    }

    static refreshAll() {
        
        const instances = InViewport.allInstances;

        console.log('refreshAll', InViewport.allInstances);

        for (let key in instances) {
            instances[key].refresh();
        }
    }
}

export default InViewport;