const tape = require('tape');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.only('changeIcons()', (sTest) => {
    sTest.test('should have default icons', (t) => {
        const store = new Store();

        t.is(typeof store.data.icons, 'object');
        t.is(store.data.iconFamily, 'selectic');

        /* is empty by default */
        t.deepEqual(store.data.icons, {});

        t.end();
    });

    sTest.test('should change icons for an instance', (t) => {
        const store = new Store({
            icons: {
                spin: 'pulse',
                check: 'thumbs-up',
            },
        });
        const storeRef = new Store();

        /* Test some values */
        t.is(store.data.icons.spin, 'pulse');
        t.is(store.data.icons.check, 'thumbs-up');

        /* Assert it has not change other instances */
        t.is(storeRef.data.icons.spin, undefined);
        t.is(storeRef.data.icons.check, undefined);
        t.end();
    });

    sTest.test('should change icon family for an instance', (t) => {
        const store = new Store({
            iconFamily: 'font-awesome-4',
        });
        const storeRef = new Store();

        /* Test icon family value */
        t.is(store.data.iconFamily, 'font-awesome-4');

        /* Assert it has not change other instances */
        t.is(storeRef.data.iconFamily, 'selectic');
        t.end();
    });

    sTest.test('should change dynamically texts for an instance', (t) => {
        const store = new Store();
        const storeExistingRef = new Store();

        store.changeIcons({
            times: 'trash',
            search: 'magnify',
        });

        /* Test some values */
        t.is(store.data.icons.times, 'trash');
        t.is(store.data.icons.search, 'magnify');
        t.is(store.data.icons.spin, undefined);
        t.is(store.data.iconFamily, 'selectic');

        /* Assert it has not change other instances */
        t.is(storeExistingRef.data.icons.times, undefined);
        t.is(storeExistingRef.data.icons.search, undefined);
        t.is(storeExistingRef.data.icons.spin, undefined);
        t.is(storeExistingRef.data.iconFamily, 'selectic');

        const storeNewRef = new Store();
        /* Assert it has not change newly created instances */
        t.is(storeNewRef.data.icons.times, undefined);
        t.is(storeNewRef.data.icons.search, undefined);
        t.is(storeNewRef.data.icons.spin, undefined);
        t.is(storeNewRef.data.iconFamily, 'selectic');

        // assert it keeps previous value and update them
        store.changeIcons({
            search: 'search',
            spin: 'rotate',
        });

        t.is(store.data.icons.times, 'trash');
        t.is(store.data.icons.search, 'search');
        t.is(store.data.icons.spin, 'rotate');
        t.is(store.data.iconFamily, 'selectic');

        /* Assert it has not change other instances */
        t.is(storeExistingRef.data.icons.times, undefined);
        t.is(storeExistingRef.data.icons.search, undefined);
        t.is(storeExistingRef.data.icons.spin, undefined);
        t.is(storeExistingRef.data.iconFamily, 'selectic');

        // assert it could change icon family
        store.changeIcons(null, 'font-awesome-5');

        t.is(store.data.icons.times, 'trash');
        t.is(store.data.icons.search, 'search');
        t.is(store.data.icons.spin, 'rotate');
        t.is(store.data.iconFamily, 'font-awesome-5');

        /* Assert it has not change other instances */
        t.is(storeExistingRef.data.icons.times, undefined);
        t.is(storeExistingRef.data.icons.search, undefined);
        t.is(storeExistingRef.data.icons.spin, undefined);
        t.is(storeExistingRef.data.iconFamily, 'selectic');

        // assert it could change both icons and icon family
        store.changeIcons({
            times: 'question',
            spin: 'pulse',
        }, 'prefix:my-icon myIc-');

        t.is(store.data.icons.times, 'question');
        t.is(store.data.icons.search, 'search');
        t.is(store.data.icons.spin, 'pulse');
        t.is(store.data.iconFamily, 'prefix:my-icon myIc-');

        /* Assert it has not change other instances */
        t.is(storeExistingRef.data.icons.times, undefined);
        t.is(storeExistingRef.data.icons.search, undefined);
        t.is(storeExistingRef.data.icons.spin, undefined);
        t.is(storeExistingRef.data.iconFamily, 'selectic');

        t.end();
    });

    sTest.test('should change texts for all new instances', (t) => {
        const oldStore = new Store();

        StoreFile.changeIcons({
            'caret-down': 'arrow-down',
        }, 'font-awesome-4');

        const store = new Store();

        /* Test some values */
        t.is(store.data.icons['caret-down'], 'arrow-down');
        t.is(store.data.iconFamily, 'font-awesome-4');

        /* Existing instance keeps its values */
        t.is(oldStore.data.icons['caret-down'], undefined);
        t.is(oldStore.data.iconFamily, 'selectic');

        /* restore default values */
        StoreFile.changeIcons({
            'caret-down': 'caret-down',
        }, 'selectic');
        t.end();
    });
});
