const {
    getOptions,
    sleep,
} = require('../helper.js');
const tape = require('tape');
const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');

/* Minimal window stub: ExtendedList reads it to compute the list position */
global.window = global.window || {
    innerHeight: 800,
    innerWidth: 1200,
};

const components = require('../dist/components.js');
const MultilinesList = components.MultilinesList;
const ExtendedList = components.ExtendedList;
const Store = components.Store;

function render(Component, props) {
    return renderToString(createSSRApp(Component, props));
}

/** Labels of the rendered footer buttons, in order */
function buttonLabels(html) {
    return [...html.matchAll(/<button[^>]*>([^<]*)</g)]
        .map((match) => match[1].trim())
        .filter((label) => label);
}

function buildStore(params = {}) {
    const store = new Store({
        options: getOptions(20),
        params: Object.assign({ multiple: true }, params),
    });

    store.commit('isOpen', true);

    return store;
}

tape.test('footer in multilines mode', (st) => {
    st.test('should offer the same actions as the dropdown', async (t) => {
        const store = buildStore({ multilines: true });
        await sleep(0);
        store.selectItem(2);

        const dropdownStore = buildStore();
        await sleep(0);
        dropdownStore.selectItem(2);

        const inline = buttonLabels(await render(MultilinesList, { store }));
        const dropdown = buttonLabels(
            await render(ExtendedList, { store: dropdownStore })
        );

        t.deepEqual(inline, dropdown,
            'both modes must offer the same buttons');
        t.deepEqual(inline, ['Select all', 'Invert selection', 'Show selection'],
            'multiple mode enables the three left links by default');

        t.end();
    });

    st.test('should hide Apply, which has nothing to close', async (t) => {
        const footer = { clearFilter: {}, apply: {} };

        const store = buildStore({ multilines: true, footer });
        await sleep(0);
        store.commit('searchText', 'text1');

        const dropdownStore = buildStore({ footer });
        await sleep(0);
        dropdownStore.commit('searchText', 'text1');

        const inline = buttonLabels(await render(MultilinesList, { store }));
        const dropdown = buttonLabels(
            await render(ExtendedList, { store: dropdownStore })
        );

        t.ok(dropdown.includes('Apply'),
            'the dropdown closes on Apply');
        t.notOk(inline.includes('Apply'),
            'the inline list is always displayed: nothing to validate');
        t.ok(inline.includes('Clear filter'),
            'Clear filter stays available in both modes');

        t.end();
    });

    st.test('should not be rendered without multiple nor config', async (t) => {
        const store = new Store({
            options: getOptions(20),
            params: { multilines: true },
        });
        await sleep(0);

        const html = await render(MultilinesList, { store });

        t.notOk(/selectic__list-panel__footer/.test(html),
            'single mode without footer config displays no footer bar');

        t.end();
    });
});
