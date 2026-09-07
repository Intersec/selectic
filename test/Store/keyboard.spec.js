const {
    getOptions,
    buildFetchCb,
    sleep,
    DEBOUNCE_REQUEST,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

function buildStore(params = {}) {
    const store = new Store(Object.assign({
        options: getOptions(20),
    }, params));

    store.commit('isOpen', true);

    return store;
}

tape.test('moveActiveItem()', (st) => {
    st.test('should move to next and previous item', async (t) => {
        const store = buildStore();
        await sleep(0);

        t.is(store.state.activeItemIdx, -1);

        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, 0);

        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, 1);

        store.moveActiveItem('previous');
        t.is(store.state.activeItemIdx, 0);

        /* should not go below 0 */
        store.moveActiveItem('previous');
        t.is(store.state.activeItemIdx, 0);

        t.end();
    });

    st.test('should not move previous when no item is active', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.moveActiveItem('previous');
        t.is(store.state.activeItemIdx, -1);

        t.end();
    });

    st.test('should not go after last item', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.commit('activeItemIdx', 19);
        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, 19);

        t.end();
    });

    st.test('should move to first and last item', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.moveActiveItem('last');
        t.is(store.state.activeItemIdx, 19);

        store.moveActiveItem('first');
        t.is(store.state.activeItemIdx, 0);

        t.end();
    });

    st.test('should update offsetItem to display the active item', async (t) => {
        const store = buildStore({
            options: getOptions(300),
        });
        await sleep(0);

        store.moveActiveItem('last');
        t.is(store.state.activeItemIdx, 299);
        t.is(store.state.offsetItem, 300);

        store.moveActiveItem('first');
        t.is(store.state.activeItemIdx, 0);

        t.end();
    });

    st.test('should move page by page', async (t) => {
        const store = buildStore({
            options: getOptions(35),
        });
        await sleep(0);

        /* a page is data.itemsPerPage (default 10) */
        store.moveActiveItem('pageDown');
        t.is(store.state.activeItemIdx, 9);

        store.moveActiveItem('pageDown');
        t.is(store.state.activeItemIdx, 19);

        /* should be clamped to last item */
        store.moveActiveItem('pageDown');
        store.moveActiveItem('pageDown');
        t.is(store.state.activeItemIdx, 34);

        store.moveActiveItem('pageUp');
        t.is(store.state.activeItemIdx, 24);

        /* should be clamped to first item */
        store.moveActiveItem('pageUp');
        store.moveActiveItem('pageUp');
        store.moveActiveItem('pageUp');
        t.is(store.state.activeItemIdx, 0);

        t.end();
    });

    st.test('should do nothing when there is no option', async (t) => {
        const store = buildStore({ options: [] });
        await sleep(0);

        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, -1);

        store.moveActiveItem('last');
        t.is(store.state.activeItemIdx, -1);

        t.end();
    });

    st.test('should skip disabled options', async (t) => {
        const store = buildStore({
            options: [
                { id: 0, text: 'A', disabled: true },
                { id: 1, text: 'B' },
                { id: 2, text: 'C', disabled: true },
                { id: 3, text: 'D' },
                { id: 4, text: 'E', disabled: true },
            ],
        });
        await sleep(0);

        store.moveActiveItem('first');
        t.is(store.state.activeItemIdx, 1,
            'first should skip leading disabled options');

        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, 3, 'next should skip disabled options');

        store.moveActiveItem('next');
        t.is(store.state.activeItemIdx, 3,
            'should not move when only disabled options follow');

        store.moveActiveItem('previous');
        t.is(store.state.activeItemIdx, 1,
            'previous should skip disabled options');

        store.moveActiveItem('previous');
        t.is(store.state.activeItemIdx, 1,
            'should not move when only disabled options precede');

        store.moveActiveItem('last');
        t.is(store.state.activeItemIdx, 3,
            'last should skip trailing disabled options');

        t.end();
    });

    st.test('page moves should skip disabled options', async (t) => {
        const options = getOptions(30);
        options[9].disabled = true;
        const store = buildStore({ options });
        await sleep(0);

        store.moveActiveItem('pageDown');
        t.is(store.state.activeItemIdx, 10,
            'should land after the disabled target');

        store.commit('activeItemIdx', 19);
        store.moveActiveItem('pageUp');
        t.is(store.state.activeItemIdx, 8,
            'should land before the disabled target');

        store.moveActiveItem('pageUp');
        t.is(store.state.activeItemIdx, 0);

        t.end();
    });
});

