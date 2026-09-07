const {
    getOptions,
    sleep,
} = require('../helper.js');
const tape = require('tape');

const components = require('../dist/components.js');
const MainInput = components.MainInput;
const Store = components.Store;

const CHIP_WIDTH = 50;

/** Fake chips container: `nbChips` chips of CHIP_WIDTH, laid out in a row */
function buildContainer(nbChips, availableWidth, moreWidth = 0) {
    const children = [];

    for (let idx = 0; idx < nbChips; idx++) {
        children.push({ offsetLeft: idx * CHIP_WIDTH, offsetWidth: CHIP_WIDTH });
    }

    return {
        offsetWidth: nbChips * CHIP_WIDTH,
        children,
        querySelector: (selector) => selector === '.more-items'
            ? (moreWidth ? { offsetWidth: moreWidth } : null)
            : null,
        parentElement: {
            clientWidth: availableWidth,
            querySelector: () => null, /* no clear icon */
        },
    };
}

/** Build a MainInput bound to a real store, without mounting it */
async function buildInput(params, nbSelected, container) {
    const store = new Store({
        options: getOptions(20),
        value: Array.from({ length: nbSelected }, (_unused, idx) => idx),
        params: Object.assign({ multiple: true }, params),
    });

    await sleep(0);

    const input = Object.create(MainInput.prototype);

    input.store = store;
    input.nbHiddenItems = 0;
    input.hasTriedToUnfold = false;
    input.$refs = { selectedItems: container };

    return input;
}

/* `computeSize()` measures real elements. There is no DOM here, so the
 * measurements are simulated: every size comes from the fake nodes above.
 * The globals are only defined around the call: a permanent
 * `global.document` would make Vue believe it runs in a browser. */
function computeSize(input) {
    const previousDocument = global.document;
    const previousStyle = global.getComputedStyle;

    global.document = { contains: () => true };
    global.getComputedStyle = () => ({ getPropertyValue: () => '0px' });

    try {
        MainInput.prototype.computeSize.call(input);
    } finally {
        global.document = previousDocument;
        global.getComputedStyle = previousStyle;
    }

    return input.nbHiddenItems;
}

tape.test('chips overflow (computeSize)', (st) => {
    st.test('should hide nothing when every chip fits', async (t) => {
        /* 3 chips of 50px in 400px */
        const input = await buildInput({}, 3, buildContainer(3, 400));

        t.is(computeSize(input), 0);

        t.end();
    });

    st.test('should hide the chips which overflow', async (t) => {
        /* 6 chips of 50px (300px) in 175px: 4 of them start inside the
         * bounds, and the last displayed one is dropped too because it
         * may be truncated, so 3 are displayed */
        const input = await buildInput({}, 6, buildContainer(6, 175));

        t.is(computeSize(input), 3);

        t.end();
    });

    st.test('should hide everything when there is no room at all', async (t) => {
        const input = await buildInput({}, 4, buildContainer(4, 0));

        t.is(computeSize(input), 4,
            'a component not displayed yet hides every chip');

        t.end();
    });

    st.test('should take the "+N more" chip into account', async (t) => {
        /* the "+N" chip takes 60px out of the 175px available, so one
         * chip less is displayed than without it */
        const input = await buildInput({}, 6, buildContainer(6, 175, 60));

        t.is(computeSize(input), 4,
            'less room for the chips means one more hidden');

        t.end();
    });

    st.test('should display them all while navigating', async (t) => {
        const input = await buildInput({}, 6, buildContainer(6, 175));

        t.is(computeSize(input), 3);

        /* the active chip must stay reachable, whatever the room */
        input.store.commit('activeChipIdx', 5);
        t.is(computeSize(input), 0);

        t.end();
    });

    st.test('should not collapse in multiline overflow', async (t) => {
        const input = await buildInput(
            { selectionOverflow: 'multiline' }, 6, buildContainer(6, 175)
        );

        t.is(computeSize(input), 0,
            'the container grows in height instead of collapsing');

        t.end();
    });

    st.test('should retry to unfold when the room came back', async (t) => {
        /* everything was hidden while the component was not displayed */
        const input = await buildInput({}, 4, buildContainer(4, 400));

        input.nbHiddenItems = 4;

        t.is(computeSize(input), 0, 'the chips are displayed again');
        t.ok(input.hasTriedToUnfold, 'and it is only tried once');

        t.end();
    });
});
