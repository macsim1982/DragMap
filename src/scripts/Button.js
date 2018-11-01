const DEFAULT = {
    buttonSelector: '.button',
    bubbleSelector: ".bubble",
    
    bubbleHiddenClass: 'mcs-hidden',
    
    duration: 200,
};

class Button {
    constructor(options) {
        this.options = {
            buttonSelector: options.buttonSelector || DEFAULT.buttonSelector,
            bubbleSelector: options.bubbleSelector || DEFAULT.bubbleSelector,
            bubbleHiddenClass: options.bubbleHiddenClass || DEFAULT.bubbleHiddenClass,
            duration: options.duration || DEFAULT.duration,
        };

        this.button = document.querySelector(this.options.buttonSelector);
        this.bubble = this.button.querySelector(this.options.bubbleSelector);

        this.hideBubble();

        this.initialize();
    }
    initialize() {
        

        this.addEvents(true);
    }
    hideBubble() {
        console.log('hideBubble');
        this.bubble.classList.add(this.options.bubbleHiddenClass);
    }
    showBubble() {
        console.log('showBubble');
        this.bubble.classList.remove(this.options.bubbleHiddenClass);
    }
    toggleBubble() {
        console.log('toggleBubble');
        this.bubble.classList.toggle(this.options.bubbleHiddenClass);
    }
    addEvents() {
        this.addOrRemoveEvents(true);
    }
    removeEvents() {
        this.addOrRemoveEvents(false);
    }
    addOrRemoveEvents(add) {

        if (add) {
            this.handleClick = this.handleClick.bind(this);
        }

        var addOrRemove = (add ? 'add' : 'remove') + 'EventListener';

        this.button[addOrRemove]('click', this.handleClick, false);
    }
    handleClick(evt) {
        let target = evt.target;

        if (!target) return false;

        
        this.bubble.style.left = evt.pageX - (this.button.offsetLeft - this.button.offsetParent.offsetLeft) + 'px';
        this.bubble.style.top = evt.pageY - (this.button.offsetTop - this.button.offsetParent.offsetTop) + 'px';

        this.toggleBubble();

        setTimeout(() => {
            this.toggleBubble();
        }, 200);
    }
}

export default Button;