const {
    getOptions,
    sleep,
} = require('../helper.js');
const tape = require('tape');

const components = require('../dist/components.js');
const Selectic = components.Selectic;
const Store = components.Store;

/** Build a component instance driving a real store, without any DOM.
 *
 * Only the members the value/focus events rely on are provided: the point
 * is to check the sequence of emitted events, which is what a consumer
 * listening to `@change` sees.
 */
function buildComponent({ multilines = true } = {}) {
    const store = new Store({
        options: getOptions(5),
        params: {
            multiple: true,
            multilines,
        },
    });

    const events = [];
    const component = Object.create(Selectic.prototype);

    Object.assign(component, {
        store,
        multilines,
        value: undefined,
        params: {},
        hasBeenRendered: true,
        multilinesFocused: false,
        _oldValue: undefined,
        _pointerIsInside: false,
        $emit: (event, ...args) => events.push(event),
    });

    /* the watchers are wired by Vue on a mounted component */
    const emitValue = () => Selectic.prototype.onInternalValueChange.call(component);
    const emitFocus = () => Selectic.prototype.focusToggled.call(component);

    return {
        store,
        events,
        component,
        /** select an option, like a click on it does */
        select: (id) => {
            store.selectItem(id);
            emitValue();
        },
        /** the focus enters or leaves the component */
        setFocused: (isFocused) => {
            if (component.multilinesFocused === isFocused) {
                return;
            }
            component.multilinesFocused = isFocused;
            emitFocus();
        },
    };
}

tape.test('multilines events', (st) => {
    st.test('change should follow input, before and after a blur', async (t) => {
        const selectic = buildComponent();
        await sleep(0);

        selectic.setFocused(true);
        selectic.select(1);
        selectic.select(2);

        t.deepEqual(selectic.events, [
            'focus',
            'input', 'change',
            'input', 'change',
        ], 'the always-displayed list has no edition cycle to wait for');

        selectic.events.length = 0;
        selectic.setFocused(false);

        t.deepEqual(selectic.events, ['blur'],
            'leaving should not emit a deferred change');

        /* The very bug this covers: the same gesture used to behave
         * differently once a focus/blur cycle had happened. */
        selectic.events.length = 0;
        selectic.setFocused(true);
        selectic.select(3);

        t.deepEqual(selectic.events, ['focus', 'input', 'change'],
            'a selection should emit the same events as the first ones');

        t.end();
    });

    st.test('should emit the same events without any focus', async (t) => {
        const selectic = buildComponent();
        await sleep(0);

        /* clicking an option does not always move the DOM focus (Firefox
         * and Safari do not focus every element on click) */
        selectic.select(1);
        selectic.select(2);

        t.deepEqual(selectic.events, [
            'input', 'change',
            'input', 'change',
        ], 'the value events must not depend on the focus');

        t.end();
    });

    st.test('dropdown mode should keep deferring change', async (t) => {
        const selectic = buildComponent({ multilines: false });
        await sleep(0);

        selectic.store.commit('isOpen', true);
        selectic.select(1);
        selectic.select(2);

        t.deepEqual(selectic.events, ['input', 'input'],
            'change should wait for the list to close');

        t.end();
    });
});

tape.test('multilines focus tracking', (st) => {
    function buildFocusCase() {
        const selectic = buildComponent();
        const inside = { tagName: 'LI' };
        const outside = { tagName: 'BODY' };
        const el = {
            contains: (node) => node === inside,
            addEventListener: () => {},
            removeEventListener: () => {},
        };

        return { selectic, el, inside, outside };
    }

    st.test('should ignore a click on a non focusable element', (t) => {
        const { selectic, el, inside } = buildFocusCase();
        const component = selectic.component;

        component.multilinesFocused = true;
        /* the click starts inside, the focus falls back on the body */
        component._pointerIsInside = el.contains(inside);
        global.document = { activeElement: null };

        Selectic.prototype.checkMultilinesFocus.call(component, el);

        t.ok(component.multilinesFocused,
            'interacting with the list is not leaving it');

        t.end();
    });

    st.test('should report a blur without any pointer interaction', (t) => {
        const { selectic, el } = buildFocusCase();
        const component = selectic.component;

        component.multilinesFocused = true;
        /* no `pointerdown` happened yet: the field is still undefined */
        global.document = { activeElement: null };

        Selectic.prototype.checkMultilinesFocus.call(component, el);

        t.notOk(component.multilinesFocused,
            'no pointer inside behaves as a pointer outside');

        t.end();
    });

    st.test('should report a click outside', (t) => {
        const { selectic, el, outside } = buildFocusCase();
        const component = selectic.component;

        component.multilinesFocused = true;
        component._pointerIsInside = el.contains(outside);
        global.document = { activeElement: null };

        Selectic.prototype.checkMultilinesFocus.call(component, el);

        t.notOk(component.multilinesFocused, 'the component is left');

        t.end();
    });

    st.test('should report leaving with the keyboard', (t) => {
        const { selectic, el, inside } = buildFocusCase();
        const component = selectic.component;

        component.multilinesFocused = true;
        /* the last click was inside, but Tab moved the focus away */
        component._pointerIsInside = el.contains(inside);
        global.document = { activeElement: { tagName: 'INPUT' } };

        Selectic.prototype.checkMultilinesFocus.call(component, el);

        t.notOk(component.multilinesFocused,
            'a focused element outside means the component is left');

        t.end();
    });

    st.test('should stay focused between inner elements', (t) => {
        const { selectic, el, inside } = buildFocusCase();
        const component = selectic.component;

        component.multilinesFocused = true;
        component._pointerIsInside = false;
        global.document = { activeElement: inside };

        Selectic.prototype.checkMultilinesFocus.call(component, el);

        t.ok(component.multilinesFocused,
            'moving between the search input, the list and the footer');

        t.end();
    });
});
