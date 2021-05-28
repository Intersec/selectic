const tape = require('tape');
const {
    getOptions,
    buildFetchCb,
} = require('../helper.js');
const _ = require('../tools.js');
const Vue = require('vue');
// require('jsdom-global')();
// const { JSDOM } = require('jsdom');

const createApp = Vue.createApp;

const SelecticFile = require('../../dist/selectic.common.js');
const Selectic = SelecticFile.default;

function buildDom() {
    return document.createElement('div');
}

tape.skip('change props', (subT) => {
    subT.test('"value"', (sTest) => {
        sTest.test('should change automatically internalValue', async (t) => {
            const propOptions = getOptions(10);

            let hasChanged = false;
            let SelecticGetValue;
            const selectic = createApp(Selectic, {
                options: propOptions,
                _on: (event) => {
                    if (event ==='change') {
                        hasChanged = true;
                    }
                },
                _getMethods: ({getValue}) => SelecticGetValue = getValue,
            });
            const el = buildDom();
            selectic.mount(el);

            await _.nextVueTick(selectic, _.sleep(0));
            t.is(getValue(), 0);
            t.is(hasChanged, true);

            t.end();
        });

        sTest.test('should change internalValue but not hasChanged at start', async (t) => {
            const propOptions = getOptions(10);

            let hasChanged = false;
            const selectic = new Selectic({
                propsData: {
                    options: propOptions,
                    params: {
                        allowClearSelection: true,
                    },
                    $on: (event) => {
                        if (event ==='change') {
                            hasChanged = true;
                        }
                    },
                },
            });
            selectic.value = 5;

            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), 5);
            /* When value is changed during creation the change event should not been triggered */
            t.is(hasChanged, false);

            selectic.value = 2;
            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), 2);
            t.is(hasChanged, true);

            hasChanged = false;
            selectic.value = 3;
            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), 3);
            t.is(hasChanged, true);

            hasChanged = false;
            selectic.value = null;
            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), null);
            t.is(hasChanged, true);

            t.end();
        });
    });

});
