export default function iceFactory({
    db,
}) {
    return Object.freeze({
        addItem,
        addItems,
        empty,
        getItems,
        removeItem,
        removeAt,
        removeFirst,
        removeLast,
        filter,
        filterByPrice,
    });
    function addItem(Item) {
        db.push(Item);
    }
    function addItems(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            db.push(items[i]);
        }
    }
    function empty() {
        db = [];
    }
    function getItems(logMessage) {
        logMessage && console.log(logMessage, [...db]);
        return Object.freeze([...db]);
    }
    function removeItem(v, k) {
        let _k = k || 'id';
        for (let i = 0, l = db.length; i < l; i++) {
            if (db[i][_k] && db[i][_k] === v) {
                db.splice(i, 1);

                return;
            }
        }
    }
    function removeAt(i) {
        db[i] && db.splice(i, 1);
    }
    function removeLast() {
        let last = db.length - 1;
        db[last] && db.splice(last, 1);
    }
    function removeFirst() {
        db[0] && db.splice(0, 1);
    }

    // Return a filtered arrays
    function filter(options) {
        var items = [];


        for (let key in options) {
            db.forEach(item => {
                item[key] === options[key] && items.indexOf(item) < 0 && items.push(item);
            });
        }

        return items;
    }

    function filterByPrice(price) {
        return filter({'price': price});
    }
}