tape.test('typeahead()', (st) => {
    const texts = ['Alpha', 'Bravo', 'Charlie', 'Chess', 'delta', 'Dolmen', 'echo'];

    function buildTypeaheadStore(extraOptions = {}) {
        return buildStore(Object.assign({
            options: texts.map((text, id) => ({ id, text })),
        }, extraOptions));
    }

    st.test('should activate the first matching option', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);
        store.data.typeaheadDelay = 20;

        store.typeahead('b');
        t.is(store.state.activeItemIdx, 1, 'should find "Bravo"');

        /* wait enough time so the typeahead text is reset */
        await sleep(30);

        store.typeahead('e');
        t.is(store.state.activeItemIdx, 6, 'should find "echo"');

        t.end();
    });

    st.test('should be case insensitive', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);

        store.typeahead('D');
        t.is(store.state.activeItemIdx, 4, 'should find "delta"');

        t.end();
    });

    st.test('should refine the match with several letters', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);

        store.typeahead('c');
        t.is(store.state.activeItemIdx, 2, 'should find "Charlie"');

        store.typeahead('h');
        store.typeahead('e');
        t.is(store.state.activeItemIdx, 3, 'should find "Chess"');

        t.end();
    });

    st.test('should cycle over options starting with the same letter', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);

        store.typeahead('c');
        t.is(store.state.activeItemIdx, 2, 'should find "Charlie"');

        store.typeahead('c');
        t.is(store.state.activeItemIdx, 3, 'should find "Chess"');

        store.typeahead('c');
        t.is(store.state.activeItemIdx, 2, 'should cycle back to "Charlie"');

        t.end();
    });

    st.test('should reset the text after the typeahead delay', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);
        store.data.typeaheadDelay = 20;

        store.typeahead('b');
        t.is(store.state.activeItemIdx, 1, 'should find "Bravo"');

        /* "bd" matches nothing, so it only works if the text is reset */
        await sleep(30);
        store.typeahead('d');
        t.is(store.state.activeItemIdx, 4, 'should find "delta"');

        /* without the delay, letters accumulate and match nothing */
        store.typeahead('b');
        t.is(store.state.activeItemIdx, 4,
            'should stay on "delta" ("db" matches nothing)');

        t.end();
    });

    st.test('should skip disabled options', async (t) => {
        const store = buildTypeaheadStore({
            options: [
                { id: 0, text: 'Alpha' },
                { id: 1, text: 'Bravo', disabled: true },
                { id: 2, text: 'Bud' },
            ],
        });
        await sleep(0);

        store.typeahead('b');
        t.is(store.state.activeItemIdx, 2, 'should find "Bud"');

        t.end();
    });

    st.test('isTypeaheadActive should follow the typeahead delay', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);
        store.data.typeaheadDelay = 20;

        t.false(store.isTypeaheadActive);

        store.typeahead('b');
        t.true(store.isTypeaheadActive);

        await sleep(30);
        t.false(store.isTypeaheadActive);

        t.end();
    });

    st.test('should ignore non printable keys', async (t) => {
        const store = buildTypeaheadStore();
        await sleep(0);

        store.typeahead('Enter');
        t.is(store.state.activeItemIdx, -1);

        t.end();
    });

    st.test('should update offsetItem to display the active item', async (t) => {
        const options = getOptions(299);
        options.push({ id: 299, text: 'zzz last' });
        const store = buildStore({ options });
        await sleep(0);

        store.typeahead('z');
        t.is(store.state.activeItemIdx, 299);
        t.is(store.state.offsetItem, 300);

        t.end();
    });
});

