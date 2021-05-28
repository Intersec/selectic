const tape = require('tape');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('changeTexts()', (sTest) => {
    sTest.test('should have default texts', (t) => {
        const store = new Store();

        t.is(typeof store.data.labels, 'object');

        /* Test some values */
        t.is(store.data.labels.searching, 'Searching');
        t.is(store.data.labels.searchPlaceholder, 'Search');
        t.is(store.data.labels.noResult, 'No results');
        t.end();
    });

    sTest.test('should change texts for an instance', (t) => {
        const store = new Store({
            texts: {
                searching: 'please wait',
                noResult: 'nada',
            },
        });
        const storeRef = new Store();

        /* Test some values */
        t.is(store.data.labels.searching, 'please wait');
        t.is(store.data.labels.searchPlaceholder, 'Search');
        t.is(store.data.labels.noResult, 'nada');

        /* Assert it has not change other instances */
        t.is(storeRef.data.labels.searching, 'Searching');
        t.is(storeRef.data.labels.searchPlaceholder, 'Search');
        t.is(storeRef.data.labels.noResult, 'No results');
        t.end();
    });

    sTest.test('should change dynamicaly texts for an instance', (t) => {
        const store = new Store();
        const storeExistingRef = new Store();

        store.changeTexts({
            searching: 'please wait',
            noResult: 'nada',
        });

        /* Test some values */
        t.is(store.data.labels.searching, 'please wait');
        t.is(store.data.labels.searchPlaceholder, 'Search');
        t.is(store.data.labels.noResult, 'nada');

        /* Assert it has not change other instances */
        t.is(storeExistingRef.data.labels.searching, 'Searching');
        t.is(storeExistingRef.data.labels.searchPlaceholder, 'Search');
        t.is(storeExistingRef.data.labels.noResult, 'No results');

        const storeNewRef = new Store();
        /* Assert it has not change newly created instances */
        t.is(storeNewRef.data.labels.searching, 'Searching');
        t.is(storeNewRef.data.labels.searchPlaceholder, 'Search');
        t.is(storeNewRef.data.labels.noResult, 'No results');
        t.end();
    });

    sTest.test('should change texts for all new instances', (t) => {
        const oldStore = new Store();

        StoreFile.changeTexts({
            searching: 'please wait',
            noResult: 'nada',
        });

        const store = new Store();

        /* Test some values */
        t.is(store.data.labels.searching, 'please wait');
        t.is(store.data.labels.searchPlaceholder, 'Search');
        t.is(store.data.labels.noResult, 'nada');

        /* Existing instance keeps its values */
        t.is(oldStore.data.labels.searching, 'Searching');
        t.is(oldStore.data.labels.searchPlaceholder, 'Search');
        t.is(oldStore.data.labels.noResult, 'No results');

        /* restore default values */
        StoreFile.changeTexts({
            searching: 'Searching',
            noResult: 'No results',
        });
        t.end();
    });
});
