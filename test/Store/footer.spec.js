const {
    getOptions,
    buildFetchCb,
    sleep,
    DEBOUNCE_REQUEST,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

function buildStore(params = {}, props = {}) {
    const store = new Store(Object.assign({
        options: getOptions(20),
        params: Object.assign({ multiple: true }, params),
    }, props));

    store.commit('isOpen', true);

    return store;
}

/** Ids of the options the list currently displays */
function displayedIds(store) {
    return store.displayedOptions.value.map((item) => item.id);
}

tape.test('"show selection" view', (st) => {
    st.test('should restrict the list to the selected items', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.selectItem(2);
        store.selectItem(5);
        t.is(store.displayedOptions.value.length, 20,
            'the whole list is displayed by default');

        store.commit('showSelection', true);

        t.ok(store.isShowingSelection);
        t.deepEqual(displayedIds(store), [2, 5]);
        t.is(store.totalDisplayedOptions.value, 2,
            'the total should follow the displayed list');

        t.end();
    });

    st.test('should keep a single index space with the keyboard', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.selectItem(2);
        store.selectItem(5);
        store.commit('showSelection', true);

        /* The list displays [2, 5]: the second item is the option 5, not
         * the option 1 as it would be in the unfiltered list. */
        store.moveActiveItem('next');
        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, 1);

        store.selectActiveItem();
        t.deepEqual(store.state.internalValue, [2],
            'Enter should unselect the highlighted item (5)');

        t.end();
    });

    st.test('should exit the view when the selection empties', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.selectItem(2);
        store.commit('showSelection', true);
        t.ok(store.isShowingSelection);

        store.selectItem(null);
        await sleep(0);

        t.notOk(store.state.showSelection,
            'the view should not stay stranded on an empty list');
        t.is(store.displayedOptions.value.length, 20);

        t.end();
    });

    st.test('should be reset when the list is reopened', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.selectItem(2);
        store.commit('showSelection', true);
        t.ok(store.state.showSelection);

        store.commit('isOpen', false);
        store.commit('isOpen', true);

        t.notOk(store.state.showSelection,
            'reopening should start again on the whole list');

        t.end();
    });

    st.test('should never apply in exclusion mode', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.selectItem(2);
        store.commit('showSelection', true);
        t.ok(store.isShowingSelection);

        /* The state is set directly: when every option is known the store
         * turns an exclusion back into a plain selection, so the flag can
         * only stay set with partial (dynamic) data. */
        store.state.selectionIsExcluded = true;

        t.notOk(store.isShowingSelection,
            'internalValue holds the excluded items: the view would list '
            + 'exactly the options which are not selected');
        t.is(store.displayedOptions.value.length, 20);

        t.end();
    });

    st.test('should not apply on an excluded dynamic selection', async (t) => {
        const store = new Store({
            fetchCallback: buildFetchCb({ total: 30 }),
            value: [2],
            selectionIsExcluded: true,
            params: { multiple: true, allowRevert: true, pageSize: 10 },
        });
        store.commit('isOpen', true);
        await sleep(DEBOUNCE_REQUEST);

        store.commit('showSelection', true);

        t.ok(store.state.selectionIsExcluded,
            'the exclusion should be kept with partial data');
        t.notOk(store.isShowingSelection);

        t.end();
    });

    st.test('should not apply while items are not all fetched', async (t) => {
        const store = buildStore({ pageSize: 10 }, {
            options: undefined,
            fetchCallback: buildFetchCb({ total: 30 }),
        });
        await sleep(DEBOUNCE_REQUEST);

        store.selectItem(2);
        store.commit('showSelection', true);

        t.notOk(store.hasFetchedAllItems.value,
            'the fixture should not have fetched everything');
        t.notOk(store.isShowingSelection,
            'the not-yet-fetched selected items would be missing');

        t.end();
    });
});

tape.test('footer actions with a disabled store', (st) => {
    st.test('should ignore the keyboard', async (t) => {
        const store = buildStore({ multilines: true }, { disabled: true });
        await sleep(0);

        store.commit('activeItemIdx', 2);
        store.handleKeydown({
            key: 'Enter',
            target: null,
            stopPropagation() {},
            preventDefault() {},
        });

        t.deepEqual(store.state.internalValue, [],
            'a disabled multilines list must not be usable');

        t.end();
    });
});
