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
 *   change [value, isExcluded, component]: triggered when the list is closed and a change occurs
 *   input [value, isExcluded, component]: triggered when a change occurs
 *   item:click [id, component]: triggered on multiple select, when user click on
 *                    selected item (in main input)
 *   open [component]: triggered when the list opens.
 *   close [component]: triggered when the list closes.
 */

import {Vue, Component, Emits, Prop, Watch, h} from 'vtyx';
import { unref } from 'vue';
import './css/selectic.css';

import { deepClone } from './tools';

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
    ListPosition,
    HideFilter,
    SelectAllOption,
} from './Store';
import MainInput from './MainInput';
import ExtendedList from './ExtendedList';

/* Export */
export {
    GroupValue,
    OptionValue,
    OptionItem,
    OptionProp,
    OptionId,
    StrictOptionId,
    SelectedValue,
    PartialMessages,
    GetCallback,
    FetchCallback,
    FormatCallback,
    SelectionOverflow,
    ListPosition,
    HideFilter,
};

type EventType = 'input' | 'change' | 'open' | 'close' | 'focus' | 'blur' | 'item:click';

export interface EventOptions {
    instance: Selectic;
    eventType: EventType;
    automatic: boolean;
}

export interface EventChangeOptions extends EventOptions {
    isExcluded: boolean;
}

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
    hideFilter?: HideFilter;

    /* Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;

    /* If true, the "select All" is still available even if all data are not fetched yet. */
    forceSelectAll?: SelectAllOption;

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

    /* Define where the list should be displayed.
     * With 'auto' it is displayed by default at bottom, but it can be at
     * top if there is not enough space below. */
    listPosition?: ListPosition;

    /* Described behavior when options from several sources are set (static, dynamic, slots)
     * It describe what to do (sort or force)
     * and the order (O → static options, D → dynamic options, E → slot elements)
     * Example: "sort-ODE"
     */
    optionBehavior?: string;

    /* Keep this component open if another Selectic component opens */
    keepOpenWithOtherSelectic?: boolean;

    /** Avoid click on group name to select all items in this group. */
    disableGroupSelection?: boolean;
}

export type OnCallback = (event: string, ...args: any[]) => void;
export type GetMethodsCallback = (methods: {
    clearCache: Selectic['clearCache'];
    changeTexts: Selectic['changeTexts'];
    getValue: Selectic['getValue'];
    getSelectedItems: Selectic['getSelectedItems'];
    isEmpty: Selectic['isEmpty'];
    toggleOpen: Selectic['toggleOpen'];
}) => void;


export interface Props {
    /* Selectic's initial value */
    value?: SelectedValue;

    /* If true, the effective selection is the opposite */
    selectionIsExcluded?: boolean;

    /* List of options to display */
    options?: OptionProp[];

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

    /* If enabled, it resets the dynamic cache when selectic opens */
    noCache?: Boolean;

    /* If true, the component opens (at start or if it is closed).
     * If false, the components closes (if it is opened). */
    open?: Boolean;

    /* Props which is not expected to change during the life time of the
     * component.
     * These parameters modify the component behavior but are not official
     * attributes of select.
     */
    params?: ParamProps;

    /** _on is used mainly for tests.
     * Its purpose is to propagate $emit event mainly
     * for parents which are not in Vue environment.
     */
    _on?: OnCallback;

    /** _getMethods is used mainly for tests.
     * Its purpose is to provide public methods outside of a Vue environment.
     */
    _getMethods?: GetMethodsCallback;
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

    @Prop({ default: false })
    public noCache: boolean;

    @Prop()
    public open?: boolean;

    @Prop({default: () => ({
        allowClearSelection: false,
        strictValue: false,
        selectionOverflow: 'collapsed',
    })})
    public params: ParamProps;

    /** For tests */
    @Prop()
    public _on?: OnCallback;

    @Prop()
    public _getMethods?: GetMethodsCallback;

    /* }}} */
    /* {{{ data */

    public elementBottom = 0;
    public elementTop = 0;
    public elementLeft = 0;
    public elementRight = 0;
    public width = 0;
    private hasBeenRendered = false;

    private store: Store = {} as Store;

    /* No observer */
    private _elementsListeners: Array<Element | Window>;
    private _oldValue: SelectedValue; /* old values in watcher are buggy :'( */

    /* }}} */
    /* {{{ computed */

    get isFocused() {
        if (!this.hasBeenRendered) {
            return false;
        }
        return !!this.store.state.isOpen;
    }

