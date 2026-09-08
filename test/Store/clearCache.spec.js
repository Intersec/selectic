const tape = require('tape');
const _ = require('../tools.js');
const {
    getOptions,
    buildFetchCb,
} = require('../helper.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('clearCache()', (sTest) => {
    sTest.test('should clear all options already loaded', (t) => {
        const store = new Store({
            options: getOptions(10),
            value: 2,
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

    sTest.test('should clear all options already loaded in multiple mode', (t) => {
        const store = new Store({
            options: getOptions(10),
            params: {
                multiple: true,
            },
            value: [2, 4],
        });
        store.state.status.errorMessage = 'a message';

        store.clearCache(true);

        t.deepEqual(store.state.allOptions, []);
        t.is(store.state.totalAllOptions, 0);
        t.deepEqual(store.state.filteredOptions, []);
        t.is(store.state.status.errorMessage, '');
        t.deepEqual(store.state.internalValue, []);
        t.end();
    });

    sTest.test('should rebuild all options', (t) => {
        const options = getOptions(10);
        const store = new Store({
            options: options,
            value: 2,
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

    sTest.test('should clear the dynamic options already fetched', async (t) => {
        const spyFetch = {};
        const store = new Store({
            fetchCallback: buildFetchCb({ total: 200, spy: spyFetch }),
            params: {
                pageSize: 10,
            },
        });
        store.commit('isOpen', true);

        await _.nextVueTick(store);
        await _.deferPromise(spyFetch.promise);

        t.is(store.state.dynOptions.length, 10);
        t.is(store.state.totalDynOptions, 200);

        store.clearCache();

        t.deepEqual(store.state.dynOptions, []);
        t.is(store.state.totalDynOptions, Infinity);
        t.deepEqual(store.state.allOptions, []);
        t.is(store.state.totalAllOptions, Infinity);
        t.end();
    });
});