tape.test('handleKeydown()', (st) => {
    function fakeEvent(key, replace = {}) {
        return Object.assign({
            key,
            target: null,
            ctrlKey: false,
            altKey: false,
            metaKey: false,
            stopPropagation() {},
            preventDefault() {},
        }, replace);
    }

    st.test('Enter should select the active item', async (t) => {
        const store = buildStore({ params: { multiple: true } });
        await sleep(0);

        store.commit('activeItemIdx', 2);
        store.handleKeydown(fakeEvent('Enter'));
        t.deepEqual(store.state.internalValue, [2]);

        t.end();
    });

    st.test('should let buttons handle their own keys', async (t) => {
        const store = buildStore({ params: { multiple: true } });
        await sleep(0);

        store.commit('activeItemIdx', 2);
        store.handleKeydown(fakeEvent('Enter', {
            target: { tagName: 'BUTTON' },
        }));
        t.deepEqual(store.state.internalValue, [],
            'Enter on a button should not select the active item');

        t.end();
    });

    st.test('Space should select while the search is empty', async (t) => {
        const store = buildStore({ params: { multiple: true } });
        await sleep(0);

        store.commit('activeItemIdx', 2);
        store.handleKeydown(fakeEvent(' ', {
            target: { tagName: 'INPUT', type: 'text', value: '' },
        }));

        t.deepEqual(store.state.internalValue, [2],
            'the expected gesture after having moved with the arrows');

        t.end();
    });

    st.test('Space should be typed once the search is used', async (t) => {
        const store = buildStore({ params: { multiple: true } });
        await sleep(0);

        store.commit('activeItemIdx', 2);
        store.handleKeydown(fakeEvent(' ', {
            target: { tagName: 'INPUT', type: 'text', value: 'text1' },
        }));

        t.deepEqual(store.state.internalValue, [],
            'an expression of several words must stay searchable');

        t.end();
    });

    st.test('should keep driving the list from a button', async (t) => {
        const store = buildStore({ params: { multiple: true } });
        await sleep(0);

        const onButton = { target: { tagName: 'BUTTON' } };

        /* Only the keys the buttons need natively are left to them: the
         * navigation must keep working from the footer buttons. */
        store.handleKeydown(fakeEvent('ArrowDown', onButton));
        t.is(store.state.activeItemIdx, 0, 'ArrowDown should move the item');

        store.handleKeydown(fakeEvent('End', onButton));
        t.is(store.state.activeItemIdx, 19, 'End should move to the last item');

        t.end();
    });

    st.test('should not typeahead from a button', async (t) => {
        const store = buildStore({ params: { hideFilter: true } });
        await sleep(0);

        store.handleKeydown(fakeEvent('t', {
            target: { tagName: 'BUTTON' },
        }));
        t.is(store.state.activeItemIdx, -1,
            'typing on a button should not move the active item');

        t.end();
    });

    st.test('should ignore every key when disabled', async (t) => {
        const store = buildStore({
            disabled: true,
            params: { multilines: true },
        });
        await sleep(0);

        store.handleKeydown(fakeEvent('ArrowDown'));
        t.is(store.state.activeItemIdx, -1,
            'the always-displayed list must stay inert when disabled');

        t.end();
    });

    st.test('arrow keys should move the active item', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.handleKeydown(fakeEvent('ArrowDown'));
        t.is(store.state.activeItemIdx, 0);

        store.handleKeydown(fakeEvent('End'));
        t.is(store.state.activeItemIdx, 19);

        t.end();
    });

    st.test('Escape should close the list', async (t) => {
        const store = buildStore();
        await sleep(0);

        store.handleKeydown(fakeEvent('Escape'));
        t.is(store.state.isOpen, false);

        t.end();
    });

    st.test('Escape should not close in multilines mode', async (t) => {
        const store = buildStore({ params: { multilines: true } });
        await sleep(0);

        store.handleKeydown(fakeEvent('Escape'));
        t.is(store.state.isOpen, true);

        t.end();
    });

    st.test('list navigation should work in multilines mode', async (t) => {
        /* no isOpen commit: the multilines list is always displayed */
        const store = new Store({
            options: getOptions(10),
            params: {
                multilines: true,
            },
        });
        await sleep(0);

        store.handleKeydown(fakeEvent('ArrowDown'));
        t.is(store.state.activeItemIdx, 0);

        store.handleKeydown(fakeEvent('End'));
        t.is(store.state.activeItemIdx, 9);

        t.end();
    });

    st.test('chips navigation should be disabled in multilines mode', async (t) => {
        const store = new Store({
            options: getOptions(10),
            value: [2, 4],
            params: {
                multiple: true,
                multilines: true,
            },
        });
        await sleep(0);

        store.handleKeydown(fakeEvent('ArrowLeft'));
        t.is(store.state.activeChipIdx, -1,
            'the selection is visible in the list, there is no chip');

        store.handleKeydown(fakeEvent('Backspace'));
        t.is(store.state.activeChipIdx, -1);
        t.deepEqual(store.state.internalValue, [2, 4],
            'Backspace should not unselect anything');

        t.end();
    });
});