    get scrollListener() {
        return this.computeOffset.bind(this, true);
    }

    get outsideListener() {
        return (evt: MouseEvent) => {
            if (!this.$refs) {
                /* this component should have been destroyed */
                this.removeListeners();
                this.store.commit('isOpen', false);
                return;
            }

            const store = this.store;
            const keepOpenWithOtherSelectic = this.params.keepOpenWithOtherSelectic;
            const extendedList = this.$refs.extendedList;

            if (!extendedList) {
                /* this component is not focused anymore */
                if (!keepOpenWithOtherSelectic) {
                    this.removeListeners();
                    this.store.commit('isOpen', false);
                }
                return;
            }

            const target =  evt.target as Node;

            if (!extendedList.$el.contains(target) && !this.$el.contains(target)) {
                store.commit('isOpen', false);
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

    get hasGivenValue() {
        const value = unref(this.value);

        return value !== null && value !== undefined;
    }

    get defaultValue() {
        return this.params.emptyValue ?? null;
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

    public toggleOpen(open?: boolean): boolean {
        if (typeof open === 'undefined') {
            open = !this.store.state.isOpen;
        }

        this.store.commit('isOpen', open);

        return this.store.state.isOpen;
    }

    /* }}} */
    /* {{{ private methods */

    private computeWidth() {
        const el = this.$refs.mainInput.$el as HTMLElement;

        this.width = el.offsetWidth;
    }

    private computeOffset(doNotAddListener = false) {
        const mainInput = this.$refs.mainInput;

        const mainEl = mainInput?.$el as HTMLElement;

        if (!mainEl) {
            /* This method has been called too soon (before render function) */
            return;
        }

        const _elementsListeners = this._elementsListeners;

        /* add listeners */
        if (!doNotAddListener) {
            let el = mainEl;
            while (el) {
                el.addEventListener('scroll', this.scrollListener, { passive: true });
                _elementsListeners.push(el);

                el = el.parentElement as HTMLElement;
            }

            /* Listening to window allows to listen to html/body scroll events for some browser (like Chrome) */
            window.addEventListener('scroll', this.scrollListener, { passive: true });
            _elementsListeners.push(window);
        }

        const box = mainEl.getBoundingClientRect();

        const elementBottom = box.bottom;
        const elementTop = box.top;
        const elementLeft = box.left;
        const elementRight = box.right;

        this.elementLeft = elementLeft;
        this.elementRight = elementRight;
        this.elementBottom = elementBottom;
        this.elementTop = elementTop;
    }

    private removeListeners() {
        this._elementsListeners.forEach((el) => {
            el.removeEventListener('scroll', this.scrollListener, { passive: true } as  any);
        });

        this._elementsListeners = [];

        document.removeEventListener('click', this.outsideListener, true);
        window.removeEventListener('resize', this.windowResize, false);
    }

    private focusToggled() {
        const store = this.store;
        const state = store.state;

        if (this.isFocused) {
            if (this.noCache) {
                store.clearCache();
            }
            this.computeWidth();
            window.addEventListener('resize', this.windowResize, false);
            document.addEventListener('click', this.outsideListener, true);
            this.computeOffset();
            this.emit('open');
        } else {
            this.removeListeners();
            if (state.status.hasChanged) {
                this.$emit('change', this.getValue(), state.selectionIsExcluded, this);
                this.store.resetChange();
            }
            this.emit('close');
        }
    }

    private compareValues(oldValue: SelectedValue, newValue: SelectedValue) {
        if (Array.isArray(oldValue)) {
            return Array.isArray(newValue)
                && oldValue.length === newValue.length
                && oldValue.every((val) => newValue.includes(val));
        }
        if (oldValue === undefined && newValue === this.defaultValue) {
            return true;
        }
        return oldValue === newValue;
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('value', { deep: true })
    public onValueChange() {
        const currentValue = this.store.state.internalValue;
        const newValue = this.value ?? null;
        const areSimilar = this.compareValues(
            currentValue as SelectedValue,
            newValue as SelectedValue
        );

        if (!areSimilar) {
            this.store.commit('internalValue', newValue);
        }
    }

    @Watch('selectionIsExcluded')
    public onExcludedChange() {
        this.store.props.selectionIsExcluded = this.selectionIsExcluded;
    }

    @Watch('options', { deep: true })
    public onOptionsChange() {
        this.store.props.options = deepClone(this.options, ['data']);
    }

    @Watch('texts', { deep: true })
    public onTextsChange() {
        const texts = this.texts;

        if (texts) {
            this.changeTexts(texts);
        }
    }

    @Watch('disabled')
    public onDisabledChange() {
        this.store.props.disabled = this.disabled;
    }

    @Watch('groups', { deep: true })
    public onGroupsChanged() {
        this.store.changeGroups(this.groups);
    }

    @Watch('placeholder')
    public onPlaceholderChanged() {
        this.store.commit('placeholder', this.placeholder);
    }

    @Watch('open')
    public onOpenChanged() {
        this.store.commit('isOpen', this.open ?? false);
    }

    @Watch('isFocused')
    public onFocusChanged() {
        this.focusToggled();
    }

    @Watch('store.state.internalValue', { deep: true })
    public onInternalValueChange() {
        const oldValue = this._oldValue;
        const value = this.getValue();
        const areSimilar = this.compareValues(oldValue, value);
        /* should not trigger when initializing internalValue, but should do
         * if it changes the initial value */
        const canTrigger = (oldValue !== undefined || !this.hasGivenValue) && !areSimilar;

        if (canTrigger) {
            const selectionIsExcluded = this.store.state.selectionIsExcluded;

            this.emit('input', value, selectionIsExcluded);

            if (!this.isFocused) {
                this.emit('change', value, selectionIsExcluded);
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

    /* This method is only to emit the events and to replicate them */
    private _emit(event: 'input' | 'change', value: SelectedValue, options: EventChangeOptions): void;
    private _emit(event: 'open' | 'close' | 'focus' | 'blur', options: EventOptions): void;
    private _emit(event: 'item:click', value: OptionId, options: EventOptions): void;
    private _emit(event: EventType, ...args: any[]) {
        this.$emit(event, ...args);

        if (typeof this._on === 'function') {
            this._on(event, ...args);
        }
    }

    private emit(event: 'input' | 'change', value: SelectedValue, isExcluded: boolean): void;
    private emit(event: 'open' | 'close' | 'focus' | 'blur'): void;
    private emit(event: 'item:click', value: OptionId): void;
    private emit(event: EventType, value?: SelectedValue | OptionId, isExcluded?: boolean) {
        const automatic = this.store.state.status.automaticChange;
        const options: EventOptions = {
            instance: this,
            eventType: event,
            automatic,
        };
        switch (event) {
            case 'input':
            case 'change':
                const changeOptions: EventChangeOptions = Object.assign({
                    isExcluded: isExcluded!,
                }, options);
                this._emit(event, value as SelectedValue, changeOptions);
                break;
            case 'open':
            case 'focus':
                this._emit('open', options);
                this._emit('focus', options);
                break;
            case 'close':
            case 'blur':
                this._emit('close', options);
                this._emit('blur', options);
                break;
            case 'item:click':
                this._emit(event, value as OptionId, options);
                break;
        }
    }

    // private extractFromNode(node: Vue.VNode, text = ''): OptionValue {
    //     function styleToString(staticStyle?: {[key: string]: string}): string | undefined {
    //         if (!staticStyle) {
    //             return;
    //         }
    //         let styles = [];
    //         for (const [key, value] of Object.entries(staticStyle)) {
    //             styles.push(`${key}: ${value}`);
    //         }
    //         return styles.join(';');
    //     }

    //     const domProps = node.data?.domProps;
    //     const attrs = node.data?.attrs;
    //     const id = domProps?.value ?? attrs?.value ?? attrs?.id ?? text;
    //     const className = node.data?.staticClass;
    //     const style = styleToString(node.data?.staticStyle);

    //     const optVal: OptionValue = {
    //         id,
    //         text,
    //         className,
    //         style,
    //     };

    //     if (attrs) {
    //         for (const [key, val] of Object.entries(attrs)) {
    //             switch(key) {
    //                 case 'title':
    //                     optVal.title = val;
    //                     break;
    //                 case 'disabled':
    //                     if (val === false) {
    //                         optVal.disabled = false;
    //                     } else {
    //                         optVal.disabled = true;
    //                     }
    //                     break;
    //                 case 'group':
    //                     optVal.group = val;
    //                     break;
    //                 case 'icon':
    //                     optVal.icon = val;
    //                     break;
    //                 case 'data':
    //                     optVal.data = val;
    //                     break;
    //                 default:
    //                     if (key.startsWith('data')) {
    //                         if (typeof optVal.data !== 'object') {
    //                             optVal.data = {};
    //                         }
    //                         optVal.data[key.slice(5)] = val;
    //                     }
    //             }
    //         }
    //     }

    //     return optVal;
    // }

    // private extractOptionFromNode(node: Vue.VNode): OptionValue {
    //     const children = node.children;
    //     const text = (children && children[0].text || '').trim();

    //     return this.extractFromNode(node, text);
    // }

    // private extractOptgroupFromNode(node: Vue.VNode): OptionValue {
    //     const attrs = node.data?.attrs;
    //     const children = node.children || [];
    //     const text = attrs?.label || '';
    //     const options: OptionValue[] = [];

    //     for (const child of children) {
    //         if (child.tag === 'option') {
    //             options.push(this.extractOptionFromNode(child));
    //         }
    //     }

    //     const opt = this.extractFromNode(node, text);
    //     opt.options = options;

    //     return opt;
    // }

    /* }}} */
    /* {{{ Life cycle */

    public created() {
        this._elementsListeners = [];

        this.store = new Store({
            options: deepClone(this.options, ['data']),
            value: deepClone(this.value),
            selectionIsExcluded: this.selectionIsExcluded,
            disabled: this.disabled,
            texts: this.texts,
            groups: deepClone(this.groups),
            keepOpenWithOtherSelectic: !!this.params.keepOpenWithOtherSelectic,
            params: {
                multiple: (this.multiple ?? false) !== false,
                pageSize: this.params.pageSize || 100,
                hideFilter: this.params.hideFilter ?? 'auto',
                allowRevert: this.params.allowRevert, /* it can be undefined */
                forceSelectAll: this.params.forceSelectAll || 'auto',
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
                listPosition: this.params.listPosition || 'auto',
                optionBehavior: this.params.optionBehavior, /* it can be undefined */
                isOpen: (this.open ?? false) !== false,
                disableGroupSelection: this.params.disableGroupSelection,
            },
            fetchCallback: this.params.fetchCallback,
            getItemsCallback: this.params.getItemsCallback,
        });

        if (typeof this._getMethods === 'function') {
            this._getMethods({
                clearCache: this.clearCache.bind(this),
                changeTexts: this.changeTexts.bind(this),
                getValue: this.getValue.bind(this),
                getSelectedItems: this.getSelectedItems.bind(this),
                isEmpty: this.isEmpty.bind(this),
                toggleOpen: this.toggleOpen.bind(this),
            });
        }
    }

    public mounted() {
        setTimeout(() => {
            this.hasBeenRendered = true;
            this.computeOffset();
        }, 100);
    }

    public beforeUpdate() {
        // const elements = this.$slots.default;
        // if (!elements) {
        //     this.store.childOptions = [];
        //     return;
        // }
        // const options = [];

        // for (const node of elements) {
        //     if (node.tag === 'option') {
        //         const prop = this.extractOptionFromNode(node);
        //         options.push(prop);
        //     } else
        //     if (node.tag === 'optgroup') {
        //         const prop = this.extractOptgroupFromNode(node);
        //         options.push(prop);
        //     }
        // }

        // this.store.childOptions = options;
    }

    public beforeUnmount() {
        this.removeListeners();
    }

    /* }}} */

    @Emits(['input', 'change', 'open', 'focus', 'close', 'blur', 'item:click'])
    public render() {
        const id = this.id || undefined;
        const store = this.store;

        if (!store.state) {
            return; /* component is not ready yet */
        }

        return (
            <div
                class={this.selecticClass}
                title={this.title}
                data-selectic="true"
                on={{
                    'click.prevent.stop': () => store.commit('isOpen', true),
                }}
            >
                {/* This input is for DOM submission */}
                <input
                    type="text"
                    id={id}
                    value={this.inputValue}
                    class="selectic__input-value"
                    on={{
                        focus: () => store.commit('isOpen', true),
                        blur: this.checkFocus,
                    }}
                />
                <MainInput
                    store={store}
                    id={id}
                    on={{
                        'item:click': (id: OptionId) => this.emit('item:click', id),
                    }}
                    ref="mainInput"
                />
              {this.isFocused && (
                <ExtendedList
                    class={this.className}
                    store={store}
                    elementBottom={this.elementBottom}
                    elementTop={this.elementTop}
                    elementLeft={this.elementLeft}
                    elementRight={this.elementRight}
                    width={this.width}
                    ref="extendedList"
                />
              )}
            </div>
        );
    }
}
