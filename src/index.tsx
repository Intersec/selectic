/* Component Purpose:
 * Selectic is a component to behave like <select> but can be built easily
 * from list of options (only id or more described items). It can also fetch
 * these items dynamically which allow to build very long list without loading
 * all data.
 */

/* File Purpose:
 * It initializes the component and manages all communications with external.
 */

/* Events emitted are:
 *   change [value]: triggered when the list is closed and a change occurs
 *   input [value]: triggered when a change occurs
 *   item:click [id]: triggered on multiple select, when user click on
 *                    selected item (in main input)
 */

import {Vue, Component, Prop, Watch} from 'vtyx';

import Store, {
    changeTexts as storeChangeTexts,
    OptionProp,
    OptionId,
    StrictOptionId,
    GroupValue,
    SelectedValue,
    FetchCallback,
    GetCallback,
    PartialMessages,
    OptionValue,
    OptionItem,
    FormatCallback,
    SelectionOverflow,
} from './Store';
import MainInput from './MainInput';
import ExtendedList from './ExtendedList';

/* Export */
export type OptionValue = OptionValue;
export type OptionItem = OptionItem;
export type OptionId = OptionId;
export type StrictOptionId = StrictOptionId;
export type SelectedValue = SelectedValue;
export type PartialMessages = PartialMessages;
export type GetCallback = GetCallback;
export type FetchCallback = FetchCallback;
export type FormatCallback = FormatCallback;
export type SelectionOverflow = SelectionOverflow;

export interface ParamProps {
    /* Method to call to fetch extra data */
    fetchCallback?: FetchCallback;

    /* Method to call to get specific items */
    getItemsCallback?: GetCallback;

    /* Number of elements to fetch.
     * When scrolled too fast, a greater number of elements
     * are going to be requested.
     */
    pageSize?: number;

    /* Hide the search control */
    hideFilter?: boolean | 'auto';

    /* Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;

    /* Allow user to clear the current selection */
    allowClearSelection?: boolean;

    /* If false, avoid selecting the first available option. */
    autoSelect?: boolean;

    /* Disable the select if no or only one option is given and must be selected. */
    autoDisabled?: boolean;

    /* If true, value can be only in existing options. */
    strictValue?: boolean;

    /* Define how to behave when selected items are too large for container.
     *     collapsed (default): Items are reduced in width and an ellipsis
     *                          is displayed in their name.
     *     multiline: The container extends in height in order to display all
     *                items.
     */
    selectionOverflow?: SelectionOverflow;

    /* In single mode, if no selection, this value is returned (default=null). */
    emptyValue?: SelectedValue;

    /* Called when item is displayed in the list. */
    formatOption?: FormatCallback;

    /* Called when item is displayed in the selection area. */
    formatSelection?: FormatCallback;
}

export interface Props {
    /* Selectic's initial value */
    value?: SelectedValue;

    /* If true, the effective selection is the opposite */
    selectionIsExcluded?: boolean;

    /* List of options to display */
    options: OptionProp[];

    /* Define groups of items (similar to optGroup) */
    groups?: GroupValue[];

    /* Equivalent of <select>'s "multiple" attribute */
    multiple?: boolean;

    /* Equivalent of <select>'s "disabled" attribute */
    disabled?: boolean;

    /* Equivalent of <input>'s "placeholder" attribute */
    placeholder?: string;

    /* id of the HTML element */
    id?: string;

    /* CSS class of the HTML element */
    className?: string;

    /* title on the HTML element */
    title?: string;

    /* Replace the default texts used in Selectic */
    texts?: PartialMessages;

    /* Props which is not expected to change during the life time of the
     * component.
     * These parameters modify the component behavior but are not official
     * attributes of select.
     */
    params?: ParamProps;
}

export function changeTexts(texts: PartialMessages) {
    storeChangeTexts(texts);
}

@Component
export default class Selectic extends Vue<Props> {
    public $refs: {
        mainInput: MainInput;
        extendedList: ExtendedList;
    };

    /* {{{ props */

    @Prop()
    public value?: SelectedValue;

    @Prop({default: false})
    public selectionIsExcluded: boolean;

    @Prop({default: () => []})
    public options: OptionProp[];

    @Prop({default: () => []})
    public groups: GroupValue[];

    @Prop({default: false})
    public multiple: boolean;

    @Prop({default: false})
    public disabled: boolean;

    @Prop({default: ''})
    public placeholder: string;

    @Prop({default: ''})
    public id: string;

    @Prop({default: ''})
    public className: string;

    @Prop()
    public title?: string;

    @Prop()
    public texts?: PartialMessages;

    @Prop({default: () => ({
        allowClearSelection: false,
        strictValue: false,
        selectionOverflow: 'collapsed',
    })})
    public params: ParamProps;

    /* }}} */
    /* {{{ data */

    public offsetTop = 0;
    public offsetLeft = 0;
    public width = 0;

    private store: Store = {} as Store;