tape.test('active chip', (st) => {
    function buildMultipleStore(replaceParams = {}) {
        const store = new Store({
            options: getOptions(10),
            value: [2, 4, 6],
            params: Object.assign({
                multiple: true,
            }, replaceParams),
        });

        store.commit('isOpen', true);

        return store;
    }

    st.test('should be initialized to -1', (t) => {
        const store = new Store();

        t.is(store.state.activeChipIdx, -1);
        t.end();
    });

    st.test('moveActiveChip() should navigate through selected items', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        /* previous starts from the last chip */
        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 2);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 1);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 0);

        /* previous before the first chip deactivates chip navigation */
        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, -1);

        /* next from no active chip starts from the first chip */
        store.moveActiveChip('next');
        t.is(store.state.activeChipIdx, 0);

        store.moveActiveChip('next');
        t.is(store.state.activeChipIdx, 1);

        /* next after the last chip deactivates chip navigation */
        store.moveActiveChip('next');
        store.moveActiveChip('next');
        t.is(store.state.activeChipIdx, -1);

        t.end();
    });

    st.test('moveActiveChip() should do nothing in single mode', async (t) => {
        const store = buildStore({ value: 2 });
        await sleep(0);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, -1);

        t.end();
    });

    st.test('moveActiveChip() should do nothing without selection', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);
        store.selectItem(null);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, -1);

        t.end();
    });

    st.test('removeActiveChip() should unselect the active chip', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        store.moveActiveChip('previous');
        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 1);

        store.removeActiveChip();
        t.deepEqual(store.state.internalValue, [2, 6]);
        t.is(store.state.activeChipIdx, 1, 'should stay on the next chip');

        store.removeActiveChip();
        t.deepEqual(store.state.internalValue, [2]);
        t.is(store.state.activeChipIdx, 0,
            'should be clamped to the last chip');

        store.removeActiveChip();
        t.deepEqual(store.state.internalValue, []);
        t.is(store.state.activeChipIdx, -1,
            'should be deactivated when there is no more chips');

        t.end();
    });

    st.test('removeActiveChip() should do nothing when no chip is active', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        store.removeActiveChip();
        t.deepEqual(store.state.internalValue, [2, 4, 6]);

        t.end();
    });

    st.test('should reset activeChipIdx on search', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 2);

        store.commit('searchText', 'text');
        t.is(store.state.activeChipIdx, -1);

        t.end();
    });

    st.test('should reset activeChipIdx when selection changes', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 2);

        store.selectItem(0, true);
        t.is(store.state.activeChipIdx, -1);

        t.end();
    });

    st.test('should reset activeChipIdx when closing', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        store.moveActiveChip('previous');
        t.is(store.state.activeChipIdx, 2);

        store.commit('isOpen', false);
        t.is(store.state.activeChipIdx, -1);

        t.end();
    });
});

tape.test('navigation with unfetched options', (st) => {
    function buildDynamicStore() {
        const store = new Store({
            fetchCallback: buildFetchCb({ total: 30 }),
            params: { pageSize: 10 },
        });

        store.commit('isOpen', true);

        return store;
    }

    st.test('End should reach the last option', async (t) => {
        const store = buildDynamicStore();
        await sleep(DEBOUNCE_REQUEST);

        t.is(store.state.filteredOptions.length, 10,
            'the fixture should have fetched a single page');

        store.moveActiveItem('last');

        /* options which are not fetched yet are considered enabled: the
         * navigation must not stop at the end of the fetched page */
        t.is(store.state.activeItemIdx, 29);

        t.end();
    });

    st.test('PageDown should jump a whole page', async (t) => {
        const store = buildDynamicStore();
        await sleep(DEBOUNCE_REQUEST);

        store.commit('activeItemIdx', 0);
        store.moveActiveItem('pageDown');

        t.is(store.state.activeItemIdx, 10);

        t.end();
    });
});

tape.test('ARIA ids', (st) => {
    st.test('should provide ids for list and options', (t) => {
        const store = new Store();
        const uid = store._uid;

        t.is(store.listBoxId, `selectic-${uid}-list`);
        t.is(store.optionId(12), `selectic-${uid}-item-12`);

        t.end();
    });

    st.test('should be unique between two instances', (t) => {
        const first = new Store();
        const second = new Store();

        /* two Selectic on the same page must not share their ids, or
         * `aria-controls` and `aria-activedescendant` would point at the
         * elements of the other one */
        t.notEqual(first.listBoxId, second.listBoxId);
        t.notEqual(first.optionId(3), second.optionId(3));

        t.end();
    });
});
