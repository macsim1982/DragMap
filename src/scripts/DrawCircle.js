class DrawCircle {
    constructor(options) {
        this.canDraw = true;
        this.map = options.map;
        this.boxes = [];
        this.minDeltaX = options.minDelta || options.minDeltaX || 0;
        this.maxDeltaX = options.maxDelta || options.maxDeltaX || 0;

        this.minDeltaY = options.minDelta || options.minDeltaY || this.minDeltaX;
        this.maxDeltaY = options.maxDelta || options.maxDeltaY || this.maxDeltaX;

        this.startX = options.x || -1;
        this.startY = options.y || -1;
        this.color = options.color || 'black';
        this.selector = options.selector || '#content';
        

        this.x = this.startX;
        this.y = this.startY;

        this.appendDom();

        this.eventElement = options.eventElement;

        this.addEvents(this.eventElement);
    }
    appendDom() {
        this.el = document.querySelector(this.selector);
    }
    addEvents(eventElement) {

        // Desktop
        this.el.addEventListener("mousedown", this.onTouchStart.bind(this));
        this.el.addEventListener("mousemove", this.onTouchMove.bind(this));
        this.el.addEventListener("mouseup", this.onTouchEnd.bind(this));
        this.el.addEventListener("mouseleave", this.onTouchEnd.bind(this));

        // Mobile
        eventElement.addEventListener("touchstart", this.onTouchStart.bind(this), {passive: false});
        eventElement.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
        eventElement.addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false });
        eventElement.addEventListener("touchcancel", this.onTouchCancel.bind(this));
    }
    onTouchStart(e) {
        // e.preventDefault();
        this.canDraw = true;

        this.timeout = setTimeout(() => {
            if (!this.canDraw) {
                clearTimeout(this.timeout);
                return;
            }

            this.onStartDrag(e);
        }, 200);
    }
    onStartDrag(e) {

        this.map && this.map.desactivate();

        this.isTouching = true;

        if (!e.changedTouches) {
            e.changedTouches = [{ pageX: e.pageX, pageY: e.pageY }];
        }

        this.startX = e.changedTouches[0].pageX;
        this.startY = e.changedTouches[0].pageY;

        this.appendChild(document.createElement("div"));

        this.el.lastChild && this.resetChildSize(this.el.lastChild, this.minDeltaX, this.minDeltaY);
        
        this.boxes.push({
            index: this.el.children.length - 1,
            x: this.startX,
            y: this.startY
        });

        clearTimeout(this.timeout);
    }
    appendChild(child) {

        child.style.position = "absolute";
        child.style.transform = "translate(-50%, -50%)";
        child.style.backgroundColor = this.color;
        child.style.border = '5px solid white';
        

        this.setChildPosition(child);
        this.setChildSize(child, 0, 0);

        this.el.appendChild(child);

    }
    setChildPosition(child) {

        let zoomFactor = this.map ? this.map.zoomFactor : 1;

        child.style.left = (this.startX - this.getTranslate(this.map.obj)[0]) / zoomFactor + "px";
        child.style.top = (this.startY - this.getTranslate(this.map.obj)[1]) / zoomFactor + "px";

    }
    setChildSize(child, x, y) {

        let deltaX = Math.min(
            this.maxDeltaX,
            Math.max(this.minDeltaX, Math.abs(x - this.startX))
        );
        let deltaY = Math.min(
            this.maxDeltaY,
            Math.max(this.minDeltaY, Math.abs(y - this.startY))
        );

        console.log(deltaX, deltaY);

        if (deltaX + deltaY < 40) {
            return;
        }

        child.style.width = (deltaX + deltaY) / 2 + "px";
        child.style.height = (deltaX + deltaY) / 2 + "px";
        child.style.borderRadius = (deltaX + deltaY) / 2 + "px " + (deltaX + deltaY) / 2 + "px";
    }
    resetChildSize(child, w, h) {
        child.style.width = (w || "0") + "px";
        child.style.height = (h || "0") + "px";
        child.style.borderRadius = (w || "0") + "px " + (h || "0") + "px";
    }
    getTranslate(item) {
        var transArr = [];

        if (!window.getComputedStyle) return;
        var style = getComputedStyle(item),
            transform = style.transform || style.webkitTransform || style.mozTransform || style.msTransform;
        var mat = transform.match(/^matrix3d\((.+)\)$/);
        if (mat) return parseFloat(mat[1].split(', ')[13]);

        mat = transform.match(/^matrix\((.+)\)$/);
        mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : transArr.push(0);
        mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : transArr.push(0);

        return transArr;
    }
    onTouchMove(e) {
        if (!this.isTouching) {
            clearTimeout(this.timeout);
            return false;
        }

        this.canDraw = false;

        if (!e.changedTouches) {
            e.changedTouches = [{ pageX: e.pageX, pageY: e.pageY }];
        }

        e.preventDefault();

        let child = this.el.lastChild;

        let currentX = e.changedTouches[0].pageX;
        let currentY = e.changedTouches[0].pageY;

        this.setChildSize(child, currentX, currentY);

        this.x = currentY;
        this.y = currentY;
    }
    onTouchEnd(e) {
        // console.log("onTouchEnd", e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        this.isTouching = false;
        this.canDraw = false;
        this.map && this.map.activate();

        // console.log(this.boxes);
    }
    onTouchCancel(e) {
        // console.log("onTouchCancel", e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        this.isTouching = false;
        this.canDraw = false;
        this.el.removeChild(this.el.lastChild);

        this.map && this.map.activate();
    }
}

export default DrawCircle;
