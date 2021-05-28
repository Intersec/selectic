/**************************************************************************/
/*                                                                        */
/*  Copyright (C) INTERSEC SA                                             */
/*                                                                        */
/*  Should you receive a copy of this source code, you must check you     */
/*  have a proper, written authorization of INTERSEC to hold it. If you   */
/*  don't have such an authorization, you must DELETE all source code     */
/*  files in your possession, and inform INTERSEC of the fact you obtain  */
/*  these files. Should you not comply to these terms, you can be         */
/*  prosecuted in the extent permitted by applicable law.                 */
/*                                                                        */
/**************************************************************************/

const _ = require('../tools.js');
const {
    buildFetchCb,
    buildGetItemsCb,
    getOptions,
    resetCall,
    toHaveBeenCalled,
    toHaveBeenCalledWith,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;


tape.test('getItem()', (st) => {
    st.test('with static options', (sTest) => {
        sTest.test('should retrieve the given item', (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const item = store.getItem(12);

            t.deepEqual(item, {
                id: 12,
                text: 'text12',
                disabled: false,
                selected: false,
                isGroup: false,
            });
            t.end();
        });

        sTest.test('should retrieve selected item', (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const item = store.getItem(5);

            t.deepEqual(item, {
                id: 5,
                text: 'text5',
                disabled: false,
                selected: true,
                isGroup: false,
            });
            t.end();
        });

        sTest.test('should fallback for unknown item', (t) => {
            const store = new Store({
                options: getOptions(15),
                value: 5,
            });
            const item = store.getItem(1024);

            t.deepEqual(item, {
                id: 1024,
                text: '1024',
                disabled: false,
                selected: false,
                isGroup: false,
            });
            t.end();
        });
    });

    st.test('with dynamic options', (sTest) => {
        sTest.test('should retrieve an item which is already fetched', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 300, searchTotal: 100, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 50,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await _.deferPromise(spyFetch.promise);

            resetCall(spyGet);
            const item = store.getItem(5);

            t.false(toHaveBeenCalled(spyGet));
            t.deepEqual(item, {
                id: 5,
                text: 'text5',
                disabled: false,
                selected: false,
                isGroup: false,
            });

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
                fetchCallback: buildFetchCb({ total: 300, searchCb, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 50,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await spyFetch.promise;
            store.commit('searchText', 'searched');
            await _.deferPromise(spyFetch.promise);

            resetCall(spyGet);
            const item = store.getItem(105);

            t.false(toHaveBeenCalled(spyGet));
            t.deepEqual(item, {
                id: 105,
                text: 'searched105',
                disabled: false,
                selected: false,
                isGroup: false,
            });

            t.end();
        });

        sTest.test('should not retrieve an item which is not yet fetched', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};
            const searchCb = (search, offset, limit, total) => ({
                total,
                result: getOptions(limit, search, offset + 100),
            });

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 300, searchCb, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 50,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await spyFetch.promise;
            store.commit('searchText', 'searched');
            await _.deferPromise(spyFetch.promise);

            resetCall(spyGet);
            const item = store.getItem(250);

            t.true(toHaveBeenCalled(spyGet));
            t.true(toHaveBeenCalledWith(spyGet, [[250]]));
            t.deepEqual(item, {
                id: 250,
                text: '250',
                disabled: false,
                selected: false,
                isGroup: false,
            });

            t.end();
        });

        sTest.test('should cache result of a not yet fetched item', async (t) => {
            const command = {};
            const spyFetch = {};
            const spyGet = {};
            const searchCb = (search, offset, limit, total) => ({
                total,
                result: getOptions(limit, search, offset + 100),
            });

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 300, searchCb, spy: spyFetch }),
                getItemsCallback: buildGetItemsCb({ command, spy: spyGet }),
                params: {
                    pageSize: 50,
                },
                value: 55,
            });
            store.commit('isOpen', true);

            await spyFetch.promise;
            store.commit('searchText', 'searched');
            await _.deferPromise(spyFetch.promise);

            resetCall(spyGet);

            const item = store.getItem(250);

            t.true(toHaveBeenCalled(spyGet));
            command.found();
            await _.deferPromise(command.promise);
            resetCall(spyGet);

            const item2 = store.getItem(250);

            t.false(toHaveBeenCalled(spyGet));
            t.deepEqual(item2, {
                id: 250,
                text: 'some text 250',
                disabled: false,
                selected: false,
                isGroup: false,
                data: 'data250',
            });
            t.notDeepEqual(item, item2);

            t.end();
        });
    });
});
