const {
    getOptions,
    sleep,
} = require('../helper.js');
const tape = require('tape');

const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');

/* Minimal window stub: the component reads it to compute the position */
global.window = global.window || {
    innerHeight: 800,
    innerWidth: 1200,
};

const components = require('../dist/components.js');
const List = components.List;
const Selectic = components.Selectic;
const ExtendedList = components.ExtendedList;
const MultilinesList = components.MultilinesList;
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

/* The multilines mode renders the panel inline: the main element and the
 * panel are both in the same output, which the dropdown mode cannot
 * provide without a DOM. */
function multilinesProps(extraProps) {
    return Object.assign({
        options: getOptions(20),
        multiple: true,
        multilines: true,
    }, extraProps);
}

tape.test('List', (st) => {
    st.test('checkOffset() should support a not mounted component', async (t) => {
        const store = new Store({
            options: getOptions(20),
            params: {
                multilines: true,
            },
        });
        await sleep(0);

        /* simulate the watcher triggered before mount ($refs still empty) */
        const list = Object.create(List.prototype);
        list.store = store;
        list.$refs = {};

        t.doesNotThrow(() => {
            List.prototype.checkOffset.call(list);
        }, 'options changing before mount should not crash');

        t.end();
    });

    st.test('multilines should accept a number of items', async (t) => {
        /* the list height is driven by the `--selectic-items-number`
         * custom property, set from the store `itemsPerPage` */
        let html = await render(Selectic, {
            options: getOptions(50),
            multiple: true,
            multilines: 5,
        });

        t.ok(html.includes('--selectic-items-number:5'),
            'the number should size the inline list');
        t.ok(html.includes('selectic--multilines'),
            'the inline layout should be on');

        html = await render(Selectic, {
            options: getOptions(50),
            multiple: true,
            multilines: true,
        });

        t.ok(html.includes('--selectic-items-number:10'),
            'the boolean form should keep the default size');

        html = await render(Selectic, {
            options: getOptions(50),
            multiple: true,
            multilines: 5,
            params: { displayedItems: 20 },
        });

        t.ok(html.includes('--selectic-items-number:20'),
            'the dedicated parameter should take precedence');

        html = await render(Selectic, {
            options: getOptions(50),
            multiple: true,
            multilines: 0,
        });

        t.notOk(html.includes('selectic--multilines'),
            '0 should keep the dropdown layout');

        t.end();
    });

    st.test('listClassName should dress the panel only', async (t) => {
        let html = await render(Selectic, multilinesProps({
            className: 'my-field',
        }));
        let panel = extractTag(html, 'selectic__multilines-list');

        t.ok(panel.includes('my-field'),
            'className alone should still be propagated to the panel');

        html = await render(Selectic, multilinesProps({
            className: 'my-field',
            listClassName: 'my-panel',
        }));
        panel = extractTag(html, 'selectic__multilines-list');

        t.ok(panel.includes('my-panel'),
            'listClassName should be applied on the panel');
        t.notOk(panel.includes('my-field'),
            'listClassName should replace className on the panel');
        t.ok(extractTag(html, 'selectic--multilines').includes('my-field'),
            'the main element should keep className');

        html = await render(Selectic, multilinesProps({
            className: 'my-field',
            listClassName: '',
        }));
        panel = extractTag(html, 'selectic__multilines-list');

        t.ok(panel.includes('my-field'),
            'an empty listClassName should be the same as no listClassName');

        t.end();
    });

    st.test('itemHeight should size the items', async (t) => {
        /* the value drives the virtual scroll offsets, and is published as
         * the `--selectic-item-height` custom property */
        let html = await render(Selectic, multilinesProps());

        t.ok(html.includes('--selectic-item-height:27px'),
            'the default height should be 27px');

        html = await render(Selectic, multilinesProps({
            params: { itemHeight: 40 },
        }));

        t.ok(html.includes('--selectic-item-height:40px'),
            'the parameter should change the height');

        html = await render(Selectic, multilinesProps({
            params: { itemHeight: 0 },
        }));

        t.ok(html.includes('--selectic-item-height:1px'),
            'a too small height should be raised to the minimum');

        html = await render(Selectic, multilinesProps({
            params: { itemHeight: NaN },
        }));

        t.ok(html.includes('--selectic-item-height:27px'),
            'a value which is not a finite number should be ignored');

        t.end();
    });

    st.test('Apply should not be rendered in multilines', async (t) => {
        /* the list is always displayed: there is nothing to close, and
         * `change` is already emitted with every modification */
        function buildStore(extraParams) {
            return new Store({
                options: getOptions(20),
                params: Object.assign({
                    multiple: true,
                    footer: { apply: {}, clearFilter: {} },
                }, extraParams),
            });
        }

        const dropdownStore = buildStore();
        dropdownStore.commit('isOpen', true);
        await sleep(0);

        let html = await render(ExtendedList, { store: dropdownStore });
        t.ok(html.includes('selectic__footer-btn--primary'),
            'Apply should be rendered in the dropdown mode');

        const multilinesStore = buildStore({ multilines: true });
        await sleep(0);

        html = await render(MultilinesList, { store: multilinesStore });

        t.notOk(html.includes('selectic__footer-btn--primary'),
            'Apply should be dropped in multilines');
        t.ok(html.includes('selectic__footer-btn--secondary'),
            'Clear filter should stay: the search still exists');

        t.end();
    });
});
