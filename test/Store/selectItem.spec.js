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
    getOptions,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('selectItem()', (st) => {
    st.test('when "multiple" is false', (sTest) => {
        function getStore() {
            const options = getOptions(6);
            options[4].disabled = true;

            const store = new Store({ propsData: {
                options: options,
                params: {
                    multiple: false,
                    autoSelect: false,
                    strictValue: true,
                },
            }});
            return store;
        }

        sTest.test('should select a unique value', (t) => {
            const store = getStore();

            t.is(store.state.internalValue, null);

            store.selectItem(2, true);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, true);

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            store.selectItem(5, true);
            t.is(store.state.internalValue, 5);
            t.is(store.state.status.hasChanged, true);
            t.end();
        });

        sTest.test('should unselect a value', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            store.selectItem(2, false);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });

        sTest.test('should not change when applying on other item', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            store.selectItem(2, true);
            t.is(store.state.internalValue, 2);

            store.selectItem(5, false);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });

        sTest.test('should not change when applying on disabled item', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            store.selectItem(4, true);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);

            store.state.internalValue = 4;
            store.state.status.hasChanged = false;

            store.selectItem(4, false);
            t.is(store.state.internalValue, 4);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });

        sTest.test('should select items when toggling', (t) => {
            const store = getStore();

            store.selectItem(2);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, true);

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            /* In single value, toggling will not unselect */
            store.selectItem(2);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);

            /* disabled case */
            store.selectItem(4);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });

        sTest.test('should have set items as selected', (t) => {
            const store = getStore();
            store.commit('isOpen', true);

            store.selectItem(2, true);
            t.is(store.state.filteredOptions[2].selected, true);

            store.selectItem(5, true);
            t.is(store.state.filteredOptions[2].selected, false);
            t.is(store.state.filteredOptions[5].selected, true);

            store.selectItem(5, false);
            t.is(store.state.filteredOptions[5].selected, false);
            t.end();
        });

        sTest.test('should close list', (t) => {
            const store = getStore();
            store.commit('isOpen', true);

            /* on new selected item */
            store.selectItem(2, true);
            t.is(store.state.isOpen, false);

            store.commit('isOpen', true);

            /* on previously selected item */
            store.selectItem(2, true);
            t.is(store.state.isOpen, false);

            store.commit('isOpen', true);

            /* on disabled item, it should not close list */
            store.selectItem(4, true);
            t.is(store.state.isOpen, true);
            t.end();
        });

        sTest.test('should clear selection', (t) => {
            const store = getStore();
            store.commit('isOpen', true);
            store.state.internalValue = 1;

            store.selectItem(null);
            t.is(store.state.isOpen, false);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);

            store.state.status.hasChanged = false;
            store.state.internalValue = 2;

            /* applied also when selectic is closed */
            store.selectItem(null);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);

            store.state.status.hasChanged = false;
            store.state.internalValue = 3;

            /* ignore the selected argument */
            store.selectItem(null, false);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);
            t.end();
        });

        sTest.test('should reject invalid value with strictValue', (t) => {
            const store = getStore();

            store.selectItem(456, true);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, false);

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            store.selectItem('3', true);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });
    });

    st.test('when "multiple" is true', (sTest) => {
        function getStore() {
            const options = getOptions(6);
            options[4].disabled = true;

            const store = new Store({ propsData: {
                options: options,
                params: {
                    multiple: true,
                    strictValue: true,
                },
            }});
            return store;
        }

        sTest.test('should select several value', (t) => {
            const store = getStore();

            t.deepEqual(store.state.internalValue, []);

            store.selectItem(2, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, true);

            store.selectItem(5, true);
            t.deepEqual(store.state.internalValue, [2, 5]);
            t.is(store.state.status.hasChanged, true);

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });

        sTest.test('should keep order in which they where selected', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            store.selectItem(5, true);
            store.selectItem(1, true);
            store.selectItem(3, true);
            t.deepEqual(store.state.internalValue, [2, 5, 1, 3]);

            store.selectItem(5, true);
            t.deepEqual(store.state.internalValue, [2, 5, 1, 3]);
            t.end();
        });

        sTest.test('should unselect a value', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            store.selectItem(2, false);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);

            store.selectItem(2, true);
            store.selectItem(3, true);
            store.selectItem(5, true);
            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            store.selectItem(3, false);
            t.deepEqual(store.state.internalValue, [2, 5]);
            t.is(store.state.status.hasChanged, true);
            t.end();
        });

        sTest.test('should not change when applying on other item', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            store.selectItem(2, true);
            t.deepEqual(store.state.internalValue, [2]);

            store.selectItem(5, false);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });

        sTest.test('should not change when applying on disabled item', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            store.selectItem(4, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);

            store.state.internalValue = [1, 4];
            store.state.status.hasChanged = false;

            store.selectItem(4, false);
            t.deepEqual(store.state.internalValue, [1, 4]);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });

        sTest.test('should toggle item selection', (t) => {
            const store = getStore();

            store.selectItem(2);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, true);

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            store.selectItem(2);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            /* disabled case */
            store.selectItem(4);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, false);

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });

        sTest.test('should have set items as selected', (t) => {
            const store = getStore();
            store.commit('isOpen', true);

            store.selectItem(2, true);
            t.is(store.state.filteredOptions[2].selected, true);

            store.selectItem(5, true);
            t.is(store.state.filteredOptions[2].selected, true);
            t.is(store.state.filteredOptions[5].selected, true);

            store.selectItem(2, false);
            t.is(store.state.filteredOptions[2].selected, false);
            t.is(store.state.filteredOptions[5].selected, true);
            t.end();
        });

        sTest.test('should not close list', (t) => {
            const store = getStore();
            store.commit('isOpen', true);

            store.selectItem(2, true);
            t.is(store.state.isOpen, true);

            store.selectItem(2, false);
            t.is(store.state.isOpen, true);

            store.selectItem(4, true);
            t.is(store.state.isOpen, true);
            t.end();
        });


        sTest.test('should clear selection', (t) => {
            const store = getStore();
            store.state.internalValue = [1, 4];

            store.selectItem(null);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);

            store.state.status.hasChanged = false;
            store.state.internalValue = [2, 4];

            /* ignore the selected argument */
            store.selectItem(null, false);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);

            store.state.status.hasChanged = false;
            store.state.internalValue = [3, 4];

            /* applied also when selectic is open */
            store.commit('isOpen', true);
            store.selectItem(null);
            t.is(store.state.isOpen, true);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);
            t.end();
        });

        sTest.test('should not change when applying on invalid values with strictValue', (t) => {
            const store = getStore();

            store.selectItem(1.5, true);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, false);

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            store.selectItem(-42, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);

            store.selectItem('2', false);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);
            t.end();
        });
    });
});
