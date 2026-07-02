const {
    getOptions,
    buildFetchCb,
    toHaveBeenCalled,
    sleep,
    DEBOUNCE_REQUEST,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('multilines mode', (st) => {
    st.test('should build the options without opening', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multilines: true,
            },
        });
        await sleep(0);

        t.is(store.state.filteredOptions.length, 5,
            'the list is always displayed, options should be ready');
        t.is(store.state.totalFilteredOptions, 5);

        t.end();
    });

    st.test('search should filter the always-visible list', async (t) => {
        const store = new Store({
            options: getOptions(20),
            params: {
                multilines: true,
            },
        });
        await sleep(0);

        store.commit('searchText', 'text1');
        await sleep(0);

        /* text1, text10..text19 */
        t.is(store.state.totalFilteredOptions, 11);

        store.commit('searchText', '');
        await sleep(0);

        t.is(store.state.totalFilteredOptions, 20);

        t.end();
    });

    st.test('selection should work without opening', async (t) => {
        const store = new Store({
            options: getOptions(5),
            value: [1],
            params: {
                multiple: true,
                multilines: true,
            },
        });
        await sleep(0);

        store.selectItem(3, true);
        t.deepEqual(store.state.internalValue, [1, 3]);

        const option = store.state.filteredOptions.find((opt) => {
            return opt.id === 3;
        });
        t.true(option.selected, 'the option state should be updated');

        t.end();
    });

    st.test('should fetch dynamic options without opening', async (t) => {
        const spy = {};
        const store = new Store({
            fetchCallback: buildFetchCb({ total: 30, spy }),
            params: {
                multilines: true,
                pageSize: 10,
            },
        });
        await sleep(DEBOUNCE_REQUEST);

        /* The list is always displayed: the options must be fetched
         * without waiting for an opening which never happens. */
        t.ok(toHaveBeenCalled(spy), 'the fetch callback should be called');
        t.is(store.state.totalFilteredOptions, 30);
        t.ok(store.state.filteredOptions.length > 0,
            'the displayed list should not be empty');

        t.end();
    });

    st.test('should stay inert when disabled', async (t) => {
        const store = new Store({
            options: getOptions(5),
            disabled: true,
            params: {
                multiple: true,
                multilines: true,
            },
        });
        await sleep(0);

        /* There is no `isOpen` lock in this mode: the store itself must
         * refuse the interactions. */
        store.handleKeydown({
            key: 'ArrowDown',
            target: null,
            stopPropagation() {},
            preventDefault() {},
        });
        t.is(store.state.activeItemIdx, -1, 'keyboard should be ignored');

        t.end();
    });
});
