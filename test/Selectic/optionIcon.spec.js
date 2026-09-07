const {
    sleep,
} = require('../helper.js');
const tape = require('tape');

const { createSSRApp } = require('vue');
const { renderToString } = require('@vue/server-renderer');

/* Minimal window stub: the list reads it to compute its position */
global.window = global.window || {
    innerHeight: 800,
    innerWidth: 1200,
};

const components = require('../dist/components.js');
const List = components.List;
const MainInput = components.MainInput;
const OptionIcon = components.OptionIcon;
const Store = components.Store;

const AVATAR = 'https://example.org/avatar.png';

function options() {
    return [
        { id: 1, text: 'Design', icon: `img:${AVATAR}` },
        { id: 2, text: 'Support', icon: 'current:star' },
        { id: 3, text: 'Random' },
    ];
}

/** The store needs a tick to build its options from the props */
async function buildStore(props = {}) {
    const store = new Store(Object.assign({ options: options() }, props));

    await sleep(0);

    return store;
}

/** Markup of the list of options */
async function renderList(props) {
    const store = await buildStore(props);

    store.commit('isOpen', true);
    await sleep(0);

    return renderToString(createSSRApp(List, { store }));
}

/** Markup of the main input (selected value and multiple-mode tags) */
async function renderInput(props) {
    const store = await buildStore(props);

    return renderToString(createSSRApp(MainInput, { store }));
}

tape.test('option icon as an image', (st) => {
    st.test('should display an image in the list', async (t) => {
        const html = await renderList();

        t.ok(html.includes(`src="${AVATAR}"`),
            'the URL is set on the image');
        t.ok(/<img[^>]*selectic__option-image/.test(html),
            'the image carries the class which sizes it');
        t.ok(/<img[^>]*\salt[\s>]/.test(html),
            'the alt is empty: the text of the option already names it');

        t.end();
    });

    st.test('should display the image next to the selected value', async (t) => {
        const html = await renderInput({ value: 1 });

        t.ok(html.includes(`src="${AVATAR}"`),
            'an avatar displayed in the list must not vanish once picked');

        t.end();
    });

    st.test('should display the image in a multiple mode tag', async (t) => {
        const html = await renderInput({
            value: [1, 2],
            params: { multiple: true },
        });

        t.ok(html.includes(`src="${AVATAR}"`),
            'the tag of the selected option keeps its image');
        t.ok(/<img[^>]*selectic-input__value-icon/.test(html),
            'and the class positioning it in the tag');

        t.end();
    });

    st.test('should keep resolving a class through its family', async (t) => {
        const store = await buildStore();

        store.changeIcons(null, 'font-awesome-4');
        store.commit('isOpen', true);
        await sleep(0);

        const html = await renderToString(createSSRApp(List, { store }));

        t.ok(html.includes('fa fa-fw fa-star'),
            'a class-based icon is still resolved by the family');
        t.ok(html.includes(`src="${AVATAR}"`),
            'while the URL is left untouched by the family');
        t.notOk(html.includes(`fa-${AVATAR}`),
            'no family prefix is applied on it');

        t.end();
    });

    st.test('should keep the box when there is no URL', async (t) => {
        /* `img:` alone reserves the space, so that an option without
         * image stays aligned with the ones which have one */
        const store = new Store({
            options: [
                { id: 1, text: 'Design', icon: `img:${AVATAR}` },
                { id: 2, text: 'Support', icon: 'img:' },
            ],
        });
        await sleep(0);
        store.commit('isOpen', true);
        await sleep(0);

        const html = await renderToString(createSSRApp(List, { store }));

        t.is((html.match(/selectic__option-image/g) || []).length, 2,
            'both options occupy the same box');
        t.is((html.match(/<img/g) || []).length, 1,
            'but only one of them loads an image');

        t.end();
    });

    st.test('should support the blob: and data: schemes', async (t) => {
        const urls = [
            'blob:https://example.org/9d4b-4b1e',
            'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        ];

        for (const url of urls) {
            const store = new Store({
                options: [
                    { id: 1, text: 'Design', icon: `img:${url}` },
                    { id: 2, text: 'Support' },
                ],
            });
            await sleep(0);
            store.commit('isOpen', true);
            await sleep(0);

            const html = await renderToString(createSSRApp(List, { store }));

            t.ok(html.includes(`src="${url}"`),
                `the ${url.split(':')[0]}: scheme is kept as it is`);
        }

        t.end();
    });

    st.test('should not let an URL inject markup', async (t) => {
        const url = '"><script>alert(1)</script><img src="';
        const store = new Store({
            options: [
                { id: 1, text: 'Design', icon: `img:${url}` },
                { id: 2, text: 'Support' },
            ],
        });
        await sleep(0);
        store.commit('isOpen', true);
        await sleep(0);

        const html = await renderToString(createSSRApp(List, { store }));

        t.notOk(html.includes('<script>'),
            'the URL is escaped, it never reaches the markup as it is');

        t.end();
    });

    st.test('should display nothing without any icon', async (t) => {
        const store = new Store({
            options: [
                { id: 1, text: 'Random' },
                { id: 2, text: 'Support' },
            ],
        });
        await sleep(0);
        store.commit('isOpen', true);
        await sleep(0);

        const html = await renderToString(createSSRApp(List, { store }));

        t.notOk(html.includes('selectic__option-image'),
            'an option without icon still reserves no space at all');

        t.end();
    });
});

tape.test('option icon failure', (st) => {
    st.test('should fall back on the empty box', async (t) => {
        const icon = Object.create(OptionIcon.prototype);

        icon.icon = `img:${AVATAR}`;
        icon.className = '';
        icon.hasFailed = false;

        OptionIcon.prototype.onError.call(icon);
        t.ok(icon.hasFailed,
            'a failing image is remembered, to hide the broken glyph');

        /* the component is reused while the list scrolls: the failure
         * must not outlive the URL which caused it */
        OptionIcon.prototype.onIconChange.call(icon);
        t.notOk(icon.hasFailed,
            'a new URL is given a new chance');

        t.end();
    });

    st.test('should read the URL after the prefix only', async (t) => {
        const getUrl = Object.getOwnPropertyDescriptor(
            OptionIcon.prototype, 'imageUrl'
        ).get;

        t.is(getUrl.call({ icon: 'img:blob:https://example.org/x' }),
            'blob:https://example.org/x',
            'the scheme of the URL is not confused with the prefix');
        t.is(getUrl.call({ icon: 'fa fa-star' }), null,
            'a class is not an URL');
        t.is(getUrl.call({ icon: 'selectic:check' }), null,
            'a family-prefixed icon is not an URL');
        t.is(getUrl.call({ icon: 'img:' }), '',
            'the prefix alone asks for the empty box');

        t.end();
    });
});
