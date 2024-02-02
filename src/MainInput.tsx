/* File Purpose:
 * It displays the core element which is always visible (where selection is
 * displayed) and handles all interaction with it.
 */

import {Vue, Component, Prop, Watch, h} from 'vtyx';
import Store, {OptionId, OptionItem} from './Store';
import Icon from './Icon';

export interface Props {
    store: Store;

    /* id of the element */
    id?: string;
}

@Component
export default class MainInput extends Vue<Props> {
    public $refs: {
        selectedItems: HTMLDivElement;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop({default: ''})
    private id: string;

    /* }}} */
    /* {{{ data */

    private nbHiddenItems = 0;

    /* reactivity non needed */
    private domObserver: MutationObserver | null = null;

    /* }}} */
    /* {{{ computed */

    get isDisabled(): boolean {
        return this.store.state.disabled;
    }

    get hasValue(): boolean {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.internalValue;

        return isMultiple
             ? Array.isArray(value) && value.length > 0
             : value !== null;
    }

    get displayPlaceholder(): boolean {
        const placeholder = this.store.state.placeholder;
        const hasValue = this.hasValue;

        return !!placeholder && !hasValue;
    }

    get canBeCleared(): boolean {
        const allowClearSelection = this.store.state.allowClearSelection;
        const isDisabled = this.isDisabled;
        const hasValue = this.hasValue;

        return allowClearSelection && !isDisabled && hasValue;
    }

    get showClearAll(): boolean {
        if (!this.canBeCleared) {
            return false;
        }

        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.internalValue;
        const hasOnlyOneValue = Array.isArray(value) && value.length === 1;

        /* Should not display the clear action if there is only one selected
         * item in multiple (as this item has already its remove icon) */
        return !isMultiple || !hasOnlyOneValue;
    }

    get clearedLabel(): string {
        const isMultiple = this.store.state.multiple;
        const labelKey = isMultiple ? 'clearSelections' : 'clearSelection';

        return this.store.data.labels[labelKey];
    }

    get singleSelectedItem(): undefined | OptionItem {
        const state = this.store.state;
        const isMultiple = state.multiple;

        if (isMultiple) {
            return;
        }

        return this.selectedOptions as OptionItem;
    }

    get singleSelectedItemText(): string {
        const item = this.singleSelectedItem;

        return item?.text || '';
    }

    get singleSelectedItemTitle(): string {
        const item = this.singleSelectedItem;

        return item?.title || item?.text || '';
    }

    get singleStyle() {
        const selected = this.selectedOptions as OptionItem;

        if (!this.store.state.multiple && selected) {
            return selected.style;
        }

        return;
    }

    get selecticId() {
        if (this.id) {
            return 'selectic-' + this.id;
        }

        return;
    }

    get isSelectionReversed() {
        return this.store.state.selectionIsExcluded;
    }

    get reverseSelectionLabel() {
        const labelKey = 'reverseSelection';

        return this.store.data.labels[labelKey];
    }

    get formatItem() {
        const formatSelection = this.store.state.formatSelection;

        if (formatSelection) {
            return formatSelection;
        }

        return (item: OptionItem) => item;
    }

    get selectedOptions() {
        const selection = this.store.state.selectedOptions;
        const formatItem = this.formatItem.bind(this);

        if (selection === null) {
            return null;
        }

        if (Array.isArray(selection)) {
            return selection.map(formatItem);
        }

        return formatItem(selection);
    }

    get showSelectedOptions(): OptionItem[] {
        if (!this.store.state.multiple) {
            return [];
        }
        const selectedOptions = this.selectedOptions as OptionItem[];
        const nbHiddenItems = this.nbHiddenItems;

        if (nbHiddenItems) {
            return selectedOptions.slice(0, -nbHiddenItems);
        }

        return selectedOptions;
    }

    get moreSelectedNb() {
        const store = this.store;
        const nbHiddenItems = this.nbHiddenItems;

        if (!store.state.multiple || nbHiddenItems === 0) {
            return '';
        }
        const labels = store.data.labels;
        const text = nbHiddenItems === 1 ? labels.moreSelectedItem
                                         : labels.moreSelectedItems;

        return text.replace(/%d/, nbHiddenItems.toString());
    }

    get moreSelectedTitle() {
        const nbHiddenItems = this.nbHiddenItems;

        if (!this.store.state.multiple) {
            return '';
        }

        const list = this.selectedOptions as OptionItem[];

        return list.slice(-nbHiddenItems).map((item) => item.text).join('\n');
    }

    /* }}} */
    /* {{{ methods */

    private toggleFocus(focused?: boolean) {
        if (typeof focused === 'boolean') {
            this.store.commit('isOpen', focused);
        } else {
            this.store.commit('isOpen', !this.store.state.isOpen);
        }
    }

    private selectItem(id: OptionId) {
        this.store.selectItem(id, false);
    }

    private clearSelection() {
        this.store.selectItem(null);
    }

    private computeSize() {
        const state = this.store.state;
        const selectedOptions = this.selectedOptions as OptionItem[];

        if (!state.multiple || state.selectionOverflow !== 'collapsed'
        ||  !selectedOptions.length)
        {
            this.nbHiddenItems = 0;
            return;
        }

        /* Check if there is enough space to display items like there are
         * currently shown */
        const el = this.$refs.selectedItems;
        const parentEl = el.parentElement as HTMLDivElement;

        if (!document.contains(parentEl)) {
            /* The element is currently not in DOM */
            this.createObserver(parentEl);
            return;
        }

        const parentPadding = parseInt(getComputedStyle(parentEl).getPropertyValue('padding-right'), 10);
        const clearEl = parentEl.querySelector('.selectic-input__clear-icon')  as HTMLSpanElement;
        const clearWidth = clearEl ? clearEl.offsetWidth : 0;
        const itemsWidth = parentEl.clientWidth - parentPadding - clearWidth;

        if (itemsWidth - el.offsetWidth > 0) {
            return;
        }

        /* Look for the first element which start outside bounds */
        const moreEl = el.querySelector('.more-items') as HTMLDivElement;
        const moreSize = moreEl && moreEl.offsetWidth || 0;
        const itemsSpace = itemsWidth - moreSize;
        const childrenEl = el.children;
        const childrenLength = childrenEl.length;

        if (itemsSpace <= 0) {
            /* Element is not visible in DOM */
            this.nbHiddenItems = selectedOptions.length;
            return;
        }

        if (moreEl && childrenLength === 1) {
            /* The only child element is the "more" element */
            return;
        }

        let idx = 0;
        while(idx < childrenLength
        &&    (childrenEl[idx] as HTMLDivElement).offsetLeft < itemsSpace)
        {
            idx++;
        }

        /* Hide the previous element */
        idx--;

        this.nbHiddenItems = selectedOptions.length - idx;
    }

    private closeObserver() {
        const observer = this.domObserver;
        if (observer) {
            observer.disconnect();
        }
        this.domObserver = null;
    }

    private createObserver(el: HTMLElement) {
        this.closeObserver();
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (const elMutated of Array.from(mutation.addedNodes)) {
                        /* Check that element has been added to DOM */
                        if (elMutated.contains(el)) {
                            this.closeObserver();
                            this.computeSize();
                            return;
                        }
                    }
                }
            }
        });
        const config = { childList: true, subtree: true };

        observer.observe(document, config);
        this.domObserver = observer;
    }

    /* }}} */
    /* {{{ watch */

    @Watch('store.state.internalValue', { deep: true })
    public onInternalChange() {
        this.nbHiddenItems = 0;
    }

    /* }}} */
    /* {{{ life cycles methods */

    public updated() {
        this.computeSize();
    }

    public beforeUnmount() {
        this.closeObserver();
    }

    /* }}} */

    public render() {
        return (
        <div
            class="selectic-container has-feedback"
            on={{
                'click.prevent.stop': () => this.toggleFocus(),
            }}
        >
            <div
                id={this.selecticId}
                class={['selectic-input form-control',
                        {
                            focused: this.store.state.isOpen,
                            disabled: this.store.state.disabled,
                        }]}
            >
            { this.hasValue && !this.store.state.multiple && (
                <span
                    class="selectic-item_text"
                    style={this.singleStyle}
                    title={this.singleSelectedItemTitle}
                >
                    {this.singleSelectedItemText}
                </span>
            )}
            {this.displayPlaceholder && (
                <span
                    class={[
                        'selectic-input__selected-items__placeholder',
                        'selectic-item_text',
                    ]}
                    title={this.store.state.placeholder}
                >
                    {this.store.state.placeholder}
                </span>
            )}
            {this.store.state.multiple && (
                <div
                    class="selectic-input__selected-items"
                    ref="selectedItems"
                >
                    {this.isSelectionReversed && (
                        <Icon
                            icon="strikethrough"
                            store={this.store} class="selectic-input__reverse-icon"
                            title={this.reverseSelectionLabel}
                        />
                    )}
                    {this.showSelectedOptions.map(
                        (item) => (
                            <div
                                class="single-value"
                                style={item.style}
                                title={item.title || item.text}
                                on={{
                                    click: () => this.$emit('item:click', item.id),
                                }}
                            >
                                <span
                                    class="selectic-input__selected-items__value"
                                >
                                    { item.text }
                                </span>
                                {!this.isDisabled && (
                                    <Icon
                                        icon="times"
                                        class="selectic-input__selected-items__icon"
                                        store={this.store}
                                        on={{
                                            'click.prevent.stop': () => this.selectItem(item.id),
                                        }}
                                    />
                                )}
                            </div>
                        )
                  )}
                  {this.moreSelectedNb && (
                    <div
                        class="single-value more-items"
                        title={this.moreSelectedTitle}
                    >
                        {this.moreSelectedNb}
                    </div>
                  )}
                </div>
            )}
            {this.showClearAll && (
                <Icon
                    icon="times"
                    class="selectic-input__clear-icon"
                    title={this.clearedLabel}
                    store={this.store}
                    on={{ 'click.prevent.stop': this.clearSelection }}
                />
            )}
            </div>
            <div
                class={[
                    'selectic__icon-container',
                    'form-control-feedback',
                    {focused: this.store.state.isOpen}
                ]}
                on={{
                    'click.prevent.stop': () => this.toggleFocus(),
                }}
            >
                <Icon icon="caret-down" class="selectic-icon" store={this.store} />
            </div>
        </div>
        );
    }
}
