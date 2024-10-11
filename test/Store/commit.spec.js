const _ = require('../tools.js');
const {
    DEBOUNCE_REQUEST,
    getInitialState,
    getOptions,
    getGroups,
    buildFetchCb,
    toHaveBeenCalled,
    toHaveBeenCalledWith,
    resetCall,
    sleep,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('commit()', (st) => {
    st.test('should change state', (t) => {
        const store = new Store();

        store.commit('searchText', 'hello');
        store.commit('offsetItem', 10);
        store.commit('activeItemIdx', 5);
        store.commit('pageSize', 201);
        store.commit('hideFilter', true);
        store.commit('allowClearSelection', true);

        t.deepEqual(store.state, getInitialState({
            searchText: 'hello',
            offsetItem: 10,
            activeItemIdx: 5,
            pageSize: 201,
            hideFilter: true,
            allowClearSelection: true,
            disabled: true,
            status: {
                automaticClose: true,
            },
        }));

        store.commit('searchText', 'hello2');
        t.deepEqual(store.state.searchText, 'hello2');
        /* display should be reset */
        t.deepEqual(store.state.offsetItem, 0, 'should reset offset');
        t.deepEqual(store.state.activeItemIdx, -1);
        t.end();
    });

    st.test('when open the select list', (sTest) => {
        sTest.test('should fetch data', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                fetchCallback: buildFetchCb({total: 300, command, spy}),
            });

            t.false(toHaveBeenCalled(spy));
            store.commit('isOpen', true);

            t.true(toHaveBeenCalledWith(spy, ['', 0, 100]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);
            command.fetch();

            await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

            // after initial fetch
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.allOptions.length, 100);
            t.deepEqual(store.state.totalAllOptions, 300);
            t.deepEqual(store.state.filteredOptions.length, 100);
            t.deepEqual(store.state.totalFilteredOptions, 300);

            store.commit('offsetItem', 100);
            await _.nextVueTick(store);

            // after changing offset
            t.true(toHaveBeenCalledWith(spy, ['', 100, 100]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);

            command.fetch();
            await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

            // receive response
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.allOptions.length, 200);
            t.deepEqual(store.state.totalAllOptions, 300);
            t.deepEqual(store.state.filteredOptions.length, 200);
            t.deepEqual(store.state.totalFilteredOptions, 300);

            store.commit('offsetItem', 50);
            await _.nextVueTick(store);

            // after inner offset
            t.false(toHaveBeenCalled(spy));
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.allOptions.length, 200);
            t.deepEqual(store.state.totalAllOptions, 300);
            t.deepEqual(store.state.filteredOptions.length, 200);
            t.deepEqual(store.state.totalFilteredOptions, 300);

            t.end();
        });

        sTest.test('should not fetch more data', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 300, command, spy }),
                params: {
                    pageSize: 500,
                },
            });

            t.false(toHaveBeenCalled(spy));
            store.commit('isOpen', true);

            t.true(toHaveBeenCalledWith(spy, ['', 0, 500]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);

            command.fetch();
            await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

            // after initial fetch
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.allOptions.length, 300);
            t.deepEqual(store.state.totalAllOptions, 300);
            t.deepEqual(store.state.filteredOptions.length, 300);
            t.deepEqual(store.state.totalFilteredOptions, 300);

            store.commit('isOpen', false);
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            // after reopen
            t.false(toHaveBeenCalled(spy));
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.isOpen, true);

            store.commit('offsetItem', 1000);
            await _.nextVueTick(store);

            // after max offset
            t.false(toHaveBeenCalled(spy));

            t.end();
        });
    });

    st.test('on searchText', (subT) => {
        subT.test('given static options', (sTest) => {
            sTest.test('should found some items', (t) => {
                const store = new Store({
                    options: getOptions(20),
                });
                store.commit('isOpen', true);
                store.commit('searchText', '1');
                const firstOption = store.state.filteredOptions[0];

                t.deepEqual(store.state.allOptions.length, 20);
                t.deepEqual(store.state.totalAllOptions, 20);
                t.deepEqual(store.state.filteredOptions.length, 11);
                t.deepEqual(store.state.totalFilteredOptions, 11);
                t.deepEqual(firstOption, {
                    id: 1,
                    text: 'text1',
                    disabled: false,
                    selected: false,
                    isGroup: false,
                });
                t.deepEqual(store.state.status.errorMessage, '');
                t.end();
            });

            sTest.test('should not found items', (t) => {
                const store = new Store({
                    options: getOptions(20),
                });
                store.commit('isOpen', true);
                store.commit('searchText', 'coucou');

                t.deepEqual(store.state.allOptions.length, 20);
                t.deepEqual(store.state.totalAllOptions, 20);
                t.deepEqual(store.state.filteredOptions.length, 0);
                t.deepEqual(store.state.totalFilteredOptions, 0);
                t.deepEqual(store.state.status.errorMessage, '');
                t.end();
            });

            sTest.test('should found items from wildcard in text', (t) => {
                const store = new Store({
                    options: getOptions(20),
                });
                store.commit('isOpen', true);
                store.commit('searchText', 'te*4');
                const firstOption = store.state.filteredOptions[0];

                t.deepEqual(store.state.filteredOptions.length, 2);
                t.deepEqual(store.state.totalFilteredOptions, 2);
                t.deepEqual(firstOption, {
                    id: 4,
                    text: 'text4',
                    disabled: false,
                    selected: false,
                    isGroup: false,
                });
                t.deepEqual(store.state.status.errorMessage, '');
                t.end();
            });
        });

        subT.test('given dynamic options', (sTest) => {
            sTest.test('should fetch filtered data', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);

                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                const search = 'search';
                store.commit('searchText', search);

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.deepEqual(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);
                resetCall(spy);

                await sleep(0);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                // after initial fetch
                t.deepEqual(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 250);

                store.commit('offsetItem', 100);
                await _.nextVueTick(store);

                // after changing offset
                t.true(toHaveBeenCalledWith(spy, [search, 100, 100]));
                t.deepEqual(store.state.status.searching, true);
                resetCall(spy);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                // receive response
                t.deepEqual(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 200);
                t.deepEqual(store.state.totalFilteredOptions, 250);

                store.commit('offsetItem', 50);
                await _.nextVueTick(store);

                // after inner offset
                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 200);
                t.deepEqual(store.state.totalFilteredOptions, 250);

                t.end();
            });

            sTest.test('should reset search', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                });
                store.commit('isOpen', true);
                command.fetch();
                await _.nextVueTick(store, command.promise);

                resetCall(spy);
                let search = 'search';
                store.commit('searchText', search);

                command.fetch();
                await _.nextVueTick(store, command.promise);

                // after initial fetch
                store.commit('offsetItem', 100);

                await sleep(DEBOUNCE_REQUEST); // because there are concurrent requests
                resetCall(spy);
                command.fetch();
                await _.nextVueTick(store, command.promise);

                // after initial search
                t.deepEqual(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 200);
                t.deepEqual(store.state.totalFilteredOptions, 250);

                search = '2nd';
                store.commit('searchText', search);
                await _.nextVueTick(store);

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.deepEqual(store.state.status.searching, true);
                resetCall(spy);
                command.fetch();
                await _.nextVueTick(store, command.promise);

                // receive response
                t.deepEqual(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 250);
                /* check that items have been replaced */
                t.true(store.state.filteredOptions[0].text.includes('2nd'));

                store.commit('searchText', '');
                await _.nextVueTick(store);

                // after reseting search
                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.status.searching, false);

                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 300);
                /* check that items have been replaced */
                t.false(store.state.filteredOptions[0].text.includes('2nd'));

                t.end();
            });

            sTest.test('should not fetch more data', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);
                const search = 'search';

                store.commit('pageSize', 500);
                store.commit('searchText', search);
                await _.nextVueTick(store, sleep(0));

                t.true(toHaveBeenCalledWith(spy, [search, 0, 500]));
                t.is(store.state.status.searching, true);
                resetCall(spy);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                // after initial fetch
                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 250);
                t.deepEqual(store.state.totalFilteredOptions, 250);

                store.commit('pageSize', 10);
                store.commit('offsetItem', 100);
                await _.nextVueTick(store);

                // after inner offset
                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.status.searching, false);

                store.commit('offsetItem', 2000);
                await _.nextVueTick(store);

                // after max offset
                t.false(toHaveBeenCalled(spy));

                t.end();
            });

            sTest.test('should manage request in the wrong order', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                });

                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);

                let search = 'search1';
                store.commit('searchText', search);
                await _.nextVueTick(store, sleep(DEBOUNCE_REQUEST));

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]), 'should have been called with parameters');
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);

                const fetch1 = command.fetch;
                const promise1 = spy.promise;

                search = 'search2';
                store.commit('searchText', search);
                await _.nextVueTick(store, sleep(DEBOUNCE_REQUEST));

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);
                const fetch2 = command.fetch;
                const promise2 = spy.promise;

                /* create a new search while previous one is not resolved */
                search = 'search3';
                store.commit('searchText', search);
                await _.nextVueTick(store, sleep(DEBOUNCE_REQUEST));

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);
                const fetch3 = command.fetch;
                const promise3 = spy.promise;

                fetch2();
                await _.nextVueTick(store, promise2);

                // after first result (deprecated)
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 0);
                t.deepEqual(store.state.totalFilteredOptions, Infinity);

                fetch3();
                await _.nextVueTick(store, promise3);

                // after second result
                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 250);
                t.deepEqual(store.state.filteredOptions[0].text, 'search3alpha0');

                fetch1();
                await _.nextVueTick(store, promise1);

                // after third result (deprecated)
                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 300);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 250);
                t.deepEqual(store.state.filteredOptions[0].text, 'search3alpha0');

                t.end();
            });

            sTest.test('should search through all options', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    options: getOptions(3),
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 50, addPrefix: true, command, spy }),
                    params: {
                        optionBehavior: 'sort-ODE',
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);
                await _.nextVueTick(store, command.promise, sleep(0) /* await request resolution */);

                const search = '2';
                store.commit('searchText', search);

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 1);
                resetCall(spy);

                await sleep(0);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 103);
                t.deepEqual(store.state.totalAllOptions, 303);
                t.deepEqual(store.state.filteredOptions.length, 51);
                t.deepEqual(store.state.totalFilteredOptions, 51);

                t.end();
            });

            sTest.test('should display static options', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    options: getOptions(3),
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 50, addPrefix: true, command, spy }),
                    params: {
                        optionBehavior: 'sort-DOE',
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);
                await _.nextVueTick(store, command.promise, sleep(0) /* await request resolution */);

                const search = '2';
                store.commit('searchText', search);

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);
                resetCall(spy);

                await sleep(0);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request resolution */);

                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 303);
                t.deepEqual(store.state.filteredOptions.length, 51);
                t.deepEqual(store.state.totalFilteredOptions, 51);

                t.end();
            });

            sTest.test('should search through all fetched options', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    options: getOptions(3),
                    fetchCallback: buildFetchCb({ total: 30, searchTotal: 5, addPrefix: true, command, spy }),
                    params: {
                        optionBehavior: 'sort-DOE',
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                await _.nextVueTick(store, spy.promise);
                resetCall(spy);
                await sleep(0);

                const search = '2';
                store.commit('searchText', search);
                await _.nextVueTick(store, sleep(0));

                t.false(toHaveBeenCalled(spy));
                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.filteredOptions.length, 13);

                t.end();
            });

            sTest.test('should search only in displayed options', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    options: getOptions(3),
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 0, addPrefix: true, command, spy }),
                    params: {
                        optionBehavior: 'force-DOE',
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);
                await _.nextVueTick(store, command.promise, sleep(0) /* await request resolution */);

                const search = '2';
                store.commit('searchText', search);

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.is(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);
                resetCall(spy);

                await sleep(0);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.filteredOptions.length, 0);
                t.deepEqual(store.state.totalFilteredOptions, 0);
                t.is(store.state.status.errorMessage, '');

                t.end();
            });

            sTest.test('should restore all options', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    options: getOptions(3),
                    fetchCallback: buildFetchCb({ total: 300, searchTotal: 50, addPrefix: true, command, spy }),
                    params: {
                        optionBehavior: 'sort-ODE',
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request is resolved */);

                const search = '2';
                store.commit('searchText', search);
                await sleep(0);
                command.fetch();
                await _.nextVueTick(store, command.promise);

                store.commit('searchText', '');
                await sleep(0);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await build allOptions */);

                t.is(store.state.status.searching, false);
                t.deepEqual(store.state.filteredOptions.length, 103);
                t.deepEqual(store.state.totalFilteredOptions, 303);

                resetCall(spy);
                await sleep(0);
                store.commit('offsetItem', 100);
                await _.nextVueTick(store, sleep(0));

                t.true(toHaveBeenCalledWith(spy, ['', 100, 100]));
                t.end();
            });
        });
    });

    st.test('when changing "offsetItem"', (subT) => {
        subT.test('with classical options', (sTest) => {
            sTest.test('should not fetch already fetched data', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command, spy }),
                });
                store.commit('isOpen', true);

                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                store.commit('offsetItem', 100);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                resetCall(spy);
                store.commit('offsetItem', 70);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.allOptions.length, 200);

                t.end();
            });

            sTest.test('should not fetch data less than half of pageSize', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command, spy }),
                });
                store.commit('isOpen', true);

                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                resetCall(spy);
                store.commit('offsetItem', 50);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.offsetItem, 50);

                t.end();
            });

            sTest.test('should fetch more data to fill page', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command, spy }),
                });
                store.commit('isOpen', true);

                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                resetCall(spy);
                store.commit('offsetItem', 51);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                t.true(toHaveBeenCalledWith(spy, ['', 100, 100]));
                t.deepEqual(store.state.allOptions.length, 200);
                t.deepEqual(store.state.offsetItem, 51);

                resetCall(spy);
                store.commit('offsetItem', 190);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                t.true(toHaveBeenCalledWith(spy, ['', 200, 100]));
                t.deepEqual(store.state.allOptions.length, 300);
                t.deepEqual(store.state.offsetItem, 190);

                t.end();
            });

            sTest.test('should fetch also missing data', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command, spy }),
                });
                store.commit('isOpen', true);

                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                resetCall(spy);
                store.commit('offsetItem', 180);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                t.true(toHaveBeenCalledWith(spy, ['', 100, 200]));
                t.deepEqual(store.state.allOptions.length, 300);
                t.deepEqual(store.state.offsetItem, 180);
                t.is(store.state.status.errorMessage, '');

                t.end();
            });

            sTest.test('should fetch only once', async (t) => {
                const command = {};
                let nbTry = 0;

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command }),
                });
                command.usage = 0;
                store.commit('isOpen', true);

                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage, 1, 'the fetch is done only once to get first page');
                t.is(store.state.status.errorMessage, '');

                command.usage = 0;
                store.commit('offsetItem', 180);
                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage, 1, 'fetch missing options only once');
                t.is(store.state.status.errorMessage, '');

                t.deepEqual(store.state.allOptions.length, 300);

                t.end();
            });

            sTest.test('should fetch several time if needed', async (t) => {
                const command = {};
                let nbTry = 0;

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command }),
                });
                command.usage = 0;
                store.commit('isOpen', true);

                command.interceptResult = (result) => {
                    switch (command.usage) {
                        case 1:
                            /* returns only some of the first options */
                            result.result = result.result.slice(0, 15);
                            break;
                        case 2:
                            /* returns only some options */
                            result.result = result.result.slice(0, 25);
                            break;
                        default:
                            /* do not change the result */
                    }
                    return result;
                };

                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage > 1, true, 'should fetch first options with several fetch');
                t.is(command.usage < 10, true, 'should have stop fetching by itself');
                t.is(store.state.allOptions.length >= 50, true, 'should have retrieve the first options');
                t.is(store.state.status.errorMessage, '');

                command.usage = 0;
                store.commit('offsetItem', 180);
                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage > 1, true, 'should fetch missing options with several fetch');
                t.is(command.usage < 10, true, 'should have stop fetching by itself');

                t.is(store.state.allOptions.length >= 180 + 50, true, 'should have at least the number of items + margin');
                t.is(store.state.status.errorMessage, '', 'should have no error message');

                t.end();
            });

            sTest.test('should stop fetching with wrong result: similar results', async (t) => {
                const command = {};
                let nbTry = 0;

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 500, command }),
                });
                command.usage = 0;
                store.commit('isOpen', true);

                command.interceptResult = (result) => {
                    /* Returns only the 2 first options */
                    result.result = result.result.slice(0, 2);

                    return result;
                };

                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage > 1, true, 'should have try to fetch several times');
                t.is(command.usage < 10, true, 'should have stop fetching');
                t.is(store.state.status.errorMessage, store.data.labels.wrongQueryResult);

                command.usage = 0;
                store.commit('offsetItem', 180);
                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage < 10, true, 'should have stop fetching');
                t.is(store.state.status.errorMessage, store.data.labels.wrongQueryResult);

                t.end();
            });

            sTest.test('should stop fetching with wrong result: wrong total', async (t) => {
                const command = {};
                let nbTry = 0;

                const store = new Store({
                    fetchCallback: buildFetchCb({ total: 20, command }),
                });
                command.usage = 0;
                store.commit('isOpen', true);

                command.interceptResult = (result) => {
                    result.total = 50;

                    return result;
                };

                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);
                }

                t.is(command.usage > 1, true, 'should have try to fetch several times');
                t.is(command.usage < 10, true, 'should have stop fetching');
                t.is(store.state.status.errorMessage, store.data.labels.wrongQueryResult);

                command.usage = 0;
                store.commit('offsetItem', 30);
                nbTry = 0;
                while (nbTry !== command.usage && nbTry < 10) {
                    nbTry = command.usage;
                    command.fetch();
                    await _.nextVueTick(store, command.promise);
                }

                t.is(command.usage < 10, true, 'should have stop fetching');
                t.is(store.state.status.errorMessage, store.data.labels.wrongQueryResult);

                t.deepEqual(store.state.allOptions.length, 20);

                t.end();
            });
        });

        subT.test('with groups', (sTest) => {
            sTest.test('should fetch data in groups', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    groups: getGroups(2),
                    fetchCallback: buildFetchCb({ total: 500, group: [
                        { offset: 100, name: 'group1' },
                        { offset: 200, name: 'group2' },
                    ], command, spy }),
                });
                store.commit('isOpen', true);

                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                t.true(toHaveBeenCalledWith(spy, ['', 0, 100]));
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 0);

                resetCall(spy);
                store.commit('offsetItem', 100);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                /* The items of the first group have been fetched */
                t.true(toHaveBeenCalledWith(spy, ['', 100, 100]));
                t.deepEqual(store.state.allOptions.length, 200);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 201);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 100);

                resetCall(spy);
                store.commit('offsetItem', 151);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                /* As there is the group item which has been added
                * we currently have all data so there is no query */
                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.allOptions.length, 200);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 201);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 151);

                store.commit('offsetItem', 152);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                /* The items of the second group have been fetched */
                t.true(toHaveBeenCalledWith(spy, ['', 200, 100]));
                t.deepEqual(store.state.allOptions.length, 300);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 302);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 152);

                resetCall(spy);
                store.commit('offsetItem', 252);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                /* As there are the group items which have been added
                * we currently have all data so there is no query */
                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.allOptions.length, 300);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 302);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 252);

                store.commit('offsetItem', 253);
                command.fetch();
                await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

                /* Next items are in second group, so no more group
                * item has been added in filteredOptions */
                t.true(toHaveBeenCalledWith(spy, ['', 300, 100]));
                t.deepEqual(store.state.allOptions.length, 400);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 402);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 253);

                const optGroup = store.state.filteredOptions[201];
                const optItem = store.state.filteredOptions[200];

                t.deepEqual(optGroup, {
                    id: 'group2',
                    text: 'group id 2',
                    disabled: false,
                    selected: false,
                    isGroup: true,
                });
                t.deepEqual(optItem, {
                    id: 199,
                    text: 'text199',
                    disabled: false,
                    selected: false,
                    group: 'group1',
                    isGroup: false,
                });

                t.end();
            });
        });
    });

    st.test('when changing "pageSize"', (sTest) => {
        sTest.test('should fetch a different amount of data', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                fetchCallback: buildFetchCb({ total: 300, addPrefix: true, command, spy }),
                params: {
                    pageSize: 50,
                },
            });

            t.false(toHaveBeenCalled(spy));
            store.commit('isOpen', true);

            t.true(toHaveBeenCalledWith(spy, ['', 0, 50]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);
            command.fetch();
            await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

            // after initial search
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.allOptions.length, 50);
            t.deepEqual(store.state.totalAllOptions, 300);
            t.deepEqual(store.state.filteredOptions.length, 50);
            t.deepEqual(store.state.totalFilteredOptions, 300);

            store.commit('pageSize', 150);
            store.commit('offsetItem', 50);
            await _.nextVueTick(store);

            //after changing offset
            t.true(toHaveBeenCalledWith(spy, ['', 50, 150]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);
            command.fetch();
            await _.nextVueTick(store, command.promise, sleep(0) /* await request to be computed */);

            // receive response
            t.deepEqual(store.state.status.searching, false);
            t.deepEqual(store.state.allOptions.length, 200);
            t.deepEqual(store.state.totalAllOptions, 300);
            t.deepEqual(store.state.filteredOptions.length, 200);
            t.deepEqual(store.state.totalFilteredOptions, 300);

            t.end();
        });
    });

    st.test('when changing "disabled"', (sTest) => {
        sTest.test('should avoid opening the select list', (t) => {
            const store = new Store({
                options: getOptions(5),
            });

            store.commit('disabled', true);
            store.commit('isOpen', true);

            t.deepEqual(store.state.isOpen, false);

            store.commit('disabled', false);
            store.commit('isOpen', true);

            t.deepEqual(store.state.isOpen, true);
            t.end();
        });

        sTest.test('should close the select list', async (t) => {
            const store = new Store({
                options: getOptions(5),
            });


            store.commit('isOpen', true);
            await sleep(0);
            store.commit('disabled', true);

            t.deepEqual(store.state.isOpen, false);
            t.deepEqual(store.state.status.automaticClose, true);

            await sleep(10);
            t.deepEqual(store.state.status.automaticClose, false);

            t.end();
        });
    });

    st.test('when changing "selectionIsExcluded"', (sTest) => {
        sTest.test('should reverse the selection', async (t) => {
            const store = new Store({
                options: getOptions(5),
                params: {
                    multiple: true,
                },
                allowRevert: true,
                value: [1, 3, 4],
                selectionIsExcluded: false,
            });
            store.commit('isOpen', true);
            await sleep(0);

            store.commit('selectionIsExcluded', true);
            await sleep(0);

            t.deepEqual(store.state.internalValue, [0, 2]);
            t.deepEqual(store.state.selectionIsExcluded, false);

            t.end();
        });

        sTest.test('should keep selection but revert selectionIsExcluded', async (t) => {
            const store = new Store({
                params: {
                    multiple: true,
                },
                allowRevert: true,
                value: [1, 3, 4],
                selectionIsExcluded: false,
                fetchCallback: buildFetchCb({total: 2000}),
            });
            store.commit('isOpen', true);
            await sleep(0);

            store.commit('selectionIsExcluded', true);
            await sleep(0);

            t.deepEqual(store.state.internalValue, [1, 3, 4]);
            t.deepEqual(store.state.selectionIsExcluded, true);

            t.end();
        });
    });

    st.test('when changing "isOpen"', (sTest) => {
        sTest.test('should close other selectic components', async (t) => {
            const store1 = new Store({
                options: getOptions(5),
            });
            const store2 = new Store({
                options: getOptions(5),
            });

            store1.commit('isOpen', true);
            await _.nextVueTick(store1);

            t.is(store1.state.isOpen, true);
            t.is(store2.state.isOpen, false);

            store2.commit('isOpen', true);
            await _.nextVueTick(store2);

            t.is(store1.state.isOpen, false, 'should have closed store1');
            t.is(store2.state.isOpen, true, 'should have keep store2 open');

            t.end();
        });

        sTest.test('should keep selectic component open', async (t) => {
            const store1 = new Store({
                options: getOptions(5),
                keepOpenWithOtherSelectic: true,
            });
            const store2 = new Store({
                options: getOptions(5),
            });

            store1.commit('isOpen', true);
            await _.nextVueTick(store1);

            t.is(store1.state.isOpen, true);
            t.is(store2.state.isOpen, false);

            store2.commit('isOpen', true);
            await _.nextVueTick(store2);

            t.is(store1.state.isOpen, true); // store1 should stay open
            t.is(store2.state.isOpen, true);

            store1.commit('isOpen', false);
            await _.nextVueTick(store1);

            t.is(store2.state.isOpen, true); // nothing should happen when a component is closed

            store1.commit('isOpen', true);
            await _.nextVueTick(store1);

            t.is(store1.state.isOpen, true);
            t.is(store2.state.isOpen, false); // store2 should have been closed

            t.end();
        });
    });

    st.test('when changing "internalValue"', (sTest) => {
        sTest.test('should change the value', async (t) => {
            const store1 = new Store({
                options: getOptions(5),
                params: {
                    autoSelect: false,
                },
            });
            const store2 = new Store({
                options: getOptions(5),
                params: {
                    autoSelect: false,
                    multiple: true,
                },
            });

            await sleep(0);
            store1.commit('internalValue', 3);
            store2.commit('internalValue', [1, 2]);

            t.is(store1.state.internalValue, 3);
            t.deepEqual(store2.state.internalValue, [1, 2]);
            t.is(store1.state.status.automaticChange, false);
            t.is(store2.state.status.automaticChange, false);

            await sleep(0);
            store1.commit('internalValue', 1);
            store2.commit('internalValue', [3, 4, 5]);

            t.is(store1.state.internalValue, 1);
            t.deepEqual(store2.state.internalValue, [3, 4, 5]);
            t.is(store1.state.status.automaticChange, false);
            t.is(store2.state.status.automaticChange, false);

            await sleep(0);
            store1.commit('internalValue', null);
            store2.commit('internalValue', []);

            t.is(store1.state.internalValue, null);
            t.deepEqual(store2.state.internalValue, []);
            t.is(store1.state.status.automaticChange, false);
            t.is(store2.state.status.automaticChange, false);

            t.end();
        });

        sTest.test('should convert values', async (t) => {
            const store1 = new Store({
                options: getOptions(5),
                params: {
                    autoSelect: false,
                },
            });
            const store2 = new Store({
                options: getOptions(5),
                params: {
                    autoSelect: false,
                    multiple: true,
                },
            });
            await sleep(0);

            store1.commit('internalValue', [3]);
            store2.commit('internalValue', 1);

            t.is(store1.state.internalValue, 3);
            t.deepEqual(store2.state.internalValue, [1]);
            t.is(store1.state.status.automaticChange, true);
            t.is(store2.state.status.automaticChange, true);

            await sleep(0);

            store1.commit('internalValue', [1, 2, 3]);
            store2.commit('internalValue', 3);

            t.is(store1.state.internalValue, 1);
            t.deepEqual(store2.state.internalValue, [3]);
            t.is(store1.state.status.automaticChange, true);
            t.is(store2.state.status.automaticChange, true);

            await sleep(0);

            store1.commit('internalValue', []);
            store2.commit('internalValue', null);

            t.is(store1.state.internalValue, null, 'should not select anything');
            t.deepEqual(store2.state.internalValue, [], 'should have no selection');
            t.is(store1.state.status.automaticChange, true);
            t.is(store2.state.status.automaticChange, true);

            await sleep(0);
            t.is(store1.state.status.automaticChange, false);
            t.is(store2.state.status.automaticChange, false);

            t.end();
        });

        sTest.test('should be changed to the first option', async (t) => {
            const store1 = new Store({
                options: getOptions(5),
                params: {
                    autoSelect: true,
                },
                value: 2,
            });

            store1.commit('internalValue', 3);

            t.is(store1.state.internalValue, 3);
            t.is(store1.state.status.automaticChange, false);

            await sleep(0);
            store1.commit('internalValue', null);

            t.is(store1.state.internalValue, 0);
            t.is(store1.state.status.automaticChange, true);

            await sleep(0);

            t.is(store1.state.status.automaticChange, false);

            t.end();
        });

        sTest.test('should be changed to the first remaining option', async (t) => {
            const store1 = new Store({
                options: [{
                    id: 0,
                }, {
                    id: 1,
                    disabled: true,
                }, {
                    id: 2,
                }, {
                    id: 3,
                }, {
                    id: 4,
                }],
                params: {
                    autoSelect: true,
                    strictValue: true,
                },
                value: 2,
            });

            store1.commit('internalValue', 0);
            await _.nextVueTick(store1);

            t.is(store1.state.internalValue, 0);

            store1.props.options = [{
                id: 1,
                disabled: true,
            }, {
                id: 2,
            }, {
                id: 3,
            }, {
                id: 4,
            }];

            await _.nextVueTick(store1);

            t.is(store1.state.internalValue, 2, 'should change to the first available option');

            store1.commit('internalValue', 3);
            await _.nextVueTick(store1);

            store1.commit('internalValue', null);
            await _.nextVueTick(store1);

            t.is(store1.state.internalValue, 2, 'should select the first available option');

            t.end();
        });
    });
});
