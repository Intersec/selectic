const tape = require('tape');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('changeTexts()', (sTest) => {
    sTest.test('should have default texts', (t) => {
        const store = new Store();

        t.is(typeof store.labels, 'object');

        /* Test some values */
        t.is(store.labels.searching, 'Searching');
        t.is(store.labels.searchPlaceholder, 'Search');
        t.is(store.labels.noResult, 'No results');
        t.end();
    });

    sTest.test('should change texts for an instance', (t) => {
        const store = new Store({
            propsData: {
                texts: {
                    searching: 'please wait',
                    noResult: 'nada',
                },
            },
        });
        const storeRef = new Store();

        /* Test some values */
        t.is(store.labels.searching, 'please wait');
        t.is(store.labels.searchPlaceholder, 'Search');
        t.is(store.labels.noResult, 'nada');

        /* Assert it has not change other instances */
        t.is(storeRef.labels.searching, 'Searching');
        t.is(storeRef.labels.searchPlaceholder, 'Search');
        t.is(storeRef.labels.noResult, 'No results');
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
        t.is(store.labels.searching, 'please wait');
        t.is(store.labels.searchPlaceholder, 'Search');
        t.is(store.labels.noResult, 'nada');

        /* Assert it has not change other instances */
        t.is(storeExistingRef.labels.searching, 'Searching');
        t.is(storeExistingRef.labels.searchPlaceholder, 'Search');
        t.is(storeExistingRef.labels.noResult, 'No results');

        const storeNewRef = new Store();
        /* Assert it has not change newly created instances */
        t.is(storeNewRef.labels.searching, 'Searching');
        t.is(storeNewRef.labels.searchPlaceholder, 'Search');
        t.is(storeNewRef.labels.noResult, 'No results');
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
        t.is(store.labels.searching, 'please wait');
        t.is(store.labels.searchPlaceholder, 'Search');
        t.is(store.labels.noResult, 'nada');

        /* Existing instance keeps its values */
        t.is(oldStore.labels.searching, 'Searching');
        t.is(oldStore.labels.searchPlaceholder, 'Search');
        t.is(oldStore.labels.noResult, 'No results');

        /* restore default values */
        StoreFile.changeTexts({
            searching: 'Searching',
            noResult: 'No results',
        });
        t.end();
    });
});
