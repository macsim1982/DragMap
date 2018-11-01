import { TweenMax } from "gsap/TweenMax";

class DragMap {
    constructor(options) {
        this.options = {
            container: options.container || document
        };

        this.useDebounce = true;        // Boolean : activate or desactivate debounce animation
        this.debounceDistance = 50;     // Max distance of debounce if useDebounce is set to true
        this.debounceFactor = 50;       // Force of Debounce distance amplify
        this.debounceDuration = 0.8;      // Duration of the debounce if useDebounce is set to true

        this.gotoViewDuration = 0.8;    // Duration of animation on switch view event
        this.zoomFactor = 1;            // This is the default current zoomFactor
        this.minZoomFactor = 0;         // minZoomFactor is set dynammically to fill draggable content
        this.maxZoomFactor = 2;         // This is the default Max Zoom Level

        this.time = this.now();
        this.duration = 0;

        this.canMove = true;
        this.currentView = {};
        this.previousTouches = [];
        this.distance = { x: 0, y: 0 };
        this.startView = { x: 2000, y: 1500, w: 1042, h: 604 };

        this.obj = this.options.container.getElementById('content');
        this.el = this.options.container.getElementById("container");
        this.zone1 = this.options.container.getElementById("zone1");
        this.next = this.options.container.getElementById("next");

        this.initialize();
    }
    initialize() {
        this.gotoView(this.startView, 2, true);

        this.addEvents();
    }
    now() {
        return performance && performance.now() || Date.now();
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
            this.handleStart = this.handleStart.bind(this);
            this.handleMove = this.handleMove.bind(this);
            this.handleEnd = this.handleEnd.bind(this);
            this.handleResize = this.handleResize.bind(this);
        }

        var addOrRemove = (add ? 'add' : 'remove') + 'EventListener';

        this.next[addOrRemove]('click', this.handleClick, false);

        this.el[addOrRemove]("touchstart", this.handleStart, false);
        this.el[addOrRemove]("touchmove", this.handleMove, false);
        this.el[addOrRemove]("touchend", this.handleEnd, false);
        this.el[addOrRemove]("touchcancel", this.handleEnd, false);
        this.el[addOrRemove]("touchleave", this.handleEnd, false);

        this.el[addOrRemove]("mousedown", this.handleStart, false);
        this.el[addOrRemove]("mousemove", this.handleMove, false);
        this.el[addOrRemove]("mouseup", this.handleEnd, false);
        this.el[addOrRemove]("mouseleave", this.handleEnd, false);

