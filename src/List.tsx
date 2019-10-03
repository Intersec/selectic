/* File Purpose:
 * It displays each item in an efficient way (optimizes DOM consumption).
 * It handles interactions with these items.
 */

import {Vue, Component, Prop, Watch} from 'vtyx';

import Store, {
    OptionItem,
    OptionId,
} from './Store';

export interface Props {
    store: Store;

    options?: any[];
    nbItems?: number;
    multiple?: boolean;
}

@Component
export default class List extends Vue<Props> {
    public $refs: {
        elList: HTMLUListElement;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ data */

    private itemHeight = 27;
    private nbItems = 10;
    private groupId: OptionId = null;
    private doNotScroll = false;

    /* }}} */
    /* {{{ computed */

    get filteredOptions() {
        return this.store.state.filteredOptions;
    }

    get isMultiple() {
        return this.store.state.multiple;
    }

    get itemsMargin() {
        return this.store.marginSize;
    }

    get shortOptions(): OptionItem[] {
        const endIndex = this.endIndex;
        const startIndex = this.startIndex;
        const formatItem = this.formatItem.bind(this);

        const shortOptions = this.filteredOptions
                            .slice(startIndex, endIndex)
                            .map(formatItem);

        /* complete options with loading items */
        const missingItems = endIndex - startIndex - shortOptions.length;

        for (let idx = 0; idx < missingItems; idx++) {
            shortOptions.push({
                id: null,
                text: '',
                disabled: true,
                selected: false,
                icon: 'fa fa-spinner fa-spin',
                isGroup: false,
            });
        }

        return shortOptions;
    }

    get totalItems() {
        const total = this.store.state.totalFilteredOptions;
        return Number.isInteger(total) && total > 0 ? total : 0;
    }

    get endIndex() {
        return Math.min(
            this.store.state.offsetItem + this.itemsMargin,
            this.totalItems
        );
    }

    get startIndex() {
        const endIndex = this.endIndex;
        const idx = endIndex - this.nbItems - 3 * this.itemsMargin;

        return Math.max(0, idx);
    }

    get leftItems() {
        const totalItems = this.totalItems;
        const leftItems = totalItems - this.endIndex;

        return Math.max(0, leftItems);
    }

    get topOffset() {
        return this.startIndex * this.itemHeight;
    }

    get bottomOffset() {
        return this.leftItems * this.itemHeight;
    }

    get formatItem() {
        const formatOption = this.store.state.formatOption;

        if (formatOption) {
            return formatOption;
        }

        return (item: OptionItem) => item;
    }

    get debounce() {
        let callId = 0;

        return (callback: () => void) => {
            clearTimeout(callId);
            callId = self.setTimeout(callback, 50);
        };
    }

    /* To detect support of ScrollIntoViewOptions */
    get supportScrollIntoViewOptions() {
        return typeof document.documentElement.style.scrollBehavior !== 'undefined';
    }

    /* }}} */
    /* {{{ methods */

    private click(option: OptionItem) {
        if (option.disabled || option.isGroup) {
            return;
        }

        this.store.selectItem(option.id);
    }

    private checkOffset() {
        const scrollTop = this.$refs.elList.scrollTop;
        const topIndex = Math.floor(scrollTop / this.itemHeight);
        const total = this.totalItems;
        const bottomIndex = Math.min(topIndex + this.nbItems, total);

        this.debounce(() => this.store.commit('offsetItem', bottomIndex));
        this.computeGroupId(topIndex);
    }

    private computeGroupId(topIndex: number) {
        const item = this.store.state.filteredOptions[topIndex - 1];

        if (!item) {
            this.groupId = null;
        } else
        if (item.isGroup) {
            this.groupId = item.id;
        } else {
            this.groupId = typeof item.group !== 'undefined' ? item.group : null;
        }
    }

    private onMouseOver(idx: number) {
        if (!this.supportScrollIntoViewOptions) {
            this.doNotScroll = true;
        }

        this.store.commit('activeItemIdx', idx + this.startIndex);
    }

    /* }}} */
    /* {{{ watch */

    @Watch('store.state.activeItemIdx')
    protected onIndexChange() {
        if (this.doNotScroll) {
            this.doNotScroll = false;
            return;
        }

        this.$nextTick(() => {
            const el = this.$el.querySelector('.selectic-item__active');

            if (el) {
                let scrollIntoViewOptions: boolean | ScrollIntoViewOptions;

                if (this.supportScrollIntoViewOptions) {
                    scrollIntoViewOptions = {
                        block: 'nearest',
                        inline: 'nearest',
                    };
                } else {
                    /* fallback for Browsers which doesn't support smooth options
                     * `false` is equivalent to {
                     *     block: 'end',
                     *     inline: 'nearest',
                     * }
                     */
                    scrollIntoViewOptions = false;
                }
                el.scrollIntoView(scrollIntoViewOptions);
            }
        });
    }

    @Watch('store.state.offsetItem')
    protected onOffsetChange() {
        this.checkOffset();
    }

    @Watch('filteredOptions')
    protected onFilteredOptionsChange() {
        this.checkOffset();
    }

    @Watch('groupId')
    protected onGroupIdChange() {
        this.$emit('groupId', this.groupId);
    }

    /* }}} */
    /* {{{ Life cycle */

    protected mounted() {
        this.checkOffset();
    }

    /* }}} */

    protected render() {
        const h = this.renderWrapper();

        return (
            <ul
                on={{
                    scroll: this.checkOffset,
                }}
                ref="elList"
            >
              {!!this.topOffset && (
                <li
                    class="selectic-item"
                    style={`height:${this.topOffset}px;`}
                ></li>
              )}
              {this.shortOptions.map((option, idx) => (
                <li
                    on={{
                        'click.prevent.stop': () => this.click(option),
                        'mouseover': () => this.onMouseOver(idx),
                    }}
                    class={['selectic-item', option.className || '', {
                        'selected': option.selected,
                        'selectic-item__active': idx + this.startIndex === this.store.state.activeItemIdx,
                        'selectic-item__disabled': !!option.disabled,
                        'selectic-item__is-in-group': !!option.group,
                        'selectic-item__is-group': option.isGroup,
                    }]}
                    style={option.style}
                    title={option.title}
                    key={'selectic-item-' + (idx + this.startIndex)}
                >
                  {this.isMultiple && (
                    <span
                        class="fa fa-fw fa-check selectic-item_icon"
                    ></span>
                  )}
                  {option.icon && (
                    <span class={option.icon}></span>
                  )}
                    {option.text}
                </li>
              ))}
              {!!this.bottomOffset && (
                <li
                    class="selectic-item"
                    style={`height:${this.bottomOffset}px;`}
                ></li>
              )}
            </ul>
        );
    }
}
