const _ = require('../tools.js');
const {
    buildFetchCb,
    getOptions,
    resetCall,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('selectGroup()', (st) => {
    function getStaticOptions() {
        const group1 = getOptions(10, 'gp1-', 0, 'group1');
        const group2 = getOptions(20, 'gp2-', 10, 'group2');
        const group3 = getOptions(10, 'gp3-', 30, 'group3');

        group3[0].disabled = true;
        group3[5].disabled = true;
        group3[6].exclusive = true;
        group3[9].exclusive = true;

        return group1.concat(group2, group3);
    }
    const group1Ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const group2FilteredIds = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21];
    const group2Ids = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
    const group3Ids = [31, 32, 33, 34, 37, 38];

    st.test('when "multiple" is false', (section) => {
        section.test('with static mode', (sTest) => {
            function getStore() {
                const options = getStaticOptions();
                const store = new Store({
                    options: options,
                    params: {
                        multiple: false,
                        autoSelect: false,
                        strictValue: true,
                    },
                });

                return store;
            }

            sTest.test('should not change selection', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);

                t.is(store.state.internalValue, null, 'initialization');

                store.selectGroup('group1', true);

                t.is(store.state.internalValue, null);
                t.is(store.state.status.hasChanged, false);

                /* Check if it also not changed value when there is one */

                store.selectItem(5, true);
                /* reset status to check that it is modified */
                store.state.status.hasChanged = false;

                store.selectGroup('group2', true);

                t.is(store.state.internalValue, 5);
                t.is(store.state.status.hasChanged, false);

                t.end();
            });
        });

        section.test('with dynamic mode', (sTest) => {
            sTest.test('should not select any value', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    fetchCallback: buildFetchCb({
                        total: 300,
                        group: [{
                            name: 'g1',
                            offset: 0,
                        }, {
                            name: 'g2',
                            offset: 20,
                        }, {
                            name: 'g3',
                            offset: 250,
                        }],
                        command,
                        spy,
                    }),
                    groups: [{
                        id: 'g1',
                        name: 'Group 1',
                    }, {
                        id: 'g2',
                        name: 'Group 2',
                    }, {
                        id: 'g3',
                        name: 'Group 3',
                    }],
                });
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);

                await _.nextVueTick(store, command.promise);

                t.is(store.state.internalValue, null, 'initialization');
                t.is(store.state.filteredOptions[0].id, 'g1', 'initialization checks group is visible');

                store.selectGroup('g1', true);

                /* Currently selection is blocked for dynamic mode */

                t.is(store.state.internalValue, null);
                t.is(store.state.status.hasChanged, false);

                t.end();
            });
        });
    });

    st.test('when "multiple" is true', (section) => {
        section.test('with static mode', (sTest) => {
            function getStore() {
                const options = getStaticOptions();
                const store = new Store({
                    options: options,
                    params: {
                        multiple: true,
                        strictValue: true,
                    },
                });

                return store;
            }

            sTest.test('should select several value', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);

                t.deepEqual(store.state.internalValue, [], 'initialization');

                store.selectGroup('group1', true);

                t.deepEqual(store.state.internalValue, group1Ids);
                t.is(store.state.status.hasChanged, true);

                /* it should add selection to the current selection */

                /* reset status to check that it is modified */
                store.state.status.hasChanged = false;

                store.selectGroup('group2', true);

                t.deepEqual(store.state.internalValue, group1Ids.concat(group2Ids));
                t.is(store.state.status.hasChanged, true);

                t.end();
            });

            sTest.test('should not duplicate already selected values', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);

                store.selectItem(1, true);
                store.selectItem(6, true);
                store.selectItem(11, true);
                t.deepEqual(store.state.internalValue, [1, 6, 11], 'initialization');

                store.selectGroup('group1', true);

                t.deepEqual(store.state.internalValue, [1, 6, 11, 0, 2, 3, 4, 5, 7, 8, 9]);
                t.is(store.state.status.hasChanged, true);

                /* reset status to check that it is modified */
                store.state.status.hasChanged = false;

                store.selectGroup('group1', true);

                t.deepEqual(store.state.internalValue, [1, 6, 11, 0, 2, 3, 4, 5, 7, 8, 9]);
                t.is(store.state.status.hasChanged, false,
                    'should not considered as changed if no new elements are added');

                t.end();
            });

            sTest.test('should not select disabled and exclusive values', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);

                t.deepEqual(store.state.internalValue, [], 'initialization');

                store.selectGroup('group3', true);

                t.deepEqual(store.state.internalValue, group3Ids, 'should not contains disabled and exclusive items');
                t.is(store.state.status.hasChanged, true);

                t.end();
            });

            sTest.test('should unselect values', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);
                store.selectItem(1, true);
                store.selectItem(6, true);
                store.selectItem(11, true);
                store.selectGroup('group2', true);
                store.selectItem(31, true);

                t.deepEqual(store.state.internalValue, [1, 6, 11, 10, ...group2Ids.slice(2), 31], 'initialization');

                store.selectGroup('group2', false);

                t.deepEqual(store.state.internalValue, [1, 6, 31]);
                t.is(store.state.status.hasChanged, true);

                /* Remove already not selected group */
                /* reset status to check that it is modified */
                store.state.status.hasChanged = false;

                store.selectGroup('group2', false);

                t.deepEqual(store.state.internalValue, [1, 6, 31], 'should not changed');
                t.is(store.state.status.hasChanged, false,
                    'should not considered as changed if no new elements are removed');

                /* should remove partial selection */

                store.selectGroup('group1', false);

                t.deepEqual(store.state.internalValue, [31]);
                t.is(store.state.status.hasChanged, true);

                t.end();
            });

            sTest.test('should apply only on filtered elements', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                store.commit('searchText', '1');
                store.selectItem(37, true);
                await _.sleep(0);

                t.deepEqual(store.state.internalValue, [37], 'initialization');

                store.selectGroup('group2', true);

                t.deepEqual(store.state.internalValue, [37, ...group2FilteredIds]);
                t.is(store.state.status.hasChanged, true);

                /* it should remove selection */

                /* reset status to check that it is modified */
                store.state.status.hasChanged = false;

                store.selectGroup('group2', false);

                t.deepEqual(store.state.internalValue, [37]);
                t.is(store.state.status.hasChanged, true);

                /* it should remove only filtered selection */

                store.selectItem(31, true);

                /* reset status to check that it is modified */
                store.state.status.hasChanged = false;

                store.selectGroup('group3', false);

                t.deepEqual(store.state.internalValue, [37]);
                t.is(store.state.status.hasChanged, true);

                t.end();
            });

            sTest.test('should have set items as selected', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);

                store.selectGroup('group1', true);
                t.is(store.state.filteredOptions[0].selected, true, 'should select the group');
                t.is(store.state.filteredOptions[1].selected, true); // id: 0
                t.is(store.state.filteredOptions[2].selected, true);
                t.is(store.state.filteredOptions[3].selected, true);
                t.is(store.state.filteredOptions[4].selected, true);
                t.is(store.state.filteredOptions[5].selected, true);
                t.is(store.state.filteredOptions[6].selected, true);
                t.is(store.state.filteredOptions[7].selected, true);
                t.is(store.state.filteredOptions[8].selected, true);
                t.is(store.state.filteredOptions[9].selected, true);
                t.is(store.state.filteredOptions[10].selected, true);
                t.is(store.state.filteredOptions[11].selected, false);

                store.selectItem(5, false);
                t.is(store.state.filteredOptions[0].selected, false, 'should unselect the group');
                t.is(store.state.filteredOptions[6].selected, false); // id: 5

                t.end();
            });

            sTest.test('should not close list', async (t) => {
                const store = getStore();
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                await _.sleep(0);

                store.selectGroup('group1', true);
                t.is(store.state.isOpen, true);

                store.selectItem('group1', false);
                t.is(store.state.isOpen, true);

                t.end();
            });
        });

        section.test('with dynamic mode', (sTest) => {
            sTest.test('should not select any value', async (t) => {
                const command = {};
                const spy = {};

                const store = new Store({
                    params: {
                        multiple: true,
                    },
                    fetchCallback: buildFetchCb({
                        total: 300,
                        group: [{
                            name: 'g1',
                            offset: 0,
                        }, {
                            name: 'g2',
                            offset: 20,
                        }, {
                            name: 'g3',
                            offset: 250,
                        }],
                        command,
                        spy,
                    }),
                    groups: [{
                        id: 'g1',
                        name: 'Group 1',
                    }, {
                        id: 'g2',
                        name: 'Group 2',
                    }, {
                        id: 'g3',
                        name: 'Group 3',
                    }],
                });
                await _.nextVueTick(store);
                store.commit('isOpen', true);
                command.fetch();
                resetCall(spy);

                await _.nextVueTick(store, command.promise);

                t.deepEqual(store.state.internalValue, [], 'initialization');
                t.is(store.state.filteredOptions[0].id, 'g1', 'initialization checks group is visible');

                store.selectGroup('g1', true);

                /* Currently selection is blocked for dynamic mode */

                t.deepEqual(store.state.internalValue, []);
                t.is(store.state.status.hasChanged, false);

                t.end();
            });
        });
    });
});
