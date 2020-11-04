const tape = require('tape');
const {
    getOptions,
    buildFetchCb,
} = require('../helper.js');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('change props', (subT) => {
    subT.test('"value"', (sTest) => {
        sTest.test('should change internalValue but not hasChanged', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            propOptions[12].disabled = true;

            const store = new Store({
                propsData: {
                    options: propOptions,
                    value: 1,
                },
            });

            await _.nextVueTick(store);
            store.value = 23;

            await _.nextVueTick(store);
            t.is(store.state.internalValue, 23);
            t.is(store.state.status.hasChanged, false);

            store.value = 12;
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 12);
            t.is(store.state.status.hasChanged, false);

            t.end();
        });
    });

    subT.test('"options"', (sTest) => {
        sTest.test('should change options', async (t) => {
            const propOptions = getOptions(15, 'alpha', 2);
            const store = new Store({ propsData: { options: propOptions } });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.allOptions.length, 15);

            /* change options */
            store.options = getOptions(5, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.isOpen, false, 'should close the component');

            store.commit('isOpen', true);
            await _.nextVueTick(store);
            const firstOption = store.state.filteredOptions[0];
            const selectedOption = store.state.filteredOptions[2];

            t.is(store.state.allOptions.length, 5, 'should have updated allOptions');
            t.is(store.state.totalAllOptions, 5, 'should have updated totalAllOptions');
            t.is(store.state.filteredOptions.length, 5, 'should have updated filteredOptions');
            t.is(store.state.totalFilteredOptions, 5, 'should have updated totalFilteredOptions');
            t.is(store.state.internalValue, 2, 'should keep previous selected value');
            t.deepEqual(firstOption, {
                id: 0,
                text: 'beta0',
                disabled: false,
                selected: false,
                isGroup: false,
            });
            t.deepEqual(selectedOption, {
                id: 2,
                text: 'beta2',
                disabled: false,
                selected: true,
                isGroup: false,
            });
            t.is(store.state.status.errorMessage, '');
            t.end();
        });

        sTest.test('should invalid selection in strictValue', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            const store = new Store({
                propsData: {
                    options: propOptions,
                    value: 7,
                    params: {
                        autoSelect: false,
                        strictValue: true,
                    },
                },
            });
            store.commit('isOpen', true);

            t.is(store.state.internalValue, 7);

            store.options = getOptions(5, 'beta');

            await _.nextVueTick(store);
            t.is(store.state.internalValue, null);
            t.end();
        });

        sTest.test('should keep valid selection in strictValue', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            const store = new Store({
                propsData: {
                    options: propOptions,
                    value: 3,
                    params: {
                        autoSelect: false,
                        strictValue: true,
                    },
                },
            });
            store.commit('isOpen', true);

            t.is(store.state.internalValue, 3);

            store.options = getOptions(5, 'beta');

            await _.nextVueTick(store);
            t.is(store.state.internalValue, 3);
            t.end();
        });

        sTest.test('should accept new selection in strictValue', async (t) => {
            const propOptions = getOptions(5, 'alpha');
            const store = new Store({
                propsData: {
                    options: propOptions,
                    value: 3,
                    params: {
                        autoSelect: false,
                        strictValue: true,
                    },
                },
            });
            store.commit('isOpen', true);
            await _.nextVueTick(store);
            store.options = getOptions(10, 'beta');
            await _.nextVueTick(store);

            store.value = 7;

            await _.nextVueTick(store);
            t.is(store.state.internalValue, 7);
            t.end();
        });

        sTest.test('should update selection in strictValue and multiple', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            const store = new Store({
                propsData: {
                    options: propOptions,
                    value: [3, 7, 11],
                    params: {
                        autoSelect: false,
                        strictValue: true,
                        multiple: true,
                    },
                },
            });
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.deepEqual(store.state.internalValue, [3, 7, 11]);

            store.options = getOptions(10, 'beta');
            await _.nextVueTick(store);
            t.deepEqual(store.state.internalValue, [3, 7]);

            store.options = getOptions(5, 'gamma');

            await _.nextVueTick(store);
            t.deepEqual(store.state.internalValue, [3]);
            t.end();
        });

        sTest.test('should update selection', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            const store = new Store({
                propsData: {
                    options: propOptions,
                    value: 7,
                    params: {
                        autoSelect: false,
                        strictValue: false,
                    },
                },
            });
            await _.nextVueTick(store);
            store.commit('isOpen', true);

            await _.nextVueTick(store);
            t.is(store.state.selectedOptions.text, 'alpha7');

            store.options = getOptions(10, 'beta');
            await _.deferPromise(_.nextVueTick(store));

            t.is(store.state.selectedOptions.text, 'beta7');
            t.end();
        });

        sTest.test('should disable the select when only one option is given', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(5, 'alpha'),
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, true);

            store.options = getOptions(1, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0, 'should keep the correct value selected');
            t.is(store.state.disabled, true, 'should disable the component');
            t.is(store.state.isOpen, false, 'should close the component');
            t.end();
        });

        sTest.test('should not disable the select with an invalid value', async (t) => {
            const store = new Store({
                propsData: {
                    value: 2,
                    options: getOptions(5, 'alpha'),
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 2);
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, true);

            store.options = getOptions(1, 'beta', 6);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 2, 'should keep the invalid value');
            t.is(store.state.disabled, false, 'should not disable the component');
            t.is(store.state.isOpen, false, 'should close the component');
            t.end();
        });

        sTest.test('should disable the select with an invalid value in strict mode', async (t) => {
            const store = new Store({
                propsData: {
                    value: 2,
                    options: getOptions(5, 'alpha'),
                    params: {
                        autoDisabled: true,
                        strictValue: true,
                        autoSelect: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 2);
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, true);

            store.options = getOptions(1, 'beta', 6);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 6, 'should have auto-selected the first value');
            t.is(store.state.disabled, true, 'should disable the component');
            t.is(store.state.isOpen, false, 'should have close the component');
            t.end();
        });

        sTest.test('should enable the select when more options are given', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1, 'alpha', 1),
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 1);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.options = getOptions(5, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 1, 'should keep selected value');
            t.is(store.state.disabled, false, 'should enable the component');
            t.is(store.state.isOpen, false, 'should close the component anyway');
            t.end();
        });

        sTest.test('should not re-enable the select if disable is set', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1, 'alpha'),
                    disabled: true,
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.options = getOptions(5, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);
            t.end();
        });

        sTest.test('should fallback to next option source', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                propsData: {
                    options: getOptions(10),
                    childOptions: getOptions(2, '', 10),
                    fetchCallback: buildFetchCb({ total: 4, command, spy }),
                    params: {
                        optionBehavior: 'force-ODE',
                    },
                },
            });
            store.commit('isOpen', true);
            await _.nextVueTick(store);
            t.is(store.state.filteredOptions.length, 10);

            store.options = [];
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.sleep(0);
            command.fetch();
            await _.nextVueTick(store, spy.promise);

            t.is(store.state.filteredOptions.length, 4, 'should fallback to dynamic options');

            store.options = getOptions(3);
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.filteredOptions.length, 3, 'should get back to static options');
            t.end();
        });
    });

    subT.test('"childOptions"', (sTest) => {
        sTest.test('should change childOptions', async (t) => {
            const propOptions = getOptions(15, 'alpha', 1);
            const store = new Store({ propsData: { childOptions: propOptions } });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.allOptions.length, 15);

            store.childOptions = getOptions(5, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.isOpen, false, 'should close component');

            store.commit('isOpen', true);
            await _.nextVueTick(store);
            const secondOption = store.state.filteredOptions[1];

            t.is(store.state.allOptions.length, 5, 'should have updated allOptions');
            t.is(store.state.totalAllOptions, 5, 'should have updated totalAllOptions');
            t.is(store.state.filteredOptions.length, 5, 'should have updated filteredOptions');
            t.is(store.state.totalFilteredOptions, 5, 'should have updated totalFilteredOptions');
            t.is(store.state.internalValue, 1, 'should have kept previous selected value');
            t.deepEqual(secondOption, {
                id: 1,
                text: 'beta1',
                disabled: false,
                selected: true,
                isGroup: false,
            });
            t.is(store.state.status.errorMessage, '');
            t.end();
        });

        sTest.test('should update selection', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            const store = new Store({
                propsData: {
                    childOptions: propOptions,
                    value: 7,
                    params: {
                        autoSelect: false,
                        strictValue: false,
                    },
                },
            });
            await _.nextVueTick(store);
            store.commit('isOpen', true);

            await _.nextVueTick(store);
            t.is(store.state.selectedOptions.text, 'alpha7');

            store.childOptions = getOptions(10, 'beta');
            await _.deferPromise(_.nextVueTick(store));

            t.is(store.state.selectedOptions.text, 'beta7');
            t.end();
        });

        sTest.test('should disable the select when only one option is given', async (t) => {
            const store = new Store({
                propsData: {
                    childOptions: getOptions(5, 'alpha'),
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, true);

            store.childOptions = getOptions(1, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);
            t.end();
        });

        sTest.test('should enable the select when more options are given', async (t) => {
            const store = new Store({
                propsData: {
                    childOptions: getOptions(1, 'alpha'),
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.childOptions = getOptions(5, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, false);
            t.end();
        });

        sTest.test('should disable the select when only one option is available for all sources', async (t) => {
            const alphaOptions = getOptions(1, 'alpha');
            const bravoOptions = getOptions(1, 'bravo');
            const store = new Store({
                propsData: {
                    options: alphaOptions,
                    childOptions: bravoOptions,
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            /* options 1
             * child 1
             */
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, true);

            /* options 1 disabled
             * child 1
             */
            const charlyOptions = getOptions(1, 'charly');
            charlyOptions[0].disabled = true;
            store.options = charlyOptions;
            await _.nextVueTick(store);

            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.options = alphaOptions;
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            /* options 0
             * child 1
             */
            store.options = getOptions(0, 'delta');
            await _.nextVueTick(store);

            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.options = alphaOptions;
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            /* options 1
             * child 1 disabled
             */
            const echoOptions = getOptions(1, 'echo');
            echoOptions[0].disabled = true;
            store.childOptions = echoOptions;
            await _.nextVueTick(store);

            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.childOptions = bravoOptions;
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            /* options 1
             * child 0
             */
            store.childOptions = getOptions(0, 'fox');
            await _.nextVueTick(store);

            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            t.end();
        });

        sTest.test('should not re-enable the select if disable is set', async (t) => {
            const store = new Store({
                propsData: {
                    childOptions: getOptions(1, 'alpha'),
                    disabled: true,
                    params: {
                        autoDisabled: true,
                    },
                },
            });
            await _.nextVueTick(store);

            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);

            store.childOptions = getOptions(5, 'beta');
            await _.nextVueTick(store);

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);
            t.end();
        });

        sTest.test('should fallback to next option source', async (t) => {
            const command = {};
            const spy = {};

            const store = new Store({
                propsData: {
                    options: getOptions(10),
                    childOptions: getOptions(2, '', 10),
                    fetchCallback: buildFetchCb({ total: 4, command, spy }),
                    params: {
                        optionBehavior: 'force-EDO',
                    },
                },
            });
            store.commit('isOpen', true);
            await _.nextVueTick(store);
            t.is(store.state.filteredOptions.length, 2);

            store.childOptions = [];
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.sleep(0);
            command.fetch();
            await _.nextVueTick(store, spy.promise);

            t.is(store.state.filteredOptions.length, 4, 'should fallback to dynamic options');

            store.childOptions = getOptions(2);
            await _.nextVueTick(store);
            store.commit('isOpen', true);
            await _.nextVueTick(store);

            t.is(store.state.filteredOptions.length, 2, 'should get back to element options');
            t.end();
        });
    });

    subT.test('should change "selectionIsExcluded"', async (t) => {
        const store = new Store({
            propsData: {
                fetchCallback: buildFetchCb({ total: 5 }),
                selectionIsExcluded: false,
                params: {
                    multiple: true,
                },
            },
        });
        store.selectionIsExcluded = true;

        await _.nextVueTick(store);
        t.is(store.state.selectionIsExcluded, true);

        store.selectionIsExcluded = false;

        await _.nextVueTick(store);
        t.is(store.state.selectionIsExcluded, false);
        t.end();
    });

    subT.test('should change "disabled"', async (t) => {
        const store = new Store({
            propsData: {
                options: getOptions(2),
            },
        });

        store.disabled = true;
        await _.nextVueTick(store);

        t.is(store.state.disabled, true);

        store.disabled = false;
        await _.nextVueTick(store);

        t.is(store.state.disabled, false);

        t.end();
    });
});
