const tape = require('tape');
const {
    getOptions,
} = require('../helper.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('clearCache()', (sTest) => {
    sTest.test('should clear all options already loaded', (t) => {
        const store = new Store({
            propsData: {
                options: getOptions(10),
                value: 2,
            },
        });
        store.state.status.errorMessage = 'a message';

        store.clearCache(true);

        t.deepEqual(store.state.allOptions, []);
        t.is(store.state.totalAllOptions, 0);
        t.deepEqual(store.state.filteredOptions, []);
        t.is(store.state.status.errorMessage, '');
        t.is(store.state.internalValue, null);
        t.end();
    });

    sTest.test('should rebuild all options', (t) => {
        const options = getOptions(10);
        const store = new Store({
            propsData: {
                options: options,
                value: 2,
            },
        });
        store.state.status.errorMessage = 'a message';

        store.clearCache();

        t.deepEqual(store.state.allOptions, options);
        t.isNot(store.state.allOptions, options);
        t.is(store.state.totalAllOptions, 10);
        t.deepEqual(store.state.filteredOptions, []);
        t.is(store.state.status.errorMessage, '');
        t.is(store.state.internalValue, 2);
        t.end();
    });
});
