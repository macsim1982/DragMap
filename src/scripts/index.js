'use strict';

if (module.hot) {
    module.hot.accept();
}

import '../styles/index.scss';

import Button from './Button';
import DragMap from './DragMap';
import DrawCircle from './DrawCircle';
// import Waypoint from './Waypoint';
import InViewport from './in-viewport/InViewport';

// import { groups } from './Group';
// import { allWaypoints } from './Waypoint';
// import WebGL from './WebGL.js';
// import iceFactory from './iceFactory.js';
/*

——————————————————————
 GSAP import examples
——————————————————————


//typical import
import {TweenMax, Power2, TimelineLite} from "gsap/TweenMax";

//or get to the parts that aren't included inside TweenMax:
import Draggable from "gsap/Draggable";
import ScrollToPlugin from "gsap/ScrollToPlugin";

//or, as of 2.0.0, all tools are exported from the "all" file (excluding bonus plugins):
import {TweenMax, CSSPlugin, ScrollToPlugin, Draggable, Elastic} from "gsap/all";
//if tree shaking dumps plugins, just reference them somewhere in your code like:
const plugins = [CSSPlugin, ScrollToPlugin];

*/


new Button({
    buttonSelector: '[data-uniq="button-00"]',
    bubbleSelector: '.button-bubble',
    bubbleHiddenClass: 'mcs-hidden',
});

let $items = document.querySelectorAll('.in-viewport');
for (let $i in $items) {
  if ($i < 16)
  new InViewport({
    element: $items[$i],
    context: document.querySelector('.in-viewport--context')
  });
}

// new Waypoint({
//   element: document.querySelector('.button'),
//   handler: (a) => {
//     console.log(a, allWaypoints, groups);
//   },
//   horizontal: true
// });


let map = new DragMap({
  onDragCallback: () => {
    InViewport.refreshAll(); //.refresh();
  }
});

new DrawCircle({
  map,
  className: 'circle',
  eventElement: document,
  color: 'rgba(255, 255, 255, 0.3)',
  minDelta: 50,
  maxDelta: 800
});


// let gl = new WebGL({ canvasSelector: '#canvas', bgColor: [0, 0, 0, 0] });

/*
const db = [];
const cart = iceFactory({ db });

let items = [
  {
    id: 'U00001',
    name: 'foo 1',
    price: 9.99
  },
  {
    id: 'U00002',
    name: 'foo 2',
    price: 2.99
  },
  {
    id: 'U00003',
    name: 'foo 3',
    price: 9.99
  },
  {
    id: 'U00004',
    name: 'foo 4',
    price: 3.99
  },
  {
    id: 'U00005',
    nope: true
  }
];

cart.addItem(items[0]);
cart.addItem(items[1]);
cart.addItem(items[2]);
cart.addItem(items[3]);
cart.addItem(items[4]);
cart.getItems('addItem(items[4])');

console.log('item filterd by price 9.99', cart.filterByPrice(9.99));

cart.removeAt(1);
cart.getItems('removeAt(1)');

cart.removeFirst();
cart.getItems('removeFirst()');

cart.removeLast();
cart.getItems('removeLast()');

cart.empty();
cart.getItems('empty()');

cart.addItems(items);
cart.getItems('addItems(items)');
cart.removeItem('U00003');
cart.getItems('removeItem(\'U00003\')');

cart.removeItem(true, 'nope');
cart.getItems('removeItem(true, \'nope\')');

console.log('item filterd by price 2.99', cart.filterByPrice(2.99));
*/
