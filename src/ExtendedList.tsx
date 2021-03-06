/* File Purpose:
 * It manages the panel which is displayed when Selectic is open.
 * Content of inner elements are related to dedicated files.
 */

import {Vue, Component, Prop, Watch} from 'vtyx';

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
    private listHeight = 120;
    private listWidth = 200;

    /* }}} */
    /* {{{ computed */

    get searchingLabel() {
        return this.store.labels.searching;
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
                return store.labels.noResult;
            }
            return store.labels.noData;
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
        const listHeight = this.listHeight;
        const inputTop = this.elementTop;
        const inputBottom = this.elementBottom;

        if (inputBottom + listHeight <= windowHeight) {
            return 'bottom';
        }

        if (listHeight < inputTop) {
            return 'top';
        }

        /* There are not enough space neither at bottom nor at top */
        return (windowHeight - inputBottom) < inputTop ? 'top' : 'bottom';
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

            return `
                top: ${this.elementTop}px;
                ${horizontalStyle}
                width: ${this.width}px;
                ${transform}
            `;
        }

        return `
            top: ${this.elementBottom}px;
            ${horizontalStyle}
            width: ${this.width}px;
        `;
    }

    /* }}} */
    /* {{{ watch */

    @Watch('store.state.filteredOptions')
    protected onFilteredOptionsChange() {
        Vue.nextTick(this.computeListSize, this);
    }

    @Watch('store.state.hideFilter')
    protected onHideFilterChange() {
        Vue.nextTick(this.computeListSize, this);
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

    protected mounted() {
        document.body.appendChild(this.$el);
        document.body.addEventListener('keydown', this.onKeyDown);
        this.computeListSize();
    }

    protected destroyed() {
        document.body.removeEventListener('keydown', this.onKeyDown);

        /* force the element to be removed from DOM */
        if (this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
    }

    /* }}} */

    protected render() {
        const h = this.renderWrapper();
        const store = this.store;
        const state = store.state;

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
              {state.groups.size > 0 && state.totalFilteredOptions > store.itemsPerPage && (
                <span
                    class="selectic-item selectic-item--header selectic-item__is-group"
                >
                    {this.topGroup}
                </span>
              )}
                <List
                    store={store}
                    class="selectic__extended-list__list-items"
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
