/* File Purpose:
 * It manages all controls which can filter the data.
 */

import {Vue, Component, Prop, Watch, h} from 'vtyx';
import { unref } from 'vue';

import Store from './Store';

export interface Props {
    store: Store;
}

@Component
export default class FilterPanel extends Vue<Props> {
    public $refs: {
        filterInput: HTMLInputElement;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ data */

    private closed: boolean = true;

    /* }}} */
    /* {{{ computed */

    get searchPlaceholder() {
        return this.store.data.labels.searchPlaceholder;
    }

    get selectionIsExcluded() {
        return this.store.state.selectionIsExcluded;
    }

    get disableSelectAll() {
        const store = this.store;
        const state = store.state;
        const isMultiple = state.multiple;
        const hasItems = state.filteredOptions.length === 0;
        const canNotSelect = !!state.searchText && !unref(store.hasAllItems);

        return !isMultiple || hasItems || canNotSelect;
    }

    get disableRevert() {
        const store = this.store;

        return !store.state.multiple || !unref(store.hasFetchedAllItems);
    }

    get enableRevert() {
        const state = this.store.state;

        return state.multiple && state.allowRevert !== false;
    }

    get onKeyPressed() {
        return this.keypressed.bind(this);
    }

   /* }}} */
    /* {{{ methods */

    private keypressed(evt: KeyboardEvent) {
        const key = evt.key;

        /* handle only printable characters */
        if (key.length === 1) {
            const el = this.$refs.filterInput;
            if (el === evt.target) {
                return;
            }

            this.closed = false;
            if (el) {
                el.value += key;
                this.store.commit('searchText', el.value);
            }
            this.getFocus();
        }
    }

    private onInput(evt: KeyboardEvent) {
        const el = evt.currentTarget as HTMLInputElement;
        this.store.commit('searchText', el.value);
    }

    private onSelectAll() {
        this.store.toggleSelectAll();
    }

    private onExclude() {
        this.store.commit('selectionIsExcluded', !this.selectionIsExcluded);
    }

    private togglePanel() {
        if (this.store.state.keepFilterOpen === true) {
            this.closed = false;
            return;
        }
        this.closed = !this.closed;
    }

    private getFocus() {
        const el = this.$refs.filterInput;
        if (!this.closed && el) {
            setTimeout(() => el.focus(), 0);
        }
    }

    /* }}} */
    /* {{{ watch */

    @Watch('closed')
    public onClosed() {
        this.getFocus();
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        const state = this.store.state;
        this.closed = !state.keepFilterOpen && !state.searchText;
        document.addEventListener('keypress', this.onKeyPressed);

        this.getFocus();
    }

    public unmounted() {
        document.removeEventListener('keypress', this.onKeyPressed);
    }

    /* }}} */

    public render() {
        const store = this.store;
        const state = store.state;
        const labels = store.data.labels;

        return (
            <div class="filter-panel">
                <div
                    class={{
                        panelclosed: this.closed,
                        panelopened: !this.closed,
                    }}
                >
                    <div class="filter-panel__input form-group has-feedback">
                        <input
                            type="text"
                            class="form-control filter-input"
                            placeholder={this.searchPlaceholder}
                            value={state.searchText}
                            on={{
                                'input.stop.prevent': this.onInput,
                            }}
                            ref="filterInput"
                        />
                        <span class="fa fa-search selectic-search-scope
                                     form-control-feedback"
                        ></span>
                    </div>
                    {state.multiple && (
                        <div class="toggle-selectic">
                            <label
                                class={['control-label', {
                                    'selectic__label-disabled': this.disableSelectAll,
                                }]}
                            >
                                <input
                                    type="checkbox"
                                    checked={state.status.areAllSelected}
                                    disabled={this.disableSelectAll}
                                    on={{
                                        change: this.onSelectAll,
                                    }}
                                />
                                {labels.selectAll}
                            </label>
                        </div>
                    )}
                    {this.enableRevert && (
                        <div
                            class={['toggle-selectic', {
                                'selectic__label-disabled': this.disableRevert,
                            }]}
                        >
                            <label class="control-label">
                                <input
                                    type="checkbox"
                                    checked={this.selectionIsExcluded}
                                    disabled={this.disableRevert}
                                    on={{
                                        change: this.onExclude,
                                    }}
                                />
                                {labels.excludeResult}
                            </label>
                        </div>
                    )}
                </div>

                {!state.keepFilterOpen && (
                <div class="curtain-handler"
                     on={{
                         'click.prevent.stop': this.togglePanel,
                     }}
                >
                    <span class="fa fa-search"></span>
                    <span class={{
                        'fa': true,
                        'fa-caret-down': this.closed,
                        'fa-caret-up': !this.closed,
                    }}></span>
                </div>
                )}
           </div>
        );
    }
}
