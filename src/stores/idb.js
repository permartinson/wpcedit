// Borrowed from https://javascript.plainenglish.io/vue-3-with-vuex-for-simple-caching-with-indexeddb-aec46e9df9de
const { openDB } = require('idb');
const dbPromise = openDB('wpcEdit', 1, {
    upgrade(db) {
        db.createObjectStore('keyval');
    },
});

async function get(key) {
    return (await dbPromise).get('keyval', key);
}

async function set(key, val) {
    return (await dbPromise).put('keyval', val, key);
}

async function keys() {
    return (await dbPromise).getAllKeys('keyval');
}
async function getAll() {
    return (await dbPromise).getAll('keyval');

}

module.exports = { get, set, keys, getAll }