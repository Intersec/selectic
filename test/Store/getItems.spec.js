const _ = require('../tools.js');
const {
    getOptions,
    resetCall,
    toHaveBeenCalled,
    toHaveBeenCalledWith,
    buildFetchCb,
    buildGetItemsCb,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('getItems()', (subT) => {
    subT.test('with static options', (sTest) => {
        sTest.test('should retrieve the given item', async (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const pItem = store.getItems([12]);

            t.true(pItem instanceof Promise);
            const item = await pItem;
            t.deepEqual(item, [{
                id: 12,
                text: 'text12',
                disabled: false,
                selected: false,
                isGroup: false,
            }]);

            t.end();
        });

        sTest.test('should retrieve items in given order', async (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const pItem = store.getItems([12, 3, 7]);

            t.true(pItem instanceof Promise);
            const item = await pItem;
            t.deepEqual(item, [{
                id: 12,
                text: 'text12',
                disabled: false,
                selected: false,
                isGroup: false,
            }, {
                id: 3,
                text: 'text3',
                disabled: false,
                selected: false,
                isGroup: false,
            }, {
                id: 7,
                text: 'text7',
                disabled: false,
                selected: false,
                isGroup: false,
            }]);

            t.end();
        });

        sTest.test('should retrieve selected item', async (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const pItem = store.getItems([5]);

            t.true(pItem instanceof Promise);
            const item = await pItem;
            t.deepEqual(item, [{
                id: 5,
                text: 'text5',
                disabled: false,
                selected: true,
                isGroup: false,
            }]);

            t.end();
        });

        sTest.test('should fallback for unknown item', async (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const pItem = store.getItems([258]);

            t.true(pItem instanceof Promise);
            const item = await pItem;
            t.deepEqual(item, [{
                id: 258,
                text: '258',
                disabled: false,
                selected: false,
                isGroup: false,
            }]);

            t.end();
        });
    });

    subT.test('with dynamic options', (sTest) => {
        sTest.test('should retrieve an item which is already fetched', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 200, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 10,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await _.nextVueTick(store);
            await _.deferPromise(spyFetch.promise);
            t.true(toHaveBeenCalled(spyGet));
            command.found(true);

            resetCall(spyGet);
            const p = store.getItems([5]);

            t.false(toHaveBeenCalled(spyGet));

            const item = await p;
            t.deepEqual(item, [{
                id: 5,
                text: 'text5',
                disabled: false,
                selected: false,
                isGroup: false,
            }]);

            resetCall(spyGet);
            const p2 = store.getItems([55]);

            t.false(toHaveBeenCalled(spyGet));

            const item2 = await p2;
            t.deepEqual(item2, [{
                id: 55,
                text: 'some text 55',
                disabled: false,
                selected: true,
                isGroup: false,
                data: 'data55',
            }]);

            t.end();
        });

        sTest.test('should retrieve an item in filtered list', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};
            const searchCb = (search, offset, limit, total) => ({
                total,
                result: getOptions(limit, search, offset + 100),
            });

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 200, searchCb, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 10,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await spyFetch.promise;
            store.commit('searchText', 'searched');
            await _.deferPromise(spyFetch.promise);

            resetCall(spyGet);
            const p = store.getItems([105]);

            t.false(toHaveBeenCalled(spyGet));

            const item = await p;
            t.deepEqual(item, [{
                id: 105,
                text: 'searched105',
                disabled: false,
                selected: false,
                isGroup: false,
            }]);

            t.end();
        });

        sTest.test('should retrieve an item which is not yet fetched', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 200, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 10,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await _.nextVueTick(store);
            command.found(true);

            resetCall(spyGet);
            const p = store.getItems([57]);

            t.true(toHaveBeenCalledWith(spyGet, [[57]]));
            command.found(true);

            const item = await p;
            t.deepEqual(item, [{
                id: 57,
                text: 'some text 57',
                disabled: false,
                selected: false,
                isGroup: false,
                data: 'data57',
            }]);

            t.end();
        });

        sTest.test('should cache result of a not yet fetched item', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 200, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 10,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await _.deferPromise(spyFetch.promise);

            const p = store.getItems([57]);
            command.found(true);
            await p;

            resetCall(spyGet);

            const p2 = store.getItems([57]);

            t.false(toHaveBeenCalled(spyGet));

            const item = await p2;
            t.deepEqual(item, [{
                id: 57,
                text: 'some text 57',
                disabled: false,
                selected: false,
                isGroup: false,
                data: 'data57',
            }]);

            t.end();
        });

        sTest.test('should fallback for unknown item', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 200, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 10,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await _.deferPromise(spyFetch.promise);

            const p = store.getItems([555]);

            t.true(toHaveBeenCalledWith(spyGet, [[555]]));
            command.found(false);

            const item = await p;
            t.deepEqual(item, [{
                id: 555,
                text: '555',
                disabled: false,
                selected: false,
                isGroup: false,
            }]);

            t.end();
        });
    });
});