    /* No observer */
    private _elementsListeners: Element[];
    private _oldValue: SelectedValue; /* old values in watcher are buggy :'( */

    /* }}} */
    /* {{{ computed */

    get isFocused() {
        if (!this.store || !this.store.state) {
            return false;
        }
        return this.store.state.isOpen;
    }

    get scrollListener() {
        return this.computeOffset.bind(this, true);
    }

    get outsideListener() {
        return (evt: MouseEvent) => {
            const target =  evt.target as Node;

            if (!this.$refs) {
                /* this component should have been destroyed */
                this.removeListeners();
                this.store.commit('isOpen', false);
                return;
            }

            if (!this.$refs.extendedList.$el.contains(target) && !this.$el.contains(target)) {
                this.store.commit('isOpen', false);
            }
        };
    }

    get windowResize() {
        return (_evt: any) => {
            this.computeWidth();
            this.computeOffset(true);
        };
    }

    get inputValue() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.internalValue;

        if (value === null) {
            return '';
        }

        if (isMultiple) {
            return (value as StrictOptionId[]).join(', ');
        } else {
            return value as StrictOptionId;
        }
    }

    get selecticClass() {
        const state = this.store.state;

        return ['selectic', this.className, {
            disabled: state.disabled,
            'selectic--overflow-multiline': state.selectionOverflow === 'multiline',
            'selectic--overflow-collapsed': state.selectionOverflow === 'collapsed',
        }];
    }

    /* }}} */
    /* {{{ methods */
    /* {{{ public methods */

    /* Reset the inner cache (mainly for dynamic mode if context has changed) */
    public clearCache(forceReset = false) {
        this.store.clearCache(forceReset);
    }

    /* Allow to change all text of the component */
    public changeTexts(texts: PartialMessages) {
        this.store.changeTexts(texts);
    }

    /* Return the current selection */
    public getValue(): SelectedValue {
        const value = this.store.state.internalValue;
        if (value === null && typeof this.params.emptyValue !== 'undefined') {
            return this.params.emptyValue;
        }
        return value;
    }

    /* Return the current selection in Item format */
    public getSelectedItems(): OptionValue | OptionValue[] {
        const values = this.store.state.internalValue;

        if (values === null) {
            return {
                id: null,
                text: '',
            };
        }

        if (Array.isArray(values)) {
            return values.map((value) => this.store.getItem(value));
        }

        return this.store.getItem(values);
    }

    /* Check if there are Options available in the components */
    public isEmpty() {
        const total = this.store.state.totalAllOptions;

        return total === 0;
    }

    /* }}} */
    /* {{{ private methods */

    private computeWidth() {
        const el = this.$refs.mainInput.$el as HTMLElement;

        this.width = el.offsetWidth;
    }

    private computeOffset(doNotAddListener = false) {
        const mainInput = this.$refs.mainInput;

        if (!mainInput || mainInput.$el) {
            /* This method has been called too soon (before render function) */
            return;
        }

        let el = mainInput.$el as HTMLElement;
        let offsetLeft = el.offsetLeft;
        let offsetTop = el.offsetTop + el.offsetHeight;
        const elRootElement = document.body.parentElement as HTMLElement;

        let isFixed = getComputedStyle(el).getPropertyValue('position') === 'fixed';
        el = el.offsetParent as HTMLElement;

        while (el) {
            if (!doNotAddListener) {
                el.addEventListener('scroll', this.scrollListener);
                this._elementsListeners.push(el);
            }

            offsetLeft += el.offsetLeft - el.scrollLeft;
            offsetTop += el.offsetTop - el.scrollTop;

            isFixed = isFixed || getComputedStyle(el).getPropertyValue('position') === 'fixed';
            el = el.offsetParent as HTMLElement;
        }

        /* Adjust offset for element inside fixed elements */
        if (isFixed) {
            offsetLeft += elRootElement.scrollLeft;
            offsetTop += elRootElement.scrollTop;
        }

        this.offsetLeft = offsetLeft;
        this.offsetTop = offsetTop + 1;
    }

    private removeListeners() {
        this._elementsListeners.forEach((el) => {
            el.removeEventListener('scroll', this.scrollListener);
        });

        this._elementsListeners = [];

        document.body.removeEventListener('click', this.outsideListener, true);
        window.removeEventListener('resize', this.windowResize, false);
    }

    private focusToggled() {
        const state = this.store.state;

        if (this.isFocused) {
            this.computeWidth();
            window.addEventListener('resize', this.windowResize, false);
            document.body.addEventListener('click', this.outsideListener, true);
            this.computeOffset();
        } else {
            this.removeListeners();
            if (state.status.hasChanged) {
                this.$emit('change', this.getValue(), state.selectionIsExcluded);
                this.store.resetChange();
            }
        }
    }

    private compareValues(oldValue: SelectedValue, newValue: SelectedValue) {
        if (Array.isArray(oldValue)) {
            return Array.isArray(newValue)
                && oldValue.length === newValue.length
                && oldValue.every((val) => newValue.includes(val));
        }
        return oldValue === newValue;
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('value')
    protected onValueChange() {
        const currentValue = this.store.value;
        const newValue = this.value;
        const areSimilar = this.compareValues(
            currentValue as SelectedValue,
            newValue as SelectedValue
        );

        if (!areSimilar) {
            this.store.value = this.value;
        }
    }

    @Watch('selectionIsExcluded')
    protected onExcludedChange() {
        this.store.selectionIsExcluded = this.selectionIsExcluded;
    }

    @Watch('options')
    protected onOptionsChange() {
        this.store.options = this.options;
    }

    @Watch('texts')
    protected onTextsChange() {
        const texts = this.texts;

        if (texts) {
            this.changeTexts(texts);
        }
    }

    @Watch('disabled')
    protected onDisabledChange() {
        this.store.disabled = this.disabled;
    }

    @Watch('groups')
    protected onGroupsChanged() {
        this.store.changeGroups(this.groups);
    }

    @Watch('placeholder')
    protected onPlaceholderChanged() {
        this.store.commit('placeholder', this.placeholder);
    }

    @Watch('isFocused')
    protected onFocusChanged() {
        this.focusToggled();
    }

    @Watch('store.state.internalValue')
    protected onInternalValueChange() {
        const oldValue = this._oldValue;
        const value = this.getValue();
        const areSimilar = this.compareValues(oldValue, value);
        const canTrigger = oldValue !== undefined && !areSimilar;

        if (canTrigger) {
            const selectionIsExcluded = this.store.state.selectionIsExcluded;

            this.$emit('input', value, selectionIsExcluded);

            if (!this.isFocused) {
                this.$emit('change', value, selectionIsExcluded);
                this.store.resetChange();
            }
        }

        this._oldValue = Array.isArray(value) ? value.slice() : value;
    }

    /* }}} */
    /* {{{ methods */

    private checkFocus() {
        /* Await that focused element becomes active */
        setTimeout(() => {
            const focusedEl = document.activeElement;
            const extendedList = this.$refs.extendedList;

            /* check if there is a focused element (if none the body is
             * selected) and if it is inside current Selectic */
            if (focusedEl === document.body
            ||  this.$el.contains(focusedEl)
            ||  (extendedList && extendedList.$el.contains(focusedEl)))
            {
                return;
            }

            this.store.commit('isOpen', false);
        }, 0);
    }

    /* }}} */
    /* {{{ Life cycle */

    protected created() {
        this._elementsListeners = [];

        this.store = new Store({ propsData: {
            options: this.options,
            value: this.value,
            selectionIsExcluded: this.selectionIsExcluded,
            disabled: this.disabled,
            texts: this.texts,
            groups: this.groups,
            params: {
                multiple: this.multiple,
                pageSize: this.params.pageSize || 100,
                hideFilter: this.params.hideFilter !== undefined
                          ? this.params.hideFilter : 'auto',
                allowRevert: this.params.allowRevert, /* it can be undefined */
                allowClearSelection: this.params.allowClearSelection || false,
                autoSelect: this.params.autoSelect === undefined
                          ? !this.multiple && !this.params.fetchCallback
                          : this.params.autoSelect,
                autoDisabled: typeof this.params.autoDisabled === 'boolean'
                            ? this.params.autoDisabled : true,
                strictValue: this.params.strictValue || false,
                selectionOverflow: this.params.selectionOverflow || 'collapsed',
                placeholder: this.placeholder,
                formatOption: this.params.formatOption,
                formatSelection: this.params.formatSelection,
            },
            fetchCallback: this.params.fetchCallback,
            getItemsCallback: this.params.getItemsCallback,
        }});
    }

    protected mounted() {
        setTimeout(() => this.computeOffset(), 0);
    }

    protected beforeDestroy() {
        this.removeListeners();
    }

    /* }}} */

    protected render() {
        const h = this.renderWrapper();

        return (
            <div
                class={this.selecticClass}
                title={this.title}
                data-selectic="true"
                on={{
                    'click.prevent.stop': () => this.store.commit('isOpen', true),
                }}
            >
                {/* This input is for DOM submission */}
                <input
                    type="text"
                    id={this.id}
                    value={this.inputValue}
                    class="selectic__input-value"
                    on={{
                        focus: () => this.store.commit('isOpen', true),
                        blur: this.checkFocus,
                    }}
                />
                <MainInput
                    store={this.store}
                    id={this.id}
                    on={{
                        'item:click': (id: OptionId) => this.$emit('item:click', id),
                    }}
                    ref="mainInput"
                />
              {this.isFocused && (
                <ExtendedList
                    store={this.store}
                    offsetTop={this.offsetTop}
                    offsetLeft={this.offsetLeft}
                    width={this.width}
                    ref="extendedList"
                />
              )}
            </div>
        );
    }
}
