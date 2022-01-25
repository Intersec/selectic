const _ = require('../tools.js');
const {
    getOptions,
    sleep,
    buildFetchCb,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('toggleSelectAll()', (st) => {
    st.test('should select all static options', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multiple: true,
            },
            value: [1, 3],
        });
        await sleep(0);
        store.commit('isOpen', true);

        t.is(store.state.status.areAllSelected, false);

        store.toggleSelectAll();
        await _.nextVueTick(store);

        t.deepEqual(store.state.internalValue, [1, 3, 0, 2, 4]);
        t.is(store.state.selectionIsExcluded, false);
        t.is(store.state.status.areAllSelected, true);
        t.is(store.state.status.hasChanged, true);

        store.toggleSelectAll();
        await _.nextVueTick(store);

        t.deepEqual(store.state.internalValue, []);
        t.is(store.state.selectionIsExcluded, false);
        t.is(store.state.status.areAllSelected, false);

        t.end();
    });

    st.test('should invert selection when selectionIsExcluded is true', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multiple: true,
            },
            value: [1, 3],
            selectionIsExcluded: true,
        });
        await sleep(0);
        store.commit('isOpen', true);

        await sleep(0);

        t.deepEqual(store.state.internalValue.sort(), [0, 2, 4]);
        t.is(store.state.selectionIsExcluded, false);
        t.is(store.state.status.areAllSelected, false);

        store.toggleSelectAll();
        await _.nextVueTick(store);

        t.deepEqual(store.state.internalValue.sort(), [0, 1, 2, 3, 4]);
        t.is(store.state.selectionIsExcluded, false);
        t.is(store.state.status.areAllSelected, true);
        t.is(store.state.status.hasChanged, true);

        store.toggleSelectAll();
        await _.nextVueTick(store);

        t.deepEqual(store.state.internalValue, []);
        t.is(store.state.selectionIsExcluded, false);
        t.is(store.state.status.areAllSelected, false);

        t.end();
    });

    st.test('given dynamic options', (sTest) => {
        sTest.test('should set the "selectionIsExcluded" flag', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                params: {
                    multiple: true,
                    pageSize: 10,
                    allowRevert: true,
                },
                value: [1, 3],
                fetchCallback: buildFetchCb({total: 20, command, spy}),
            });
            await sleep(0);
            store.commit('isOpen', true);

            command.fetch();
            await _.deferPromise(command.promise);

            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.selectionIsExcluded, true);
            t.is(store.state.status.hasChanged, true);

            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.selectionIsExcluded, false);
            t.is(store.state.status.areAllSelected, false);

            t.end();
        });

        sTest.test('should set all options when all fetched', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                params: {
                    multiple: true,
                    pageSize: 10,
                    allowRevert: true,
                },
                value: [1, 3],
                fetchCallback: buildFetchCb({total: 20, command, spy}),
            });
            await sleep(0);
            store.commit('isOpen', true);

            command.fetch();
            await _.deferPromise(command.promise);

            store.commit('offsetItem', 10);
            command.fetch();
            await _.deferPromise(command.promise);

            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue,
                [1, 3, 0, 2, 4, 5, 6 ,7 ,8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
            );
            t.is(store.state.selectionIsExcluded, false);
            t.is(store.state.status.areAllSelected, true);
            t.is(store.state.status.hasChanged, true);

            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.selectionIsExcluded, false);
            t.is(store.state.status.areAllSelected, false);

            t.end();
        });

        sTest.test('should not select anything while not all items are fetched', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                params: {
                    multiple: true,
                    pageSize: 10,
                    allowRevert: false
                },
                value: [1, 15],
                fetchCallback: buildFetchCb({total: 20, command, spy}),
            });
            await sleep(0);
            store.commit('isOpen', true);

            command.fetch();
            await _.deferPromise(command.promise);

            t.deepEqual([store.state.totalFilteredOptions, store.state.filteredOptions.length], [20, 10]);
            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, [1, 15]);
            t.is(store.state.selectionIsExcluded, false);
            t.is(store.state.status.hasChanged, false);
            t.is(store.state.status.errorMessage, store.data.labels.cannotSelectAllRevertItems);

            t.end();
        });
    });

    st.test('should do nothing when "multiple" is false', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multiple: false,
            },
            value: 2,
        });

        store.toggleSelectAll();
        await _.nextVueTick(store);

        t.is(store.state.internalValue, 2);
        t.is(store.state.status.hasChanged, false);
        t.is(store.state.status.areAllSelected, false);

        t.end();
    });

    st.test('given searched text', (subT) => {
        subT.test('should select all filtered static options', async (t) => {
            const store = new Store({
                options: getOptions(15),
                params: {
                    multiple: true,
                },
                value: [1, 3],
            });
            await sleep(0);
            store.commit('isOpen', true);
            store.commit('searchText', '1');

            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue,
                [1, 3, 10, 11, 12, 13, 14]
            );
            t.is(store.state.selectionIsExcluded, false);
            t.is(store.state.status.areAllSelected, true);
            t.is(store.state.status.hasChanged, true);

            store.toggleSelectAll();
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, [3]);
            t.is(store.state.selectionIsExcluded, false);
            t.is(store.state.status.areAllSelected, false);

            t.end();
        });

        subT.test('given dynamic options', (sTest) => {
            sTest.test('should not select anything while not all searched items are fetched', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    params: {
                        multiple: true,
                        pageSize: 10,
                        allowRevert: true,
                    },
                    value: [1, 15],
                    fetchCallback: buildFetchCb({total: 20, searchTotal: 20, command, spy}),
                });
                await sleep(0);
                store.commit('isOpen', true);
                store.commit('searchText', '1');

                command.fetch();
                await _.deferPromise(command.promise);

                t.deepEqual([store.state.totalFilteredOptions, store.state.filteredOptions.length], [20, 10]);
                store.toggleSelectAll();
                await _.nextVueTick(store);

                t.deepEqual(store.state.internalValue, [1, 15]);
                t.is(store.state.selectionIsExcluded, false);
                t.is(store.state.status.hasChanged, false);
                t.is(store.state.status.errorMessage, store.data.labels.cannotSelectAllSearchedItems);

                t.end();
            });

            sTest.test('should select all options when all fetched', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    params: {
                        multiple: true,
                        pageSize: 10,
                        allowRevert: true,
                    },
                    value: [1, 15],
                    fetchCallback: buildFetchCb({total: 20, searchTotal: 20, command, spy}),
                });
                await sleep(0);
                store.commit('isOpen', true);
                store.commit('searchText', '1');

                command.fetch();
                await _.deferPromise(command.promise);
                store.commit('offsetItem', 10);

                command.fetch();
                await _.deferPromise(command.promise);

                store.toggleSelectAll();
                await _.nextVueTick(store);

                t.deepEqual(store.state.internalValue,
                    [1, 15, 0, 2, 3, 4, 5, 6 ,7 ,8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19]
                );
                t.is(store.state.selectionIsExcluded, false);
                t.is(store.state.status.areAllSelected, true);
                t.is(store.state.status.hasChanged, true);
                t.is(store.state.status.errorMessage, '');

                store.toggleSelectAll();
                await _.nextVueTick(store);

                t.deepEqual(store.state.internalValue, []);
                t.is(store.state.selectionIsExcluded, false);
                t.is(store.state.status.areAllSelected, false);

                t.end();
            });
        });
    });
});
