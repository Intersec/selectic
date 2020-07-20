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
    getGroups,
    getOptions,
    buildFetchCb,
    buildGetItemsCb,
    sleep,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('Store creation', (subT) => {
    subT.test('should handle initial properties', (t) => {
        const defaultStore = new Store();

        t.deepEqual(defaultStore.state, getInitialState());

        const store = new Store({
            propsData: {
                params: {
                    multiple: true,
                    pageSize: 10,
                    hideFilter: true,
                    allowClearSelection: true,
                    groups: getGroups(2),
                    autoSelect: false,
                },
            },
        });

        t.deepEqual(store.state, getInitialState({
            multiple: true,
            hideFilter: true,
            allowClearSelection: true,
            pageSize: 10,
            internalValue: [],
            selectedOptions: [],
            groups: [{
                id: 'group1',
                text: 'group id 1',
            }, {
                id: 'group2',
                text: 'group id 2',
            }],
            autoSelect: false,
        }));

        t.end();
    });

    subT.test('"options" property', (sTest) => {
        sTest.test('should handle short options list', (t) => {
            const propOptions = getOptions(5);
            const store = new Store({ propsData: { options: propOptions } });
            store.commit('isOpen', true);

            const state = store.state;
            const firstOption = state.filteredOptions[0];

            t.is(state.allOptions.length, 5);
            t.is(state.totalAllOptions, 5);
            t.is(state.filteredOptions.length, 5);
            t.is(state.totalFilteredOptions, 5);
            t.deepEqual(firstOption, {
                id: 0,
                text: 'text0',
                disabled: false,
                selected: false,
                isGroup: false,
            });
            t.is(state.status.errorMessage, '');

            t.end();
        });

        sTest.test('should handle long options list', (t) => {
            const propOptions = getOptions(15000);
            const store = new Store({ propsData: { options: propOptions } });
            store.commit('isOpen', true);

            const state = store.state;
            const firstOption = state.filteredOptions[0];

            t.is(state.allOptions.length, 15000);
            t.is(state.totalAllOptions, 15000);
            t.is(state.filteredOptions.length, 15000);
            t.is(state.totalFilteredOptions, 15000);
            t.deepEqual(firstOption, {
                id: 0,
                text: 'text0',
                disabled: false,
                selected: false,
                isGroup: false,
            });
            t.is(state.status.errorMessage, '');

            t.end();
        });

        sTest.test('should handle string options list', (t) => {
            const propOptions = ['alpha', 'bravo', 'charlie', 'delta'];
            const store = new Store({ propsData: { options: propOptions } });
            store.commit('isOpen', true);

            const state = store.state;
            const firstOption = state.filteredOptions[0];

            t.is(state.allOptions.length, 4);
            t.is(state.totalAllOptions, 4);
            t.is(state.filteredOptions.length, 4);
            t.is(state.totalFilteredOptions, 4);
            t.deepEqual(firstOption, {
                id: 'alpha',
                text: 'alpha',
                disabled: false,
                selected: false,
                isGroup: false,
            });
            t.is(state.status.errorMessage, '');

            t.end();
        });

        sTest.test('should handle disabled option', (t) => {
            const propOptions = getOptions(5);
            propOptions[0].disabled = true;
            const store = new Store({ propsData: { options: propOptions } });
            store.commit('isOpen', true);

            const state = store.state;
            const firstOption = state.filteredOptions[0];

            t.deepEqual(firstOption, {
                id: 0,
                text: 'text0',
                disabled: true,
                selected: false,
                isGroup: false,
            });
            t.is(state.status.errorMessage, '');

            t.end();
        });

        sTest.test('should handle group option', (t) => {
            const propOptions1 = getOptions(5, '', 0, 'group1');
            const propOptions2 = getOptions(5, '', 5, 'group2');
            const propOptions = propOptions1.concat(propOptions2);

            const store = new Store({ propsData: { options: propOptions } });
            store.commit('isOpen', true);

            const state = store.state;

            const firstOption = state.filteredOptions[0];
            const secondOption = state.filteredOptions[1];

            t.is(state.allOptions.length, 10);
            t.is(state.totalAllOptions, 10);
            t.is(state.filteredOptions.length, 12);
            t.is(state.totalFilteredOptions, 12);
            t.is(state.groups.size, 2);

            t.deepEqual(firstOption, {
                id: 'group1',
                text: 'group1',
                disabled: false,
                selected: false,
                isGroup: true,
            });
            t.deepEqual(secondOption, {
                id: 0,
                text: 'text0',
                disabled: false,
                selected: false,
                group: 'group1',
                isGroup: false,
            });
            t.is(state.status.errorMessage, '');

            t.end();
        });

        sTest.test('should handle inner group option', (t) => {
            const propOptions1 = getOptions(5);
            const propOptions2 = getOptions(5, '', 5);
            const propOptions = [{
                id: 'group1',
                text: 'group1',
                options: propOptions1,
            }, {
                id: 'group2',
                text: 'group2',
                options: propOptions2,
            }];

            const store = new Store({ propsData: { options: propOptions } });
            store.commit('isOpen', true);
            const state = store.state;

            const firstOption = state.filteredOptions[0];
            const secondOption = state.filteredOptions[1];

            t.is(state.allOptions.length, 10);
            t.is(state.totalAllOptions, 10);
            t.is(state.filteredOptions.length, 12);
            t.is(state.totalFilteredOptions, 12);

            t.deepEqual(firstOption, {
                id: 'group1',
                text: 'group1',
                disabled: false,
                selected: false,
                isGroup: true,
            });
            t.deepEqual(secondOption, {
                id: 0,
                text: 'text0',
                disabled: false,
                selected: false,
                group: 'group1',
                isGroup: false,
            });
            t.is(state.status.errorMessage, '');
            t.end();
        });
    });

    subT.test('"value" property', (sTest) => {
        sTest.test('should handle single value', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(5),
                    params: {
                        multiple: false,
                    },
                    value: 3,
                },
            });

            await _.nextVueTick(store);

            t.is(store.state.internalValue, 3);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });

        sTest.test('should handle multiple value', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(5),
                    params: {
                        multiple: true,
                    },
                    value: [3, 2],
                },
            });

            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, [3, 2]);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });

        sTest.test('should handle unknown value', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    params: {
                        multiple: false,
                    },
                    value: 42,
                },
            });

            await _.nextVueTick(store);

            t.is(store.state.internalValue, 42);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });
    });

    subT.test('"fetchCallback" property', (sTest) => {
        sTest.test('should handle initial properties', (t) => {
            let response = false;
            const fetchCallback = () => reponse = true;

            const store = new Store({ propsData: { fetchCallback: fetchCallback } });

            t.is(response, false);
            t.is(store.state.allOptions.length, 0);
            t.is(store.state.totalAllOptions, Infinity);
            t.is(store.state.filteredOptions.length, 0);
            t.end();
        });

        sTest.test('should handle "value"', (t) => {
            const store = new Store({
                propsData: {
                    fetchCallback: function () {},
                    value: [189, 45, 'hello'],
                    params: {
                        multiple: true,
                    },
                },
            });

            t.deepEqual(store.state.internalValue, [189, 45, 'hello']);
            t.end();
        });
    });

    subT.test('"selectionIsExcluded" property', (sTest) => {
        sTest.test('should set the selectionIsExcluded state', (t) => {
            const store = new Store({
                propsData: {
                    fetchCallback: buildFetchCb({ total: 5 }),
                    value: [1],
                    selectionIsExcluded: true,
                    params: {
                        multiple: true,
                    },
                },
            });

            t.deepEqual(store.state.internalValue, [1]);
            t.is(store.state.selectionIsExcluded, true);
            t.end();
        });

        sTest.test('should not applied for single value', (t) => {
            const store = new Store({
                propsData: {
                    fetchCallback: buildFetchCb({ total: 5 }),
                    value: 1,
                    selectionIsExcluded: true,
                    params: {
                        multiple: false,
                    },
                },
            });

            t.deepEqual(store.state.internalValue, 1);
            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });
    });

    subT.test('"disabled" property should set the state', (t) => {
        const store = new Store({
            propsData: {
                options: getOptions(3),
                disabled: true,
            },
        });

        t.is(store.state.disabled, true);
        t.end();
    });

    subT.test('"autoSelect" property', (sTest) => {
        sTest.test('should select the first option', async (t) => {
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: true,
                    },
                    options: getOptions(2),
                },
            });

            t.is(store.state.internalValue, null);
            await sleep(0);
            t.is(store.state.internalValue, 0);
            t.end();
        });

        sTest.test('should select the only available option', async (t) => {
            const options = getOptions(5);
            options[0].disabled = true;
            options[1].disabled = true;
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: true,
                    },
                    options: options,
                },
            });

            t.is(store.state.internalValue, null);
            await sleep(0);
            t.is(store.state.internalValue, 2);
            t.end();
        });

        sTest.test('should select the only option', async (t) => {
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: true,
                    },
                    options: getOptions(1),
                },
            });

            t.is(store.state.internalValue, null);
            await sleep(0);
            t.is(store.state.internalValue, 0);
            t.end();
        });

        sTest.test('should not select option when it can be removed', async (t) => {
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: true,
                        allowClearSelection: true,
                    },
                    options: getOptions(1),
                },
            });

            t.is(store.state.internalValue, null);
            await sleep(0);
            t.is(store.state.internalValue, null);
            t.end();
        });

        sTest.test('should not select the only option when false', async (t) => {
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: false,
                        allowClearSelection: false,
                    },
                    options: getOptions(1),
                },
            });

            t.is(store.state.internalValue, null);
            await sleep(0);
            t.is(store.state.internalValue, null);
            t.end();
        });

        sTest.test('should not select the only available option when false', async (t) => {
            const options = getOptions(3);
            options[0].disabled = true;
            options[2].disabled = true;
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: false,
                        allowClearSelection: false,
                    },
                    options: options,
                },
            });

            t.is(store.state.internalValue, null);
            await sleep(0);
            t.is(store.state.internalValue, null);
            t.end();
        });

        sTest.test('should not select option in multiple', async (t) => {
            const store = new Store({
                propsData: {
                    params: {
                        autoSelect: true,
                        multiple: true,
                    },
                    options: getOptions(1),
                },
            });

            await sleep(0);
            t.deepEqual(store.state.internalValue, []);
            t.end();
        });
    });

    subT.test('"autoDisabled" property', (sTest) => {
        sTest.test('should disable empty select', async (t) => {
            const store = new Store({
                propsData: {
                    options: [],
                    disabled: false,
                    params: {
                        autoDisabled: true,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, true);
            t.is(store.state.internalValue, null);
            t.end();
        });

        sTest.test('should disable select with only one option', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    disabled: false,
                    params: {
                        autoDisabled: true,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, true);
            t.is(store.state.internalValue, 0);
            t.end();
        });

        sTest.test('should not disable select with several options', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(2),
                    disabled: false,
                    params: {
                        autoDisabled: true,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, 0);

            t.end();
        });

        sTest.test('should not disable select when it is possible to remove selection', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    disabled: false,
                    value: 0,
                    params: {
                        autoDisabled: true,
                        allowClearSelection: true,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, 0);
            t.end();
        });

        sTest.test('should not disable select without autoDisabled', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    disabled: false,
                    params: {
                        autoDisabled: false,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, 0);
            t.end();
        });

        sTest.test('should not disable select without autoSelect', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    disabled: false,
                    params: {
                        autoDisabled: true,
                        autoSelect: false,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, null);

            t.end();
        });

        sTest.test('should disable select without autoSelect which have a selected value', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    disabled: false,
                    value: 0,
                    params: {
                        autoDisabled: true,
                        autoSelect: false,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, true);
            t.is(store.state.internalValue, 0);

            t.end();
        });

        sTest.test('should not disable select when allowClearSelection', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1),
                    disabled: false,
                    params: {
                        allowClearSelection: true,
                        autoDisabled: true,
                        autoSelect: true,
                    },
                },
            });

            await sleep(0);

            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, null);

            t.end();
        });

        sTest.test('should not disable select in dynamic mode', async (t) => {
            const store = new Store({
                propsData: {
                    fetchCallback: buildFetchCb({ total: 1 }),
                    disabled: false,
                    params: {
                        autoDisabled: true,
                    },
                },
            });

            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, null);

            /* Load data */
            store.commit('isOpen', true);
            await sleep(0);
            store.commit('isOpen', false);
            await sleep(0);

            /* assert Selectic is not disbaled */
            t.is(store.state.disabled, false);
            t.is(store.state.internalValue, null);

            t.end();
        });
    });

    subT.test('"strictValue" property', (st) => {
        st.test('in static mode', (sTest) => {
            sTest.test('should not keep single selection', async (t) => {
                const store = new Store({
                    propsData: {
                        params: {
                            strictValue: true,
                            autoSelect: false,
                        },
                        options: getOptions(2),
                        value: 'hello',
                    },
                });

                await sleep(0);
                t.is(store.state.internalValue, null);
                t.end();
            });

            sTest.test('should not keep invalid values in multiple selection', async (t) => {
                const store = new Store({
                    propsData: {
                        params: {
                            multiple: true,
                            strictValue: true,
                        },
                        options: getOptions(5),
                        value: [2, 'hello', 1, true],
                    },
                });

                await sleep(0);
                t.deepEqual(store.state.internalValue, [2, 1]);
                t.end();
            });

            sTest.test('should keep single incoherent selection when disabled', async (t) => {
                const store = new Store({
                    propsData: {
                        params: {
                            strictValue: false,
                            autoSelect: false,
                        },
                        options: getOptions(2),
                        value: 'hello',
                    },
                });

                await sleep(0);
                t.is(store.state.internalValue, 'hello');
                t.end();
            });

            sTest.test('should keep incoherent values in multiple selection when disabled', async (t) => {
                const store = new Store({
                    propsData: {
                        params: {
                            multiple: true,
                            strictValue: false,
                        },
                        options: getOptions(5),
                        value: [2, 'hello', 1, true],
                    },
                });

                await sleep(0);
                t.deepEqual(store.state.internalValue, [2, 'hello', 1, true]);
                t.end();
            });
        });

        st.test('in dynamic mode', (sTest) => {
            sTest.test('should set the internal value to null with invalid selection on single mode', async (t) => {
                const spyGetItems = {};
                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 3 }),
                        getItemsCallback: buildGetItemsCb({ someIds: [], spy: spyGetItems}),
                        params: {
                            strictValue: true,
                        },
                        value: 0,
                    },
                });

                await sleep(0);
                t.is(spyGetItems.nbCall, 1);
                t.deepEqual(store.state.internalValue, null);
                t.end();
            });

            sTest.skip('should keep the internal value with valid selection on single mode', async (t) => {
                const spyGetItems = {};
                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 3 }),
                        getItemsCallback: buildGetItemsCb({ someIds: [0], spy: spyGetItems }),
                        params: {
                            strictValue: true,
                        },
                        value: 0,
                    },
                });

                await sleep(0);
                t.is(spyGetItems.nbCall, 1);
                t.deepEqual(store.state.internalValue, 0);
                t.end();
            });

            sTest.test('should remove the invalid options from internal value on multiple mode', async (t) => {
                const spyGetItems = {};
                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 3 }),
                        getItemsCallback: buildGetItemsCb({ someIds: [2], spy: spyGetItems }),
                        params: {
                            multiple: true,
                            strictValue: true,
                        },
                        value: [2, 3, 4],
                    },
                });

                await sleep(0);
                t.is(spyGetItems.nbCall, 1);
                t.deepEqual(store.state.internalValue, [2]);
                t.end();
            });
        });
    });

    subT.test('"hideFilter" property', (st) => {
        st.test('having value "auto"', (sTest) => {
            sTest.test('should hide filter with few options', async (t) => {
                const store = new Store({
                    propsData: {
                        options: getOptions(3),
                        params: {
                            hideFilter: 'auto',
                        },
                    },
                });

                await sleep(0);

                t.is(store.state.hideFilter, true);
                t.end();
            });

            sTest.test('should show filter with many options', async (t) => {
                const store = new Store({
                    propsData: {
                        options: getOptions(11),
                        params: {
                            hideFilter: 'auto',
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, false);
                t.end();
            });

            sTest.test('should show filter with multiple', async (t) => {
                const store = new Store({
                    propsData: {
                        options: getOptions(3),
                        params: {
                            hideFilter: 'auto',
                            multiple: true,
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, false);
                t.end();
            });

            sTest.test('should show filter with dynamic options', async (t) => {
                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 5 }),
                        params: {
                            hideFilter: 'auto',
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, false);

                /* Assert it doesn't change after fetching data */
                store.commit('isOpen', true);
                await sleep(0);

                t.is(store.state.hideFilter, false);

                store.commit('isOpen', false);
                await sleep(0);

                t.is(store.state.hideFilter, false);
                t.end();
            });
        });

        st.test('having value "false"', (sTest) => {
            sTest.test('should show filter with few options', async (t) => {
                const store = new Store({
                    propsData: {
                        options: getOptions(3),
                        params: {
                            hideFilter: false,
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, false);
                t.end();
            });

            sTest.test('should show filter with dynamic options', async (t) => {
                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 5 }),
                        params: {
                            hideFilter: false,
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, false);

                /* Assert it doesn't change after fetching data */
                store.commit('isOpen', true);
                await sleep(0);

                t.is(store.state.hideFilter, false);

                store.commit('isOpen', false);
                await sleep(0);

                t.is(store.state.hideFilter, false);
                t.end();
            });
        });

        st.test('having value "true"', (sTest) => {
            sTest.test('should hide filter with many options', async (t) => {
                const store = new Store({
                    propsData: {
                        options: getOptions(11),
                        params: {
                            hideFilter: true,
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, true);
                t.end();
            });

            sTest.test('should hide filter with multiple', async (t) => {
                const store = new Store({
                    propsData: {
                        options: getOptions(3),
                        params: {
                            hideFilter: true,
                            multiple: true,
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, true);
                t.end();
            });

            sTest.test('should hide filter with dynamic options', async (t) => {
                const store = new Store({
                    propsData: {
                        fetchCallback: buildFetchCb({ total: 15 }),
                        params: {
                            hideFilter: true,
                        },
                    },
                });
                await sleep(0);

                t.is(store.state.hideFilter, true);

                /* Assert it doesn't change after fetching data */
                store.commit('isOpen', true);
                await sleep(0);

                t.is(store.state.hideFilter, true);

                store.commit('isOpen', false);
                await sleep(0);

                t.is(store.state.hideFilter, true);
                t.end();
            });
        });
    });
});