/* File Purpose:
 * It manages the panel which is displayed when Selectic is open.
 * Content of inner elements are related to dedicated files.
 */

import {Vue, Component, Prop, Watch, h} from 'vtyx';

import Store, { OptionId } from './Store';
import Filter from './Filter';
import List from './List';

export interface Props {
    store: Store;
    width: number;

    /* positions of the main element related to current window */
    elementTop: number;
    elementBottom: number;
    elementLeft: number;
    elementRight: number;
}

/* list estimation height
 * 30px × 10 + 20px (for panel header)
 */
const DEFAULT_LIST_HEIGHT = 320;

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

    private topGroup = ' ';
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

        if (store.state.filteredOptions.length === 0) {
            if (store.state.searchText) {
                return store.data.labels.noResult;
            }
            return store.data.labels.noData;
        }
        return '';
    }

    get onKeyDown() {
        return (evt: KeyboardEvent) => {
            const key = evt.key;

            if (key === 'Escape') {
                this.store.commit('isOpen', false);
            } else
            if (key === 'Enter') {
                const index = this.store.state.activeItemIdx;

                if (index !== -1) {
                    const item = this.store.state.filteredOptions[index];

                    if (!item.disabled && !item.isGroup) {
                        this.store.selectItem(item.id);
                    }
                }
                evt.stopPropagation();
                evt.preventDefault();
            } else
            if (key === 'ArrowUp') {
                const index = this.store.state.activeItemIdx;

                if (index > 0) {
                    this.store.commit('activeItemIdx', index - 1);
                }
                evt.stopPropagation();
                evt.preventDefault();
            } else
            if (key === 'ArrowDown') {
                const index = this.store.state.activeItemIdx;
                const max = this.store.state.totalFilteredOptions - 1;

                if (index < max) {
                    this.store.commit('activeItemIdx', index + 1);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        };
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
        let listPosition = this.store.state.listPosition;
        const horizontalStyle = this.horizontalStyle;

        if (listPosition === 'auto') {
            listPosition = this.bestPosition;
        }

        if (listPosition === 'top') {
            const transform = horizontalStyle.includes('transform')
                ? 'transform: translateX(-100%) translateY(-100%);'
                : 'transform: translateY(-100%);';
            this.availableSpace = this.elementTop;

            return `
                top: ${this.elementTop}px;
                ${horizontalStyle}
                width: ${this.width}px;
                ${transform};
                --availableSpace: ${this.availableSpace}px;
            `;
        }
        this.availableSpace = window.innerHeight - this.elementBottom;

        return `
            top: ${this.elementBottom}px;
            ${horizontalStyle}
            width: ${this.width}px;
            --availableSpace: ${this.availableSpace}px;
        `;
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

        this.topGroup = groupName;
    }

    private computeListSize() {
        const box = this.$el.getBoundingClientRect();

        this.listHeight = box.height;
        this.listWidth = box.width;
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

    public render() {
        const store = this.store;
        const state = store.state;
        const isGroup = state.groups.size > 0 &&
            state.totalFilteredOptions > store.data.itemsPerPage;

        return (
            <div
                style={this.positionStyle}
                class="selectic selectic__extended-list"
            >
              {!state.hideFilter && (
                <Filter
                    store={this.store}
                />
              )}

              {isGroup && (
                <span
                    class="selectic-item selectic-item--header selectic-item__is-group"
                >
                    {this.topGroup}
                </span>
              )}
                <List
                    store={store}
                    on={{
                        groupId: this.getGroup,
                    }}
                />
              {this.infoMessage && (
                <div class="selectic__message alert-info">
                    {this.infoMessage}
                </div>
              )}
              {this.searching && (
                <div class="selectic__message">
                    <span class="fa fa-spinner fa-spin"></span>
                    {this.searchingLabel}
                </div>
              )}
              {this.errorMessage && (
                <div
                    class="selectic__message alert-danger"
                    on={{ click: () => store.resetErrorMessage() }}
                >
                    {this.errorMessage}
                </div>
              )}
            </div>
        );
    }
}
