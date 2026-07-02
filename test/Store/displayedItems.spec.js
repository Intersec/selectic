const {
    getOptions,
    sleep,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

function buildStore(displayedItems) {
    return new Store({
        options: getOptions(50),
        params: { displayedItems },
    });
}

/* Same constant as the store one */
const MIN_DISPLAYED_ITEMS = 2;
const DEFAULT_ITEMS_PER_PAGE = 10;

tape.test('displayedItems parameter', (st) => {
    st.test('should set the number of items per page', async (t) => {
        const store = buildStore(25);
        await sleep(0);

        t.is(store.data.itemsPerPage, 25);

        t.end();
    });

    st.test('should keep a usable minimum', async (t) => {
        const store = buildStore(1);
        await sleep(0);

        t.is(store.data.itemsPerPage, MIN_DISPLAYED_ITEMS);

        const negativeStore = buildStore(-10);
        await sleep(0);

        t.is(negativeStore.data.itemsPerPage, MIN_DISPLAYED_ITEMS);

        t.end();
    });

    st.test('should ignore non finite values', async (t) => {
        /* `typeof NaN === 'number'`: without an explicit check these
         * values reach itemsPerPage and break the height of the list as
         * well as the pagination */
        const nanStore = buildStore(NaN);
        await sleep(0);

        t.is(nanStore.data.itemsPerPage, DEFAULT_ITEMS_PER_PAGE);

        const infiniteStore = buildStore(Infinity);
        await sleep(0);

        t.is(infiniteStore.data.itemsPerPage, DEFAULT_ITEMS_PER_PAGE);

        t.end();
    });

    st.test('should default when not given', async (t) => {
        const store = buildStore(undefined);
        await sleep(0);

        t.is(store.data.itemsPerPage, DEFAULT_ITEMS_PER_PAGE);

        t.end();
    });

    st.test('should be settable from the multilines property', async (t) => {
        /* `multilines: 5` is turned into `displayedItems: 5` by the
         * component; the store only sees the parameter. */
        const store = new Store({
            options: getOptions(50),
            params: { multilines: true, displayedItems: 5 },
        });
        await sleep(0);

        t.is(store.data.itemsPerPage, 5);
        t.ok(store.state.multilines, 'the mode should stay on');

        t.end();
    });

    st.test('should not be kept in the state', async (t) => {
        const store = buildStore(25);
        await sleep(0);

        t.notOk('displayedItems' in store.state,
            'the parameter is converted into itemsPerPage');

        t.end();
    });
});
