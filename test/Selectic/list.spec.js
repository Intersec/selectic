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
const Store = components.Store;

function render(Component, props) {
    return renderToString(createSSRApp(Component, props));
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
});
