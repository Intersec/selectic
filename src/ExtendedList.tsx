/* File Purpose:
 * It manages the panel which is displayed when Selectic is open.
 * Content of inner elements are related to dedicated files.
 */

import {Vue, Component, Prop, Watch, h} from 'vtyx';
import { unref } from 'vue';

import Store, { OptionId, OptionItem } from './Store';
import { ownerDocument, ownerWindow } from './tools';
import Filter from './Filter';
import List from './List';
import Icon from './Icon';
import PanelContent from './PanelContent';

/** Where the panel should be mounted: an element, a CSS selector, or
 * 'self' to keep it where the component renders it. */
export type PanelContainer = HTMLElement | string;

export interface Props {
    store: Store;
    width?: number;

    /** Where the panel should be mounted (default: the body of the
     * document the component belongs to) */
    container?: PanelContainer;

    /* positions of the main element related to current window */
    elementTop?: number;
    elementBottom?: number;
    elementLeft?: number;
    elementRight?: number;
}

/* Height (in px) of the panel header, added to the items height to
 * estimate the list height before it is rendered. */
const PANEL_HEADER_HEIGHT = 20;

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

    @Prop()
    private container?: PanelContainer;

    /* }}} */
    /* {{{ data */

    private topGroupName = ' ';
    private topGroupId: OptionId = null;
    private listHeight = 0;
    private listWidth = 200;
    private availableSpace = 0;
    /** The window the panel is displayed in. It is known only once the
     * panel is mounted, and the positions depend on it. */
    private panelWindow: Window | null = null;

    /* No observer */
    /** The element the keydown listener has been added on (the combobox
     * may not be found anymore when the component unmounts) */
    private _comboboxListenerEl?: HTMLElement | null;

    /* }}} */
    /* {{{ computed */

    /** check if the height of the box has been completely estimated. */
    get isFullyEstimated(): boolean {
        const listHeight = this.listHeight;
        const availableSpace = this.availableSpace;

        return listHeight !== 0 && listHeight < availableSpace;
    }

    /** Height the list is expected to take, used while it is not rendered
     * yet (and so cannot be measured). */
    get defaultListHeight(): number {
        const data = this.store.data;

        return data.itemHeight * data.itemsPerPage + PANEL_HEADER_HEIGHT;
    }

    /** The window the positions must be computed against (the global one
     * while the panel is not mounted yet) */
    get currentWindow(): Window {
        return this.panelWindow ?? window;
    }

    get bestPosition(): 'top' | 'bottom' {
        const windowHeight = this.currentWindow.innerHeight;
        const isFullyEstimated = this.isFullyEstimated;
        /* XXX: The max() is because if listHeight is greater than default,
         * it means that the value is more accurate than the default. */
        const listHeight = isFullyEstimated ? this.listHeight
            : Math.max(this.defaultListHeight, this.listHeight);
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
        const windowWidth = this.currentWindow.innerWidth;
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
        const availableSpace = this.currentWindow.innerHeight - elementBottom;
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
        /* The listeners are on the panel and on the combobox, so the keys
         * pressed elsewhere in the page (the list can be open while the
         * focus is outside, with the `open` prop) never come here. */
        if (evt.key === 'Tab' && this.handleTabKey(evt)) {
            return;
        }

        this.store.handleKeydown(evt);
    }

    /** The combobox this panel is attached to (it lives outside the panel,
     * which is moved into its container) */
    private get comboboxEl(): HTMLElement | null {
        return ownerDocument(this.$el).querySelector<HTMLElement>(
            `div[role="combobox"][aria-controls="${this.store.listBoxId}"]`
        );
    }

    /** The panel is moved into its container, so its buttons are not in
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

    /** The element the panel should be moved into, or null to keep it
     * where the component has rendered it (`'self'`).
     * It is a method and not a getter: it is resolved once, when the panel
     * is mounted (which happens each time the list opens), and it reports
     * an unusable selector. */
    private getContainerEl(): HTMLElement | null {
        const container = this.container;
        const doc = ownerDocument(this.$el);

        if (container === 'self') {
            return null;
        }

        if (typeof container === 'string') {
            const el = doc.querySelector<HTMLElement>(container);

            if (!el) {
                const labels = this.store.data.labels;

                this.store.state.status.errorMessage =
                    labels.unknownPropertyValue.replace(/%s/, 'container');

                return doc.body;
            }

            return el;
        }

        /* By default the body of the document the component belongs to
         * (which is not the global one in a detached window) */
        return container ?? doc.body;
    }

    private attachPanel() {
        const containerEl = this.getContainerEl();

        if (!containerEl || this.$el.parentNode === containerEl) {
            return;
        }

        containerEl.appendChild(this.$el);
    }

    /* }}} */
    /* {{{ Life cycles */

    public mounted() {
        this.panelWindow = ownerWindow(this.$el);
        this.attachPanel();

        /* The listeners are set on the panel and on the combobox instead
         * of the document: the panel can be displayed inside a modal (where
         * a global listener escapes the focus trap) or in another document
         * than the main one. */
        this.$el.addEventListener('keydown', this.onKeyDown);
        this._comboboxListenerEl = this.comboboxEl;
        this._comboboxListenerEl?.addEventListener('keydown', this.onKeyDown);

        this.computeListSize();
    }

    public unmounted() {
        this.$el.removeEventListener('keydown', this.onKeyDown);
        this._comboboxListenerEl?.removeEventListener('keydown', this.onKeyDown);
        this._comboboxListenerEl = null;

        /* force the element to be removed from DOM */
        if (this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
    }

    /* }}} */
    public render() {
        const store = this.store;
        const state = store.state;
        const isGroup = state.groups.size > 0 &&
            state.totalFilteredOptions > store.data.itemsPerPage;

        return (
            <div
                style={this.positionStyle}
                class={[
                    'selectic selectic__list-panel selectic__extended-list',
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
                <PanelContent store={store}>
                    {this.$slots.listFooter?.()}
                </PanelContent>
            </div>
        );
    }
}
