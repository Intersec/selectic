/* File Purpose:
 * It displays the core element which is always visible (where selection is
 * displayed) and handles all interaction with it.
 */

import {Vue, Component, Prop, Watch, h} from 'vtyx';
import Store, {OptionId, OptionItem} from './Store';
import Icon from './Icon';
import OptionIcon from './OptionIcon';

export interface Props {
    store: Store;

    /* id of the element */
    id?: string;
}

/** Minimal width (in px) needed to display a chip */
const MIN_CHIP_WIDTH = 50;

@Component
export default class MainInput extends Vue<Props> {
    public $refs: {
        selectedItems?: HTMLDivElement;
        comboboxEl?: HTMLDivElement;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop({default: ''})
    private id: string;

    /* }}} */
    /* {{{ data */

    private nbHiddenItems = 0;

    /** ids of the external <label> elements naming the combobox */
    private ariaLabelledby = '';

    /* reactivity non needed */
    private domObserver: MutationObserver | null = null;
    private doNotOpenOnFocus: boolean = false;
    private hasTriedToUnfold: boolean = false;
    /* isOpen state before the mousedown gives the focus (which opens the
     * list): the following click must not toggle it back */
    private wasOpenAtMousedown: boolean = false;

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

    get disabledList(): OptionItem[] {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.selectedOptions;

        if (!isMultiple || !value) {
            return [];
        }

        const disabledValues = (value as OptionItem[]).filter((option) => {
            return option.disabled;
        });

        return disabledValues;
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
        const nbSelection = (Array.isArray(value) && value.length) || 0;
        const hasOnlyOneValue = nbSelection === 1;
        const hasOnlyDisabled = nbSelection <= this.disabledList.length;

        /* Should not display the clear action if there is only one selected
         * item in multiple (as this item has already its remove icon) */
        return !isMultiple || !hasOnlyOneValue || !hasOnlyDisabled;
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

    get listBoxId(): string {
        return this.store.listBoxId;
    }

    get activeDescendant(): string | undefined {
        const state = this.store.state;

        if (!state.isOpen || state.activeItemIdx < 0) {
            return;
        }

        return this.store.optionId(state.activeItemIdx);
    }

    /** Text announced (live region) when navigating through chips */
    get chipsAnnouncement(): string {
        const state = this.store.state;
        const idx = state.activeChipIdx;
        const chips = state.selectedOptions;

        if (idx < 0 || !Array.isArray(chips)) {
            return '';
        }

        const chip = chips[idx];

        if (!chip) {
            return '';
        }

        const label = this.removeItemLabel(chip);

        return `${label} (${idx + 1}/${chips.length})`;
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

    private onMousedown() {
        this.wasOpenAtMousedown = this.store.state.isOpen;
    }

    private toggleFocus(focused?: boolean) {
        if (typeof focused === 'boolean') {
            this.store.commit('isOpen', focused);
        } else {
            this.store.commit('isOpen', !this.wasOpenAtMousedown);
        }
    }

    /** Move the DOM focus on the combobox element.
     * With doNotOpen, getting the focus does not open the list. */
    public focusCombobox(doNotOpen = false) {
        const el = this.$refs.comboboxEl;

        if (!el) {
            return;
        }

        if (doNotOpen) {
            this.doNotOpenOnFocus = true;
            setTimeout(() => this.doNotOpenOnFocus = false, 0);
        }

        el.focus();
    }

    /** When the list is closed, no other listener handles keys (the one of
     * ExtendedList only exists while the panel is mounted). Without this,
     * the combobox could not be reopened with the keyboard after Escape. */
    private onComboboxKeydown(evt: KeyboardEvent) {
        const state = this.store.state;

        if (state.isOpen || state.disabled) {
            return;
        }

        const key = evt.key;

        if (key !== 'ArrowDown' && key !== 'ArrowUp'
            && key !== 'Enter' && key !== ' ')
        {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();
        this.store.commit('isOpen', true);
    }

    private onComboboxFocus() {
        if (!this.doNotOpenOnFocus) {
            this.$emit('focus');
        }
    }

    private onComboboxBlur() {
        this.$emit('blur');
    }

    private removeItemLabel(item: OptionItem): string {
        return this.store.data.labels.removeSelectedItem
            .replace('%s', item.text);
    }

    /** Retrieve the <label> elements associated to the hidden input, so
     * the combobox gets the same accessible name. */
    private findAriaLabels() {
        const rootEl = this.$el?.parentElement as HTMLElement | null;
        const input = rootEl?.querySelector(
            'input.selectic__input-value'
        ) as HTMLInputElement | null;
        const labels = input?.labels;

        if (!labels?.length) {
            return;
        }

        const ids: string[] = [];

        Array.from(labels).forEach((label, idx) => {
            if (!label.id) {
                label.id = `selectic-${this.store._uid}-label-${idx}`;
            }
            ids.push(label.id);
        });

        this.ariaLabelledby = ids.join(' ');
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
            || !selectedOptions.length
            /* display all chips while navigating through them with
             * keyboard, so the active one is always visible */
            || state.activeChipIdx >= 0)
        {
            this.nbHiddenItems = 0;
            return;
        }

        /* Check if there is enough space to display items like there are
         * currently shown */
        const el = this.$refs.selectedItems;

        if (!el) {
            return;
        }

        const parentEl = el.parentElement as HTMLDivElement;

        if (!document.contains(parentEl)) {
            /* The element is currently not in DOM */
            this.createObserver(parentEl);
            return;
        }

        const parentPadding = parseInt(getComputedStyle(parentEl).getPropertyValue('padding-right'), 10);
        /* XXX: the clear icon can be an SVG (which has no offsetWidth) */
        const clearEl = parentEl.querySelector('.selectic-input__clear-icon');
        const clearWidth = clearEl ? clearEl.getBoundingClientRect().width : 0;
        const itemsWidth = parentEl.clientWidth - parentPadding - clearWidth;
        const spareWidth = itemsWidth - el.offsetWidth;

        if (spareWidth > 0) {
            /* Currently displayed items fit. If they are all hidden while
             * there is enough spare space, retry to display them (sizes
             * may have been computed while the component was not
             * correctly displayed) */
            if (!this.hasTriedToUnfold
                && this.nbHiddenItems >= selectedOptions.length
                && spareWidth >= MIN_CHIP_WIDTH)
            {
                this.hasTriedToUnfold = true;
                this.nbHiddenItems = 0;
            }
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

        /* Hide also the last displayed element (it may be truncated) */
        idx = Math.max(0, idx - 1);

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
        this.hasTriedToUnfold = false;
    }

    /** All the chips are rendered while navigating through them, but the
     * input stays on a single line: keep the active one visible. */
    @Watch('store.state.activeChipIdx')
    public onActiveChipChange() {
        if (this.store.state.activeChipIdx < 0) {
            return;
        }

        this.$nextTick(() => {
            const el = this.$el?.querySelector(
                '.selectic-input__selected-items__active'
            );

            el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        });
    }

    /* }}} */
    /* {{{ life cycles methods */

    public mounted() {
        this.findAriaLabels();
    }

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
                mousedown: this.onMousedown,
                'click.prevent.stop': () => this.toggleFocus(),
            }}
        >
            <div
                id={this.selecticId}
                class={['selectic-input form-control',
                        {
                            focused: this.store.state.isOpen,
                            disabled: this.store.state.disabled,
                            'selectic-input--unfolded':
                                this.store.state.activeChipIdx >= 0,
                        }]}
                role="combobox"
                tabIndex={this.isDisabled ? undefined : 0}
                aria-expanded={this.store.state.isOpen ? 'true' : 'false'}
                aria-haspopup="listbox"
                aria-controls={this.listBoxId}
                aria-activedescendant={this.activeDescendant}
                aria-disabled={this.isDisabled ? 'true' : undefined}
                aria-labelledby={this.ariaLabelledby || undefined}
                ref="comboboxEl"
                on={{
                    focus: this.onComboboxFocus,
                    blur: this.onComboboxBlur,
                    keydown: this.onComboboxKeydown,
                }}
            >
            { this.hasValue && !this.store.state.multiple && (
                <OptionIcon
                    icon={this.singleSelectedItem?.icon}
                    store={this.store}
                    className="selectic-input__value-icon"
                />
            )}
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
                        (item, idx) => (
                            <div
                                class={['single-value', {
                                    'selectic-input__selected-items__active':
                                        idx === this.store.state.activeChipIdx,
                                }]}
                                style={item.style}
                                title={item.title || item.text}
                                on={{
                                    click: () => this.$emit('item:click', item.id),
                                }}
                            >
                                <OptionIcon
                                    icon={item.icon}
                                    store={this.store}
                                    className="selectic-input__value-icon"
                                />
                                <span
                                    class="selectic-input__selected-items__value"
                                >
                                    { item.text }
                                </span>
                                {!this.isDisabled && !item.disabled && (
                                    <Icon
                                        icon="times"
                                        class="selectic-input__selected-items__icon"
                                        store={this.store}
                                        title={this.removeItemLabel(item)}
                                        aria-hidden="true"
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
                    aria-hidden="true"
                    store={this.store}
                    on={{ 'click.prevent.stop': this.clearSelection }}
                />
            )}
            </div>
            <span
                class="selectic-sr-only"
                role="status"
            >
                {this.chipsAnnouncement}
            </span>
            <div
                class={[
                    'selectic__icon-container',
                    'form-control-feedback',
                    {focused: this.store.state.isOpen}
                ]}
                data-test="selectic-toggle"
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
