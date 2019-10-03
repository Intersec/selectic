/* File Purpose:
 * It displays the core element which is always visible (where selection is
 * displayed) and handles all interaction with it.
 */

import {Vue, Component, Prop} from 'vtyx';
import Store, {OptionId, OptionItem} from './Store';

export interface Props {
    store: Store;

    /* id of the element */
    id?: string;
}

@Component
export default class Selectic extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop({default: ''})
    private id: string;

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

    get clearedLabel() {
        const isMultiple = this.store.state.multiple;
        const labelKey = isMultiple ? 'clearSelections' : 'clearSelection';

        return this.store.labels[labelKey];
    }

    get singleSelectedItem() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const selected = this.selectedOptions;

        return !isMultiple && !!selected && (selected as OptionItem).text;
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

        return this.store.labels[labelKey];
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

    /* }}} */

    protected render() {
        const h = this.renderWrapper();

        return (
        <div
            class="has-feedback"
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
                <div
                    class="selectic-input__selected-items"
                    style={this.singleStyle}
                >
                    {this.isSelectionReversed && (
                        <span
                            class="fa fa-strikethrough selectic-input__reverse-icon"
                            title={this.reverseSelectionLabel}
                        />
                    )}
                    {this.displayPlaceholder && (
                        <span class="selectic-input__selected-items__placeholder">
                            {this.store.state.placeholder}
                        </span>
                    )}
                    {this.singleSelectedItem}
                    {this.store.state.multiple && (this.selectedOptions as OptionItem[]).map(
                        (item) => (
                            <div
                                class="single-value"
                                style={item.style}
                                title={item.text}
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
                                    <span
                                        class="fa fa-times selectic-input__selected-items__icon"
                                        on={{
                                            'click.prevent.stop': () => this.selectItem(item.id),
                                        }}
                                    ></span>
                                )}
                            </div>
                        )
                    )}
                </div>
                {this.canBeCleared && (
                    <span
                        class="fa fa-times selectic-input__clear-icon"
                        title={this.clearedLabel}
                        on={{ 'click.prevent.stop': this.clearSelection }}
                    ></span>
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
                <span
                    class="fa fa-caret-down selectic-icon"
                ></span>
            </div>
        </div>
        );
    }
}
