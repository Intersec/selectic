const tape = require('tape');
const {
    getOptions,
    buildFetchCb,
    buildGetItemsCb,
} = require('../helper.js');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('state', (subT) => {
    subT.test('"selectedOptions"', (sTest) => {
        sTest.test('should be updated with static option', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(20),
                    value: [12, 5],
                    params: {
                        multiple: true,
                    },
                },
            });

            await _.nextVueTick(store);

            t.deepEqual(store.state.selectedOptions, [{
                id: 12,
                text: 'text12',
                selected: true,
                disabled: false,
                isGroup: false,
            }, {
                id: 5,
                text: 'text5',
                selected: true,
                disabled: false,
                isGroup: false,
            }]);

            store.selectItem(3, true);
            await _.deferPromise(_.nextVueTick(store));

            t.deepEqual(store.state.selectedOptions, [{
                id: 12,
                text: 'text12',
                selected: true,
                disabled: false,
                isGroup: false,
            }, {
                id: 5,
                text: 'text5',
                selected: true,
                disabled: false,
                isGroup: false,
            }, {
                id: 3,
                text: 'text3',
                selected: true,
                disabled: false,
                isGroup: false,
            }]);

            t.end();
        });

        sTest.test('should be updated with dynamic option', async (t) => {
            /* {{{ preparation */

            const command = {};
            const spyFetch = {};
            const spyGet = {};

            const store = new Store({
                propsData: {
                    fetchCallback: buildFetchCb({ total: 200, spy: spyFetch }),
                    getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                    params: {
                        pageSize: 10,
                    },
                    value: 55,
                },
            });

            /* }}} */

            await _.nextVueTick(store);

            t.deepEqual(store.state.selectedOptions, {
                id: 55,
                text: '55',
                selected: true,
                disabled: false,
                isGroup: false,
            });

            command.found(true);
            await _.deferPromise(spyGet.promise);

            t.deepEqual(store.state.selectedOptions, {
                id: 55,
                text: 'some text 55',
                selected: true,
                disabled: false,
                isGroup: false,
                data: 'data55',
            });

            store.selectItem(22, true);
            await _.nextVueTick(store);
            command.found(true);
            await _.deferPromise(spyGet.promise);

            t.deepEqual(store.state.selectedOptions, {
                id: 22,
                text: 'some text 22',
                selected: true,
                disabled: false,
                isGroup: false,
                data: 'data22',
            });

            t.end();
        });
    });
});
