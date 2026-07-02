const tape = require('tape');
const {
    getOptions,
    sleep,
} = require('../helper.js');
const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');

/* Minimal window stub: ExtendedList reads it to compute the list position */
global.window = global.window || {
    innerHeight: 800,
    innerWidth: 1200,
};

const components = require('../dist/components.js');
const Selectic = components.Selectic;
const MainInput = components.MainInput;
const ExtendedList = components.ExtendedList;
const MultilinesList = components.MultilinesList;
const List = components.List;
const Filter = components.Filter;
const Footer = components.Footer;
const Icon = components.Icon;
const Store = components.Store;

function render(Component, props) {
    return renderToString(createSSRApp(Component, props));
}

/** Return the first tag (as string) having the given class */
function extractTag(html, className) {
    const re = new RegExp(
        '<[a-z]+[^>]*class="[^"]*' + className + '[^"]*"[^>]*>'
    );
    const result = html.match(re);

    return result ? result[0] : '';
}

tape.test('ARIA: hidden input', (st) => {
    st.test('should be removed from the accessibility tree', async (t) => {
        const html = await render(Selectic, {
            options: getOptions(5),
            value: 2,
        });
        const input = extractTag(html, 'selectic__input-value');

        t.ok(input.includes('aria-hidden="true"'),
            'input should have aria-hidden');
        t.ok(input.includes('tabindex="-1"'),
            'input should not be in the tab sequence');

        t.end();
    });
});

tape.test('ARIA: combobox (main input)', (st) => {
    st.test('should have the combobox semantic', async (t) => {
        const store = new Store({
            options: getOptions(5),
            value: 2,
        });
        await sleep(0);
        const html = await render(MainInput, { store });
        const combobox = extractTag(html, 'selectic-input');

        t.ok(combobox.includes('role="combobox"'), 'should be a combobox');
        t.ok(combobox.includes('aria-expanded="false"'),
            'should be collapsed');
        t.ok(combobox.includes('aria-haspopup="listbox"'),
            'should announce the listbox popup');
        t.ok(combobox.includes(`aria-controls="${store.listBoxId}"`),
            'should be linked to the listbox');
        t.ok(combobox.includes('tabindex="0"'),
            'should be in the tab sequence');

        t.end();
    });

    st.test('should follow the open state and the active option', async (t) => {
        const store = new Store({
            options: getOptions(5),
            value: 2,
        });

        store.commit('isOpen', true);
        await sleep(0);
        store.commit('activeItemIdx', 3);

        const html = await render(MainInput, { store });
        const combobox = extractTag(html, 'selectic-input');

        t.ok(combobox.includes('aria-expanded="true"'),
            'should be expanded');
        t.ok(
            combobox.includes(
                `aria-activedescendant="${store.optionId(3)}"`
            ),
            'should reference the active option'
        );

        t.end();
    });

    st.test('should be announced as disabled', async (t) => {
        const store = new Store({
            options: getOptions(5),
            disabled: true,
        });
        await sleep(0);
        const html = await render(MainInput, { store });
        const combobox = extractTag(html, 'selectic-input');

        t.ok(combobox.includes('aria-disabled="true"'),
            'should have aria-disabled');
        t.notOk(combobox.includes('tabindex="0"'),
            'should not be in the tab sequence');

        t.end();
    });
});

tape.test('ARIA: selected items (chips)', (st) => {
    function buildMultipleStore() {
        return new Store({
            options: getOptions(5),
            value: [1, 3],
            params: {
                multiple: true,
                allowClearSelection: true,
            },
        });
    }

    st.test('icons should be hidden (keyboard alternative exists)', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);
        const html = await render(MainInput, { store });

        const removeIcon = extractTag(html,
            'selectic-input__selected-items__icon');
        t.ok(removeIcon.includes('aria-hidden="true"'),
            'chip remove icon should be hidden');

        const clearIcon = extractTag(html, 'selectic-input__clear-icon');
        t.ok(clearIcon.includes('aria-hidden="true"'),
            'clear icon should be hidden');

        t.end();
    });

    st.test('should announce the active chip in a live region', async (t) => {
        const store = buildMultipleStore();
        await sleep(0);

        let html = await render(MainInput, { store });
        const liveRegion = extractTag(html, 'selectic-sr-only');
        t.ok(liveRegion.includes('role="status"'),
            'should have a live region');

        /* activate the last chip */
        store.moveActiveChip('previous');
        html = await render(MainInput, { store });

        t.ok(html.includes('Remove text3 (2/2)'),
            'should announce the active chip');
        t.ok(extractTag(html, 'selectic-input__selected-items__active'),
            'active chip should be highlighted');
        t.ok(extractTag(html, 'selectic-input--unfolded'),
            'chips should all be displayed while navigating');

        t.end();
    });
});

