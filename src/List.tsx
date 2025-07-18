/* File Purpose:
 * It displays each item in an efficient way (optimizes DOM consumption).
 * It handles interactions with these items.
 */

import { Vue, Component, Prop, Watch, h } from 'vtyx';
import { unref } from 'vue';

import Store, {
    OptionItem,
    OptionId,
} from './Store';
import Icon from './Icon';
import { isDeepEqual } from './tools';

export interface Props {
    store: Store;
}

@Component
export default class List extends Vue<Props> {
    public $refs: {
        elList: HTMLDivElement;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ data */

    private itemHeight = 27;
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

    get itemsMargin(): number {
        /* XXX: I don't really know when we should use value or not... */
        return unref(this.store.marginSize);
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
                icon: 'current:spinner:spin',
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
        const idx = endIndex - this.store.data.itemsPerPage - 3 * this.itemsMargin;

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
        if (option.disabled) {
            return;
        }
        if (option.isGroup) {
            this.store.selectGroup(option.id, !option.selected);
            return;
        }

        this.store.selectItem(option.id);
    }

    private checkOffset() {
        const scrollTop = this.$refs.elList.scrollTop;
        const topIndex = Math.floor(scrollTop / this.itemHeight);
        const total = this.totalItems;
        const itemsPerPage = this.store.data.itemsPerPage;
        const bottomIndex = Math.min(topIndex + itemsPerPage, total);

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
    public onIndexChange() {
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
    public onOffsetChange() {
        this.checkOffset();
    }

    @Watch('filteredOptions', { deep: true })
    public onFilteredOptionsChange(oldVal: OptionItem[], newVal: OptionItem[]) {
        if (!isDeepEqual(oldVal, newVal)) {
            this.checkOffset();
        }
    }

    @Watch('groupId')
    public onGroupIdChange() {
        this.$emit('groupId', this.groupId);
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        this.checkOffset();
    }

    /* }}} */

    public render() {
        return (
            <div
                class="selectic__extended-list__list-container"
                on={{
                    scroll: this.checkOffset,
                }}
                ref="elList"
            >
                <ul
                    class="selectic__extended-list__list-items"
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
                            'selectable': unref(this.store.allowGroupSelection) && option.isGroup && !option.disabled,
                            'selectic-item__active': idx + this.startIndex === this.store.state.activeItemIdx,
                            'selectic-item__disabled': !!option.disabled,
                            'selectic-item__exclusive': !!option.exclusive,
                            'selectic-item__is-in-group': !!option.group,
                            'selectic-item__is-group': option.isGroup,
                        }]}
                        style={option.style}
                        title={option.title}
                        key={'selectic-item-' + (idx + this.startIndex)}
                    >
                    {this.isMultiple && (
                        <Icon icon="check" store={this.store} class="selectic-item_icon" />
                    )}
                    {!this.isMultiple && (
                        <Icon icon="dot" store={this.store} class="selectic-item_icon single-select_icon" />
                    )}
                    {option.icon && (
                        option.icon.includes(':')
                            ? <Icon icon={option.icon} store={this.store} />
                            : <Icon icon={`raw:${option.icon}`} store={this.store} />
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
            </div>
        );
    }
}
