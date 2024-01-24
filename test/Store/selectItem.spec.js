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

        sTest.test('should select a unique value', (t) => {
            const store = getStore();

            t.is(store.state.internalValue, null);

            const result1 = store.selectItem(2, true);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            const result2 = store.selectItem(5, true);
            t.is(store.state.internalValue, 5);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');
            t.end();
        });

        sTest.test('should unselect a value', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            const result = store.selectItem(2, false);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);

            t.is(store.state.selectionIsExcluded, false);
            t.is(result, true, 'should return if a change occurs');
            t.end();
        });

        sTest.test('should not change when applying on item with same state', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            const result1 = store.selectItem(2, true);
            t.is(store.state.internalValue, 2);
            t.is(result1, false, 'should return if a change occurs');

            const result2 = store.selectItem(5, false);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should not change when applying on disabled item', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            const result1 = store.selectItem(4, true);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.is(result1, false, 'should return if a change occurs');

            store.state.internalValue = 4;
            store.state.status.hasChanged = false;

            const result2 = store.selectItem(4, false);
            t.is(store.state.internalValue, 4);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should select items when toggling', (t) => {
            const store = getStore();

            const result1 = store.selectItem(2);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            /* In single value, toggling will not unselect */
            const result2 = store.selectItem(2);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            /* disabled case */
            const result3 = store.selectItem(4);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.is(result3, false, 'should return if a change occurs');

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });

        sTest.test('should have set items as selected', (t) => {
            const store = getStore();
            store.commit('isOpen', true);

            const result1 = store.selectItem(2, true);
            t.is(store.state.filteredOptions[2].selected, true);
            t.is(result1, true, 'should return if a change occurs');

            const result2 = store.selectItem(5, true);
            t.is(store.state.filteredOptions[2].selected, false);
            t.is(store.state.filteredOptions[5].selected, true);
            t.is(result2, true, 'should return if a change occurs');

            const result3 = store.selectItem(5, false);
            t.is(store.state.filteredOptions[5].selected, false);
            t.is(result3, true, 'should return if a change occurs');

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

            const result1 = store.selectItem(null);
            t.is(store.state.isOpen, false);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            store.state.status.hasChanged = false;
            store.state.internalValue = 2;

            /* applied also when selectic is closed */
            const result2 = store.selectItem(null);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');

            store.state.status.hasChanged = false;
            store.state.internalValue = 3;

            /* ignore the selected argument */
            const result3 = store.selectItem(null, false);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, true);
            t.is(result3, true, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should reject invalid value with strictValue', (t) => {
            const store = getStore();

            const result1 = store.selectItem(456, true);
            t.is(store.state.internalValue, null);
            t.is(store.state.status.hasChanged, false);
            t.is(result1, false, 'should return if a change occurs');

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            const result2 = store.selectItem('3', true);
            t.is(store.state.internalValue, 2);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            t.end();
        });
    });

    st.test('when "multiple" is true', (sTest) => {
        function getStore() {
            const options = getOptions(8);
            options[4].disabled = true;
            options[6].exclusive = true;
            options[7].exclusive = true;

            const store = new Store({
                options: options,
                params: {
                    multiple: true,
                    strictValue: true,
                },
            });
            return store;
        }

        sTest.test('should select several value', (t) => {
            const store = getStore();

            t.deepEqual(store.state.internalValue, []);

            const result1 = store.selectItem(2, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            const result2 = store.selectItem(5, true);
            t.deepEqual(store.state.internalValue, [2, 5]);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });

        sTest.test('should keep order in which they where selected', (t) => {
            const store = getStore();

            const result1 = store.selectItem(2, true);
            const result2 = store.selectItem(5, true);
            const result3 = store.selectItem(1, true);
            const result4 = store.selectItem(3, true);
            t.deepEqual(store.state.internalValue, [2, 5, 1, 3]);
            t.is(result1, true, 'should return if a change occurs');
            t.is(result2, true, 'should return if a change occurs');
            t.is(result3, true, 'should return if a change occurs');
            t.is(result4, true, 'should return if a change occurs');

            const result5 = store.selectItem(5, true);
            t.deepEqual(store.state.internalValue, [2, 5, 1, 3]);
            t.is(result5, false, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should unselect a value', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            const result1 = store.selectItem(2, false);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            store.selectItem(2, true);
            store.selectItem(3, true);
            store.selectItem(5, true);
            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            const result2 = store.selectItem(3, false);
            t.deepEqual(store.state.internalValue, [2, 5]);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should not change when applying on item with same state', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            const result1 = store.selectItem(2, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(result1, false, 'should return if a change occurs');

            const result2 = store.selectItem(5, false);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should not change when applying on disabled item', (t) => {
            const store = getStore();

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            const result1 = store.selectItem(4, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);
            t.is(result1, false, 'should return if a change occurs');

            store.state.internalValue = [1, 4];
            store.state.status.hasChanged = false;

            const result2 = store.selectItem(4, false);
            t.deepEqual(store.state.internalValue, [1, 4]);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should toggle item selection', (t) => {
            const store = getStore();

            const result1 = store.selectItem(2);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            const result2 = store.selectItem(2);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');

            /* reset status to check that it is modified */
            store.state.status.hasChanged = false;

            /* disabled case */
            const result3 = store.selectItem(4);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, false);
            t.is(result3, false, 'should return if a change occurs');

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

            const result1 = store.selectItem(null);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            store.state.status.hasChanged = false;
            store.state.internalValue = [2, 4];

            /* ignore the selected argument */
            const result2 = store.selectItem(null, false);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');

            store.state.status.hasChanged = false;
            store.state.internalValue = [3, 4];

            /* applied also when selectic is open */
            store.commit('isOpen', true);
            const result3 = store.selectItem(null);
            t.is(store.state.isOpen, true);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, true);
            t.is(result3, true, 'should return if a change occurs');
            t.end();
        });

        sTest.test('should not change when applying on invalid values with strictValue', (t) => {
            const store = getStore();

            const result1 = store.selectItem(1.5, true);
            t.deepEqual(store.state.internalValue, []);
            t.is(store.state.status.hasChanged, false);
            t.is(result1, false, 'should return if a change occurs');

            store.selectItem(2, true);
            /* reset status to check that it is not modified */
            store.state.status.hasChanged = false;

            const result2 = store.selectItem(-42, true);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);
            t.is(result2, false, 'should return if a change occurs');

            const result3 = store.selectItem('2', false);
            t.deepEqual(store.state.internalValue, [2]);
            t.is(store.state.status.hasChanged, false);
            t.is(result3, false, 'should return if a change occurs');

            t.end();
        });

        sTest.test('should keep only exclusive item', (t) => {
            const store = getStore();
            store.state.internalValue = [1, 4, 5];

            const result1 = store.selectItem(6, true);
            t.deepEqual(store.state.internalValue, [6]);
            t.is(store.state.status.hasChanged, true);
            t.is(result1, true, 'should return if a change occurs');

            const result2 = store.selectItem(7, true);
            t.deepEqual(store.state.internalValue, [7]);
            t.is(store.state.status.hasChanged, true);
            t.is(result2, true, 'should return if a change occurs');

            const result3 = store.selectItem(1, true);
            t.deepEqual(store.state.internalValue, [1]);
            t.is(store.state.status.hasChanged, true);
            t.is(result3, true, 'should return if a change occurs');

            const result4 = store.selectItem(5, true);
            t.deepEqual(store.state.internalValue, [1, 5]);
            t.is(store.state.status.hasChanged, true);
            t.is(result4, true, 'should return if a change occurs');

            t.is(store.state.selectionIsExcluded, false);
            t.end();
        });
    });
});
