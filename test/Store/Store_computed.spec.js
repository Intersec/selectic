const tape = require('tape');
const {
    getOptions,
    buildFetchCb,
} = require('../helper.js');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('computed', (subT) => {
    subT.test('"allowGroupSelection"', (sTest) => {
        sTest.test('should be allowed for classic case', async (t) => {
            const store = new Store({
                options: getOptions(20),
                params: {
                    multiple: true,
                },
            });

            await _.nextVueTick(store);

            t.is(store.allowGroupSelection.value, true);

            t.end();
        });

        sTest.test('should not be allowed with dynamic mode', async (t) => {
            /* {{{ preparation */

            const store = new Store({
                groups: [{
                    id: 'g1',
                    name: 'Group 1',
                }],
                fetchCallback: buildFetchCb({ total: 200, group: [{
                    name: 'g1',
                    offset: 0,
                }] }),
                params: {
                    multiple: true,
                },
            });

            /* }}} */

            await _.nextVueTick(store);

            t.is(store.allowGroupSelection.value, false);

            t.end();
        });

        sTest.test('should not be allowed when not in multiple', async (t) => {
            const store = new Store({
                options: getOptions(20),
                params: {
                    multiple: false,
                },
            });

            await _.nextVueTick(store);

            t.is(store.allowGroupSelection.value, false);

            t.end();
        });

        sTest.test('should not be allowed with option disableGroupSelection', async (t) => {
            const store = new Store({
                options: getOptions(20),
                params: {
                    multiple: true,
                    disableGroupSelection: true,
                },
            });

            await _.nextVueTick(store);

            t.is(store.allowGroupSelection.value, false);

            t.end();
        });
    });
});
