import { allInstances } from "./InViewport";
import { SEPARATOR } from "./constants";

const NAMESPACE = 'in-viewport-context';

let keyCounter = 0;
export let contexts = {};

export default class Context {
    constructor(options) {
        this.key = NAMESPACE + SEPARATOR + keyCounter;

        contexts[this.key] = this;

        keyCounter++;
    }

    add(inViewport) {
        allInstances[inViewport.key] = inViewport;
        this.refresh();
    }

    refresh() {
        console.log('refresh', this.key, contexts, allInstances, Context);
    }

    onResize() {
        Context.refreshAll();
    }

    static findOrCreateByElement(element) {
        return this.findByElement(element) || new Context(element);
    }

    static refreshAll() {
        for (var contextId in contexts) {
            contexts[contextId].refresh();
        }
    }

    static findByElement(element) {
        return contexts[element[this.key]];
    }
}