        window[addOrRemove]("resize", this.handleResize, false);
    }
    handleClick(evt) {
        let target = evt.target.getAttribute("data-cible");

        if (!target) return false;

        

        this.gotoView(JSON.parse(target), this.gotoViewDuration, false);
    }
    handleStart(evt) {
        if (!this.canMove) return false;
        
        if (!evt.changedTouches) {
            evt.changedTouches = [{ pageX: evt.pageX, pageY: evt.pageY }];
        }
        this.previousTouches.push({ touches: evt.changedTouches });

        this.time = this.now();
        
        this.dragStart = true;
    }
    handleMove(evt) {
        if (!this.dragStart) return false;

        if (!this.canMove) return false;

        if (!evt.changedTouches) {
            evt.changedTouches = [{ pageX: evt.pageX, pageY: evt.pageY }];
        }

        var dx = this.previousTouches[0].touches[0].pageX - evt.changedTouches[0].pageX;
        var dy = this.previousTouches[0].touches[0].pageY - evt.changedTouches[0].pageY;

        evt.preventDefault();

        this.distance.x -= dx;
        this.distance.y -= dy;

        this.distance = this.getBoundDistance(this.distance, this.useDebounce);

        TweenMax.set(this.obj, { scale: this.zoomFactor, x: this.distance.x, y: this.distance.y });

        if (this.previousTouches.length > 1) {
            this.previousTouches.splice(0, 1);
        }

        this.previousTouches.push({ touches: evt.changedTouches });
    }

    handleEnd(evt) {
        if (!evt.changedTouches) {
            evt.changedTouches = [{ pageX: evt.pageX, pageY: evt.pageY }];
        }

        if (!this.previousTouches[0]) {
            this.previousTouches = [];
            this.previousTouches[0] = {};
            this.previousTouches[0].touches = evt.changedTouches;
        }

        var dx = this.previousTouches[0].touches[0].pageX - evt.changedTouches[0].pageX;
        var dy = this.previousTouches[0].touches[0].pageY - evt.changedTouches[0].pageY;

        this.duration = this.now() - this.time;
        this.dragStart = false;

        if (this.duration < 300 && Math.abs(dx) < 4 && Math.abs(dy) < 4) {
            this.handleClick(evt);
        }

        if (this.previousTouches.length > 1) {
            evt.preventDefault();

            this.distance.x -= (this.previousTouches[0].touches[0].pageX - this.previousTouches[1].touches[0].pageX) * this.debounceFactor;
            this.distance.y -= (this.previousTouches[0].touches[0].pageY - this.previousTouches[1].touches[0].pageY) * this.debounceFactor;

            this.distance = this.getBoundDistance(this.distance, false);
            TweenMax.to(this.obj, this.debounceDuration, { scale: this.zoomFactor, x: this.distance.x, y: this.distance.y, ease: Power4.easeOut, overwrite: 1 });
        }

        this.previousTouches = []; // Reset previousTouches
    }

    // handleCancel(evt) {
    // }

    // handleLeave(evt) {
    // }

    handleResize(evt) {
        this.gotoView(this.currentView, 1, false);

        // console.log(this.currentView);
    }

    activate() {
        this.canMove = true;
    }

    desactivate() {
        this.canMove = false;
    }

    getRatio(el) {
        return el.offsetWidth / el.offsetHeight;
    }

    getZoomFactorFromView(view, fill) {
        var test = fill ? this.getRatio(this.el) > view.w / view.h : this.getRatio(this.el) < view.w / view.h;
        return test ? (this.el.offsetWidth / view.w) : (this.el.offsetHeight / view.h);
    }

    getMinZoomFactor() {
        return (this.getRatio(this.obj) < this.getRatio(this.el)) ? (this.el.offsetWidth / this.obj.offsetWidth) : (this.el.offsetHeight / this.obj.offsetHeight);
    }

    getBoundZoom(zoom) {
        this.minZoomFactor = this.getMinZoomFactor();

        return Math.min(this.maxZoomFactor, Math.max(this.minZoomFactor, zoom));
    }

    getDistanceBetweenTwoPoints(p1, p2) {
        return Math.sqrt(Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2));
    }

    getDistanceBetweenTwoTouches(touches) {
        return this.getDistanceBetweenTwoPoints({ x: touches[0].pageX, y: touches[0].pageY }, { x: touches[1].pageX, y: touches[1].pageY });
    }

    getBoundDistance(distance, useDebounce) {
        var debounceFactor = useDebounce ? this.debounceDistance : 0;

        distance.x = Math.min(debounceFactor, Math.max(distance.x, this.el.offsetWidth - (this.obj.offsetWidth * this.zoomFactor) - debounceFactor));
        distance.y = Math.min(debounceFactor, Math.max(distance.y, this.el.offsetHeight - (this.obj.offsetHeight * this.zoomFactor) - debounceFactor));

        return distance;
    }
    gotoView(view, duration, start) {
        this.currentView = view;
        this.zoomFactor = this.getBoundZoom(this.getZoomFactorFromView(view));

        view.x -= ((this.el.offsetWidth / this.zoomFactor) - (view.w)) / 2;
        view.y -= ((this.el.offsetHeight / this.zoomFactor) - (view.h)) / 2;

        this.distance = this.getBoundDistance({ x: - view.x * this.zoomFactor, y: - view.y * this.zoomFactor }); // Update distance

        if (start) {
            this.el.style.opacity = 1;
            this.obj.style.transform = "scale(" + this.maxZoomFactor + ")";
            this.obj.style.transformOrigin = "top left";
        }


        TweenMax.to(this.obj, duration, { scale: this.zoomFactor, x: this.distance.x, y: this.distance.y, ease: Power4.easeinout, onComplete: function() {
            this.previousTouches = [];
            this.zoomFactor = this.getBoundZoom(this.getZoomFactorFromView(this.currentView));
        }.bind(this) });


    }
}

export default DragMap;