const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('resetChange()', (sTest) => {
    sTest.test('should reset the status of "hasChanged"', (t) => {
        const store = new Store();

        store.state.status.hasChanged = true;

        store.resetChange();

        t.is(store.state.status.hasChanged, false);

        /* redoing the reset should not change again the status */
        store.resetChange();

        t.is(store.state.status.hasChanged, false);
        t.end();
    });
});
