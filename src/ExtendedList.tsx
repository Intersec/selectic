/* File Purpose:
 * It manages the panel which is displayed when Selectic is open.
 * Content of inner elements are related to dedicated files.
 */

import {Vue, Component, Emits, Prop, Watch, h} from 'vtyx';
import { unref } from 'vue';

import Store, { OptionId, OptionItem } from './Store';
import Filter from './Filter';
import Footer from './Footer';
import List from './List';
import Icon from './Icon';

export interface Props {
    store: Store;
    width?: number;

    /* positions of the main element related to current window */
    elementTop?: number;
    elementBottom?: number;
    elementLeft?: number;
    elementRight?: number;
}

/* list estimation height
 * 30px × 10 + 20px (for panel header)
 */
const DEFAULT_LIST_HEIGHT = 320;

/** Elements of the panel which can take the focus with Tab */
const FOCUSABLE_ELEMENTS = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

@Component
export default class ExtendedList extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop({default: 0})
    private elementLeft: number;

    @Prop({default: 0})
    private elementRight: number;

    @Prop({default: 0})
    private elementTop: number;

    @Prop({default: 0})
    private elementBottom: number;

    @Prop({default: 300})
    private width: number;

    /* }}} */
    /* {{{ data */

    private topGroupName = ' ';
    private topGroupId: OptionId = null;
    private listHeight = 0;
    private listWidth = 200;
    private availableSpace = 0;

    /* }}} */
    /* {{{ computed */

    /** check if the height of the box has been completely estimated. */
    get isFullyEstimated(): boolean {
        const listHeight = this.listHeight;
        const availableSpace = this.availableSpace;

        return listHeight !== 0 && listHeight < availableSpace;
    }

    get searchingLabel() {
        return this.store.data.labels.searching;
    }

    get searching() {
        return this.store.state.status.searching;
    }

    get errorMessage() {
        return this.store.state.status.errorMessage;
    }

    get infoMessage() {
        if (this.searching) {
            return '';
        }

        const store = this.store;
        const state = store.state;
        const labels = store.data.labels;

        /* "Show selection" view: surface a persistent hint about the
         * filtered scope with the current selection count. When the
         * selection is empty the store's watcher flips `showSelection`
         * back off, so this branch is only hit while there is at least
         * one selected item. */
        if (store.isShowingSelection) {
            const count = Array.isArray(state.internalValue)
                ? state.internalValue.length
                : 0;
            return labels.showingSelection.replace(/%s/, String(count));
        }

        if (state.filteredOptions.length === 0) {
            if (state.searchText) {
                return labels.noResult;
            }
            return labels.noData;
        }
        return '';
    }

    get bestPosition(): 'top' | 'bottom' {
        const windowHeight = window.innerHeight;
        const isFullyEstimated = this.isFullyEstimated;
        /* XXX: The max() is because if listHeight is greater than default,
         * it means that the value is more accurate than the default. */
        const listHeight = isFullyEstimated ? this.listHeight
            : Math.max(DEFAULT_LIST_HEIGHT, this.listHeight);
        const inputTop = this.elementTop;
        const inputBottom = this.elementBottom;
        const availableTop = inputTop;
        const availableBottom = windowHeight - inputBottom;

        if (listHeight < availableBottom) {
            return 'bottom';
        }

        if (listHeight < availableTop) {
            return 'top';
        }

        /* There are not enough space neither at bottom nor at top */
        return availableBottom < availableTop ? 'top' : 'bottom';
    }

    get position(): 'top' | 'bottom' {
        const listPosition = this.store.state.listPosition;

        if (listPosition === 'auto') {
            return this.bestPosition;
        }

        return listPosition;
    }

    get horizontalStyle(): string {
        const windowWidth = window.innerWidth;
        const listWidth = this.listWidth;
        const inputLeft = this.elementLeft;
        const inputRight = this.elementRight;

        /* Check if list can extend on right */
        if (inputLeft + listWidth <= windowWidth) {
            return `left: ${inputLeft}px;`;
        }

        /* Check if list can extend on left */
        if (listWidth < inputRight) {
            return `left: ${inputRight}px; transform: translateX(-100%);`;
        }

        /* There are not enough space neither at left nor at right.
         * So do not extend the list. */
        return `left: ${inputLeft}px; min-width: unset;`;
    }

    get positionStyle() {
        const listPosition = this.position;
        const horizontalStyle = this.horizontalStyle;
        const width = this.width;

        if (listPosition === 'top') {
            const transform = horizontalStyle.includes('transform')
                ? 'transform: translateX(-100%) translateY(-100%);'
                : 'transform: translateY(-100%);';
            const elementTop = this.elementTop;
            const availableSpace = this.elementTop;
            this.availableSpace = availableSpace;

            return `
                --top-position: ${elementTop}px;
                ${horizontalStyle}
                --list-width: ${width}px;
                ${transform};
                --availableSpace: ${availableSpace}px;
            `;
        }
        const elementBottom = this.elementBottom;
        const availableSpace = window.innerHeight - elementBottom;
        this.availableSpace = availableSpace;

        return `
            --top-position: ${elementBottom}px;
            ${horizontalStyle}
            --list-width: ${width}px;
            --availableSpace: ${availableSpace}px;
        `;
    }

    get topGroup(): OptionItem | undefined {
        const topGroupId = this.topGroupId;

        if (!topGroupId) {
            return undefined;
        }

        const group = this.store.state.filteredOptions.find((option) => {
            return option.id === topGroupId;
        });

        return group;
    }

    get topGroupSelected(): boolean {
        const group = this.topGroup;

        return !!group?.selected;
    }

    get topGroupDisabled(): boolean {
        const group = this.topGroup;

        return !!group?.disabled;
    }

    /* }}} */
    /* {{{ watch */

    @Watch('store.state.filteredOptions', { deep: true })
    public onFilteredOptionsChange() {
        this.$nextTick(this.computeListSize);
    }

    @Watch('store.state.hideFilter')
    public onHideFilterChange() {
        this.$nextTick(this.computeListSize);
    }

    /* }}} */
    /* {{{ methods */

    private getGroup(id: OptionId) {
        const group = this.store.state.groups.get(id);
        const groupName = group || ' ';

        this.topGroupName = groupName;
        this.topGroupId = id;
    }

    private computeListSize() {
        const box = this.$el.getBoundingClientRect();

        this.listHeight = box.height;
        this.listWidth = box.width;
    }

    private clickHeaderGroup() {
        this.store.selectGroup(this.topGroupId, !this.topGroupSelected);
    }

    private onKeyDown(evt: KeyboardEvent) {
        /* The listener is on `document.body` because the panel is appended
         * there. The list can be open while the focus is elsewhere in the
         * page (with the `open` prop): only handle the keys coming from the
         * panel or from the combobox it belongs to. */
        const target = evt.target as Node | null;

        if (!target || !(this.$el?.contains(target)
            || !!this.comboboxEl?.contains(target)))
        {
            return;
        }

        if (evt.key === 'Tab' && this.handleTabKey(evt)) {
            return;
        }

        this.store.handleKeydown(evt);
    }

    /** The combobox this panel is attached to (it lives outside the panel,
     * which is appended to the body) */
    private get comboboxEl(): HTMLElement | null {
        return document.querySelector<HTMLElement>(
            `div[role="combobox"][aria-controls="${this.store.listBoxId}"]`
        );
    }

    /** The panel is appended at the end of body, so its buttons are not in
     * the natural tab order of the page. From the combobox, Tab enters the
     * panel; from its last element, the focus goes back to the combobox so
     * Tab leaves the component naturally.
     * Returns true when the event is fully handled. */
    private handleTabKey(evt: KeyboardEvent): boolean {
        const target = evt.target as HTMLElement | null;
        const panelEl = this.$el as HTMLElement;
        const focusableEls = Array.from(
            panelEl.querySelectorAll(FOCUSABLE_ELEMENTS)
        ) as HTMLElement[];

        if (!target || !focusableEls.length) {
            return false;
        }

        const comboboxEl = this.comboboxEl;
        const isOnCombobox = target === comboboxEl;
        const targetIdx = focusableEls.indexOf(target);

        if (!evt.shiftKey && isOnCombobox) {
            focusableEls[0].focus();
            evt.preventDefault();
            return true;
        }

        if (!evt.shiftKey && targetIdx === focusableEls.length - 1) {
            /* the browser moves the focus from the combobox position */
            comboboxEl?.focus();
            return true;
        }

        if (evt.shiftKey && targetIdx === 0) {
            comboboxEl?.focus();
            evt.preventDefault();
            return true;
        }

        return false;
    }

    /* }}} */
    /* {{{ Life cycles */

    public mounted() {
        document.body.appendChild(this.$el);
        document.body.addEventListener('keydown', this.onKeyDown);
        this.computeListSize();
    }

    public unmounted() {
        document.body.removeEventListener('keydown', this.onKeyDown);

        /* force the element to be removed from DOM */
        if (this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
    }

    /* }}} */

    @Emits(['footer:selectAll', 'footer:invertSelection', 'footer:showSelection', 'footer:clearSelection', 'footer:clearFilter', 'footer:apply'])
    public render() {
        const store = this.store;
        const state = store.state;
        const isGroup = state.groups.size > 0 &&
            state.totalFilteredOptions > store.data.itemsPerPage;

        return (
            <div
                style={this.positionStyle}
                class={[
                    'selectic selectic__extended-list',
                    `selectic-position-${this.position}`,
                ]}
            >
              {!state.hideFilter && (
                <Filter
                    store={this.store}
                />
              )}

              {isGroup && (
                <span
                    aria-hidden="true"
                    class={[
                        'selectic-item selectic-item--header selectic-item__is-group',
                        {
                            selected: this.topGroupSelected,
                            selectable: unref(this.store.allowGroupSelection) && !this.topGroupDisabled,
                            disabled: this.topGroupDisabled,
                        },
                    ]}
                    on={{
                        click: () => this.clickHeaderGroup(),
                    }}
                >
                  {this.topGroupSelected && (
                    <Icon icon="check" store={this.store} class="selectic-item_icon" />
                  )}
                    {this.topGroupName}
                </span>
              )}
                <List
                    store={store}
                    on={{
                        groupId: this.getGroup,
                    }}
                />
                {this.$slots.listFooter?.()}
              {this.infoMessage && (
                <div class="selectic__message alert-info" role="status">
                    {this.infoMessage}
                </div>
              )}
              {this.searching && (
                <div class="selectic__message" role="status">
                    <Icon icon="spinner" store={this.store} spin />
                    {this.searchingLabel}
                </div>
              )}
              {this.errorMessage && (
                <div
                    class="selectic__message alert-danger"
                    role="alert"
                    on={{ click: () => store.resetErrorMessage() }}
                >
                    {this.errorMessage}
                </div>
              )}
                {(state.footer || state.multiple) && (
                    <Footer
                        store={store}
                        on={{
                            selectAll: () => this.$emit('footer:selectAll'),
                            invertSelection: () => this.$emit('footer:invertSelection'),
                            showSelection: () => this.$emit('footer:showSelection'),
                            clearSelection: () => this.$emit('footer:clearSelection'),
                            clearFilter: () => this.$emit('footer:clearFilter'),
                            apply: () => this.$emit('footer:apply'),
                        }}
                    />
                )}
            </div>
        );
    }
}
