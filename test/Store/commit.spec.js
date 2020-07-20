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
        }));

        store.commit('searchText', 'hello2');
        t.deepEqual(store.state.searchText, 'hello2');
        /* display should be reset */
        t.deepEqual(store.state.offsetItem, 0);
        t.deepEqual(store.state.activeItemIdx, -1);
        t.end();
    });

    st.test('when open the select list', (sTest) => {
        sTest.test('should fetch data', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                propsData: {
                    fetchCallback: buildFetchCb({total: 300, command, spy}),
                },
            });

            t.false(toHaveBeenCalled(spy));
            store.commit('isOpen', true);

            t.true(toHaveBeenCalledWith(spy, ['', 0, 100]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);
            command.fetch();

            await command.promise;
            await _.nextVueTick(store);

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
            await _.deferPromise(command.promise);

            // receive reponse
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
                propsData: {
                    fetchCallback: buildFetchCb({ total: 300, command, spy }),
                    params: {
                        pageSize: 500,
                    },
                },
            });

            t.false(toHaveBeenCalled(spy));
            store.commit('isOpen', true);

            t.true(toHaveBeenCalledWith(spy, ['', 0, 500]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);

            command.fetch();
            await _.deferPromise(command.promise);

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
                    propsData: {
                        options: getOptions(20),
                    },
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
                    propsData: {
                        options: getOptions(20),
                    },
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
                    propsData: {
                        options: getOptions(20),
                    },
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
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);

                const search = 'search';
                store.commit('searchText', search);

                t.true(toHaveBeenCalledWith(spy, [search, 0, 100]));
                t.deepEqual(store.state.status.searching, true);
                t.deepEqual(store.state.filteredOptions.length, 0);
                resetCall(spy);
                command.fetch();
                await _.deferPromise(command.promise);

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
                await _.deferPromise(command.promise);

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
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);
                let search = 'search';
                store.commit('searchText', search);

                command.fetch();
                await _.deferPromise(command.promise);

                // after initial fetch
                store.commit('offsetItem', 100);

                resetCall(spy);
                command.fetch();
                await command.promise;

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
                await command.promise;

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
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 300, searchTotal: 250, addPrefix: true, command, spy }),
                    },
                });
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);
                const search = 'search';

                store.commit('pageSize', 500);
                store.commit('searchText', search);


                t.true(toHaveBeenCalledWith(spy, [search, 0, 500]));
                t.deepEqual(store.state.status.searching, true);
                resetCall(spy);
                command.fetch();
                await command.promise;

                // after initial fetch
                t.deepEqual(store.state.status.searching, false);
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
        });
    });

    st.test('when changing "offsetItem"', (subT) => {
        subT.test('with classical options', (sTest) => {
            sTest.test('should not fetch already fetched data', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 500, command, spy }),
                    },
                });
                store.commit('isOpen', true);

                command.fetch();
                await command.promise;

                store.commit('offsetItem', 100);
                command.fetch();
                await command.promise;

                resetCall(spy);
                store.commit('offsetItem', 70);
                command.fetch();
                await command.promise;

                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.allOptions.length, 200);

                t.end();
            });

            sTest.test('should not fetch data less than half of pageSize', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 500, command, spy }),
                    },
                });
                store.commit('isOpen', true);

                command.fetch();
                await command.promise;

                resetCall(spy);
                store.commit('offsetItem', 50);
                command.fetch();
                await command.promise;

                t.false(toHaveBeenCalled(spy));
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.offsetItem, 50);

                t.end();
            });

            sTest.test('should fetch more data to fill page', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 500, command, spy }),
                    },
                });
                store.commit('isOpen', true);

                command.fetch();
                await command.promise;

                resetCall(spy);
                store.commit('offsetItem', 51);
                command.fetch();
                await command.promise;

                t.true(toHaveBeenCalledWith(spy, ['', 100, 100]));
                t.deepEqual(store.state.allOptions.length, 200);
                t.deepEqual(store.state.offsetItem, 51);

                resetCall(spy);
                store.commit('offsetItem', 190);
                command.fetch();
                await command.promise;

                t.true(toHaveBeenCalledWith(spy, ['', 200, 100]));
                t.deepEqual(store.state.allOptions.length, 300);
                t.deepEqual(store.state.offsetItem, 190);

                t.end();
            });

            sTest.test('should fetch also missing data', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 500, command, spy }),
                    },
                });
                store.commit('isOpen', true);

                command.fetch();
                await command.promise;

                resetCall(spy);
                store.commit('offsetItem', 180);
                command.fetch();
                await command.promise;

                t.true(toHaveBeenCalledWith(spy, ['', 100, 200]));
                t.deepEqual(store.state.allOptions.length, 300);
                t.deepEqual(store.state.offsetItem, 180);

                t.end();
            });
        });

        subT.test('with groups', (sTest) => {
            sTest.test('should fetch data in groups', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    propsData: {
                        groups: getGroups(2),
                        fetchCallback: buildFetchCb({ total: 500, group: [
                            { offset: 100, name: 'group1' },
                            { offset: 200, name: 'group2' },
                        ], command, spy }),
                    },
                });
                store.commit('isOpen', true);

                command.fetch();
                await command.promise;

                t.true(toHaveBeenCalledWith(spy, ['', 0, 100]));
                t.deepEqual(store.state.allOptions.length, 100);
                t.deepEqual(store.state.totalAllOptions, 500);
                t.deepEqual(store.state.filteredOptions.length, 100);
                t.deepEqual(store.state.totalFilteredOptions, 502);
                t.deepEqual(store.state.offsetItem, 0);

                resetCall(spy);
                store.commit('offsetItem', 100);
                command.fetch();
                await command.promise;

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
                await command.promise;

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
                await command.promise;

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
                await command.promise;

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
                await command.promise;

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

            const store = new Store({propsData: {
                fetchCallback: buildFetchCb({ total: 300, addPrefix: true, command, spy }),
                params: {
                    pageSize: 50,
                },
            }});

            t.false(toHaveBeenCalled(spy));
            store.commit('isOpen', true);

            t.true(toHaveBeenCalledWith(spy, ['', 0, 50]));
            t.deepEqual(store.state.status.searching, true);
            resetCall(spy);
            command.fetch();
            await command.promise;

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
            await command.promise;

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
            const store = new Store({propsData: {
                options: getOptions(5),
            }});

            store.commit('disabled', true);
            store.commit('isOpen', true);

            t.deepEqual(store.state.isOpen, false);

            store.commit('disabled', false);
            store.commit('isOpen', true);

            t.deepEqual(store.state.isOpen, true);
            t.end();
        });

        sTest.test('should close the select list', (t) => {
            const store = new Store({propsData: {
                options: getOptions(5),
            }});

            store.commit('isOpen', true);
            store.commit('disabled', true);

            t.deepEqual(store.state.isOpen, false);
            t.end();
        });
    });

    st.test('when changing "selectionIsExcluded"', (sTest) => {
        sTest.test('should reverse the selection', async (t) => {
            const store = new Store({propsData: {
                options: getOptions(5),
                params: {
                    multiple: true,
                },
                allowRevert: true,
                value: [1, 3, 4],
                selectionIsExcluded: false,
            }});
            store.commit('isOpen', true);
            await sleep(0);

            store.commit('selectionIsExcluded', true);
            await sleep(0);

            t.deepEqual(store.state.internalValue, [0, 2]);
            t.deepEqual(store.state.selectionIsExcluded, false);

            t.end();
        });

        sTest.test('should keep selection but revert selectionIsExcluded', async (t) => {
            const store = new Store({propsData: {
                params: {
                    multiple: true,
                },
                allowRevert: true,
                value: [1, 3, 4],
                selectionIsExcluded: false,
                fetchCallback: buildFetchCb({total: 2000}),
            }});
            store.commit('isOpen', true);
            await sleep(0);

            store.commit('selectionIsExcluded', true);
            await sleep(0);

            t.deepEqual(store.state.internalValue, [1, 3, 4]);
            t.deepEqual(store.state.selectionIsExcluded, true);

            t.end();
        });
    });
});
