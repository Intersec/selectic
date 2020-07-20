const tape = require('tape');
const {
    getOptions,
    buildFetchCb,
} = require('../helper.js');
const _ = require('../tools.js');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('change props', (subT) => {
    subT.test('"value" should change internalValue but not hasChanged', async (t) => {
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

    subT.test('"options"', (sTest) => {
        sTest.test('should change options', async (t) => {
            const propOptions = getOptions(15, 'alpha');
            const store = new Store({ propsData: { options: propOptions } });
            await _.nextVueTick(store);
            store.commit('isOpen', true);

            await _.nextVueTick(store);

            t.is(store.state.allOptions.length, 15);

            store.options = getOptions(5, 'beta');

            await _.nextVueTick(store);
            const firstOption = store.state.filteredOptions[0];

            t.is(store.state.allOptions.length, 5);
            t.is(store.state.totalAllOptions, 5);
            t.is(store.state.filteredOptions.length, 5);
            t.is(store.state.totalFilteredOptions, 5);
            t.is(store.state.internalValue, 0);
            t.deepEqual(firstOption, {
                id: 0,
                text: 'beta0',
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

            t.is(store.state.internalValue, 0);
            t.is(store.state.disabled, true);
            t.is(store.state.isOpen, false);
            t.end();
        });

        sTest.test('should enable the select when more options are given', async (t) => {
            const store = new Store({
                propsData: {
                    options: getOptions(1, 'alpha'),
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
            t.is(store.state.disabled, false);
            t.is(store.state.isOpen, false);
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
