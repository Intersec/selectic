const tape = require('tape');
const {
    getOptions,
    buildFetchCb,
} = require('../helper.js');
const _ = require('../tools.js');
const SelecticFile = require('../../dist/selectic.common.js');
const Selectic = SelecticFile.default;

tape.test('change props', (subT) => {
    subT.test('"value"', (sTest) => {
        sTest.test('should change automatically internalValue', async (t) => {
            const propOptions = getOptions(10);

            const selectic = new Selectic({
                propsData: {
                    options: propOptions,
                },
            });
            let hasChanged = false;
            selectic.$on('change', () => hasChanged = true);

            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), 0);
            t.is(hasChanged, true);

            t.end();
        });

        sTest.test('should change internalValue but not hasChanged at start', async (t) => {
            const propOptions = getOptions(10);

            const selectic = new Selectic({
                propsData: {
                    options: propOptions,
                },
            });
            let hasChanged = false;
            selectic.$on('change', () => hasChanged = true);

            selectic.value = 5;

            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), 5);
            /* When value is changed during creation the change event should not been triggered */
            t.is(hasChanged, false);

            selectic.value = 2;
            await _.nextVueTick(selectic, _.sleep(0));
            t.is(selectic.getValue(), 2);
            t.is(hasChanged, true);

            t.end();
        });
    });

});