tape.test('ARIA: list of options', (st) => {
    st.test('should have the listbox semantic', async (t) => {
        const store = new Store({
            options: getOptions(300),
            value: 2,
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(List, { store });
        const list = extractTag(html, 'selectic__extended-list__list-items');

        t.ok(list.includes('role="listbox"'), 'should be a listbox');
        t.ok(list.includes(`id="${store.listBoxId}"`),
            'should have the id referenced by the combobox');
        t.notOk(list.includes('aria-multiselectable'),
            'should not be multiselectable in single mode');

        const container = extractTag(html,
            'selectic__extended-list__list-container');
        t.ok(container.includes('tabindex="-1"'),
            'the scroller should not be a tab stop (browsers make'
            + ' scrollable elements focusable)');

        t.end();
    });

    st.test('options should have the option semantic', async (t) => {
        const store = new Store({
            options: getOptions(300),
            value: 2,
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(List, { store });

        t.ok(html.includes(`id="${store.optionId(2)}"`),
            'options should have an id');
        t.ok(html.includes('role="option"'),
            'options should have the option role');
        t.ok(html.includes('aria-selected="true"'),
            'selected option should be announced');
        t.ok(html.includes('aria-setsize="300"'),
            'the full list size should be announced (virtual scroll)');
        t.ok(html.includes('aria-posinset="3"'),
            'the real option position should be announced');

        /* the spacer (simulating non rendered options) should be ignored */
        const spacer = /<li[^>]*aria-hidden="true"[^>]*>/.exec(html);
        t.ok(spacer && spacer[0].includes('role="presentation"'),
            'spacers should be removed from the accessibility tree');

        t.end();
    });

    st.test('should support multiple and disabled', async (t) => {
        const store = new Store({
            options: [
                { id: 1, text: 'one' },
                { id: 2, text: 'two', disabled: true },
                { id: 3, text: 'three' },
            ],
            value: [1],
            params: {
                multiple: true,
            },
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(List, { store });
        const list = extractTag(html, 'selectic__extended-list__list-items');

        t.ok(list.includes('aria-multiselectable="true"'),
            'should be multiselectable in multiple mode');
        t.ok(html.includes('aria-disabled="true"'),
            'disabled options should be announced');

        t.end();
    });

    st.test('group headers should be announced as groups', async (t) => {
        const store = new Store({
            options: getOptions(15, 'text', 0, 'group1'),
            groups: [{ id: 'group1', text: 'group 1' }],
            params: {
                multiple: true,
            },
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(List, { store });

        t.ok(html.includes('aria-roledescription="group"'),
            'group headers should have a role description');
        t.is(html.match(/aria-roledescription/g).length, 1,
            'normal options should not have a role description');

        t.end();
    });
});

tape.test('ARIA: filter panel', (st) => {
    st.test('search input should be an accessible combobox', async (t) => {
        const store = new Store({
            options: getOptions(20),
            params: {
                multiple: true,
            },
        });

        store.commit('isOpen', true);
        await sleep(0);
        store.commit('activeItemIdx', 4);

        const html = await render(Filter, { store });
        const input = extractTag(html, 'filter-input');

        t.ok(input.includes('aria-label="Search"'),
            'should have an accessible name');
        t.ok(input.includes('role="combobox"'),
            'should have the combobox role (it drives the listbox)');
        t.ok(input.includes('aria-expanded="true"'), 'should be expanded');
        t.ok(input.includes('aria-autocomplete="list"'),
            'should announce that it filters the list');
        t.ok(input.includes(`aria-controls="${store.listBoxId}"`),
            'should be linked to the listbox');
        t.ok(
            input.includes(`aria-activedescendant="${store.optionId(4)}"`),
            'should reference the active option'
        );

        t.end();
    });

    st.test('clear search should be an accessible button', async (t) => {
        const store = new Store({
            options: getOptions(20),
            params: { multiple: true },
        });

        store.commit('isOpen', true);
        await sleep(0);

        let html = await render(Filter, { store });

        t.notOk(/<button/.test(html),
            'nothing to clear while the search is empty');
        t.ok(extractTag(html, 'selectic-search-scope'),
            'the magnifier should be displayed instead');

        store.commit('searchText', 'text1');
        await sleep(0);
        html = await render(Filter, { store });

        const button = extractTag(html, 'selectic-search-clear');

        t.ok(button, 'the clear button should appear with the search text');
        t.ok(button.includes('aria-label="Clear the search"'),
            'should have an accessible name');
        t.notOk(extractTag(html, 'selectic-search-scope'),
            'it takes the place of the magnifier');

        t.end();
    });

});

tape.test('ARIA: messages', (st) => {
    st.test('info message should be a status', async (t) => {
        const store = new Store();

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(ExtendedList, { store });
        const message = extractTag(html, 'alert-info');

        t.ok(message.includes('role="status"'),
            '"no data" should be announced');

        t.end();
    });

    st.test('searching message should be a status', async (t) => {
        const store = new Store();

        store.commit('isOpen', true);
        await sleep(0);
        store.state.status.searching = true;

        const html = await render(ExtendedList, { store });
        const message = extractTag(html, 'selectic__message');

        t.ok(message.includes('role="status"'),
            '"searching" should be announced');

        t.end();
    });

    st.test('error message should be an alert', async (t) => {
        const store = new Store();

        store.commit('isOpen', true);
        await sleep(0);
        store.state.status.errorMessage = 'an error';

        const html = await render(ExtendedList, { store });
        const message = extractTag(html, 'alert-danger');

        t.ok(message.includes('role="alert"'),
            'errors should be announced immediately');

        t.end();
    });

    st.test('sticky group header should be ignored', async (t) => {
        const store = new Store({
            options: getOptions(15, 'text', 0, 'group1'),
            groups: [{ id: 'group1', text: 'group 1' }],
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(ExtendedList, { store });
        const header = extractTag(html, 'selectic-item--header');

        t.ok(header.includes('aria-hidden="true"'),
            'the floating header duplicates a list item');

        t.end();
    });
});

tape.test('ARIA: footer', (st) => {
    st.test('toggle buttons should expose their state', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multiple: true,
                footer: {
                    selectAll: {},
                    invertSelection: {},
                    clearFilter: {},
                    apply: {},
                },
            },
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(Footer, { store });

        t.ok(html.includes('<button'),
            'footer actions should be native buttons');

        const selectAll = extractTag(html, 'selectic__footer-link');
        t.notOk(selectAll.includes('aria-pressed'),
            'select all state is announced by its label toggle');

        t.ok(html.includes('aria-pressed="false"'),
            'invert selection state should be announced (static label)');

        t.end();
    });

    st.test('a static custom label restores aria-pressed', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multiple: true,
                footer: {
                    selectAll: { text: 'All items' },
                },
            },
        });

        store.commit('isOpen', true);
        await sleep(0);

        const html = await render(Footer, { store });
        const selectAll = extractTag(html, 'selectic__footer-link');

        t.ok(selectAll.includes('aria-pressed="false"'),
            'a label which does not toggle needs aria-pressed');

        t.end();
    });
});

tape.test('ARIA: multilines mode', (st) => {
    st.test('hidden input should be removed from the accessibility tree', async (t) => {
        const html = await render(Selectic, {
            multilines: true,
            options: getOptions(5),
            value: 2,
        });
        const input = extractTag(html, 'selectic__input-value');

        t.ok(input.includes('aria-hidden="true"'),
            'input should have aria-hidden');
        t.ok(input.includes('tabindex="-1"'),
            'input should not be in the tab sequence');

        t.end();
    });

    st.test('the list should take the focus without search input', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multilines: true,
                hideFilter: true,
            },
        });

        await sleep(0);
        store.commit('activeItemIdx', 1);

        const html = await render(MultilinesList, { store });
        const list = extractTag(html, 'selectic__extended-list__list-items');

        t.ok(list.includes('tabindex="0"'),
            'listbox should be in the tab sequence');
        t.ok(
            list.includes(`aria-activedescendant="${store.optionId(1)}"`),
            'listbox should reference the active option'
        );

        t.end();
    });

    st.test('a disabled component should be inert', async (t) => {
        const store = new Store({
            options: getOptions(5),
            disabled: true,
            params: {
                multiple: true,
                multilines: true,
                hideFilter: true,
            },
        });

        await sleep(0);

        const html = await render(MultilinesList, { store });
        const list = extractTag(html, 'selectic__extended-list__list-items');

        /* The list is always rendered in this mode: there is no closed
         * state to make it unreachable. */
        t.notOk(list.includes('tabindex="0"'),
            'listbox should be out of the tab sequence');
        t.ok(list.includes('aria-disabled="true"'),
            'listbox should expose the disabled state');
        const buttons = html.match(/<button[^>]*>/g) || [];

        t.ok(buttons.length, 'the footer should be rendered');
        t.ok(buttons.every((button) => / disabled[ >]/.test(button)),
            'footer buttons should all be disabled');

        t.end();
    });

    st.test('a disabled search input should be disabled', async (t) => {
        const store = new Store({
            options: getOptions(5),
            disabled: true,
            params: {
                multilines: true,
            },
        });

        await sleep(0);

        const html = await render(MultilinesList, { store });

        t.ok(extractTag(html, 'filter-input').includes('disabled'),
            'the search input should not accept any text');

        t.end();
    });

    st.test('messages should be live regions', async (t) => {
        const store = new Store({
            params: {
                multilines: true,
            },
        });

        await sleep(0);

        let html = await render(MultilinesList, { store });
        t.ok(extractTag(html, 'alert-info').includes('role="status"'),
            '"no data" should be announced');

        store.state.status.errorMessage = 'an error';
        html = await render(MultilinesList, { store });
        t.ok(extractTag(html, 'alert-danger').includes('role="alert"'),
            'errors should be announced immediately');

        t.end();
    });

    st.test('the search input should drive the visible list', async (t) => {
        const store = new Store({
            options: getOptions(20),
            params: {
                multilines: true,
            },
        });

        await sleep(0);
        store.commit('activeItemIdx', 2);

        const html = await render(MultilinesList, { store });
        const input = extractTag(html, 'filter-input');

        t.ok(input.includes('role="combobox"'),
            'the search input should be displayed with its combobox role');
        t.ok(
            input.includes(`aria-activedescendant="${store.optionId(2)}"`),
            'the search input should reference the active option'
        );

        const list = extractTag(html, 'selectic__extended-list__list-items');
        t.notOk(list.includes('tabindex'),
            'the listbox should not take the focus when the search input is displayed');

        t.end();
    });

    st.test('footer should be auto-displayed in multiple mode', async (t) => {
        const store = new Store({
            options: getOptions(5),
            params: {
                multiple: true,
                multilines: true,
            },
        });

        await sleep(0);

        const html = await render(MultilinesList, { store });

        t.ok(extractTag(html, 'selectic__footer-link'),
            'Select all/Invert selection should be rendered like in the dropdown mode');
        t.notOk(extractTag(html, 'selectic__footer-btn'),
            'Clear filter and Apply should stay opt-in');

        t.end();
    });
});

tape.test('ARIA: icons', (st) => {
    st.test('icons without title should be decorative', async (t) => {
        const store = new Store();
        const html = await render(Icon, { store, icon: 'times' });

        t.ok(html.includes('aria-hidden="true"'),
            'should be removed from the accessibility tree');

        t.end();
    });

    st.test('icons with title should be labelled images', async (t) => {
        const store = new Store();
        const html = await render(Icon, {
            store,
            icon: 'times',
            title: 'Remove',
        });

        t.ok(html.includes('role="img"'), 'should be an image');
        t.ok(html.includes('aria-label="Remove"'),
            'should have an accessible name');
        t.notOk(html.includes('aria-hidden'), 'should not be hidden');

        t.end();
    });
});
