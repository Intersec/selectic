/* File Purpose:
 * It manages the panel content when Selectic is in multilines mode.
 * Unlike ExtendedList, it renders inline without absolute positioning or
 * dropdown lifecycle (no body append, no click-outside listener).
 */

import { Vue, Component, Prop, h } from 'vtyx';

import Store from './Store';
import FilterSearch from './FilterSearch';
import Footer from './Footer';
import List from './List';
import Icon from './Icon';

export interface Props {
    store: Store;
}

@Component
export default class MultilinesList extends Vue<Props> {
    public $refs: {
        filterSearch?: FilterSearch;
        list?: List;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ computed */

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
         * filtered scope with the current selection count (the store's
         * watcher exits this view as soon as the selection empties, so
         * we're guaranteed to have items). */
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

    /* }}} */
    /* {{{ methods */

    private onKeyDown(evt: KeyboardEvent) {
        const target = evt.target as Node | null;

        /* the listener is on document (the component is always displayed):
         * only handle keys pressed inside the component */
        if (!target || !this.$el?.contains(target)) {
            return;
        }

        this.store.handleKeydown(evt);
    }

    /** Move the DOM focus to the search input (or to the list) */
    public focus() {
        if (!this.store.state.hideFilter) {
            this.$refs.filterSearch?.focus();
            return;
        }

        this.$refs.list?.focus();
    }

    /* }}} */
    /* {{{ Life cycles */

    public mounted() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    public unmounted() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    /* }}} */

    public render() {
        const store = this.store;

        return (
            <div class="selectic selectic__multilines-list">
                {!store.state.hideFilter && (
                    <FilterSearch store={store} scoped ref="filterSearch" />
                )}
                {/* without search input, the list itself takes the focus */}
                <List
                    store={store}
                    focusable={store.state.hideFilter}
                    ref="list"
                />
                {this.$slots.custom?.()}
                {this.infoMessage && (
                    <div class="selectic__message alert-info" role="status">
                        {this.infoMessage}
                    </div>
                )}
                {this.searching && (
                    <div class="selectic__message" role="status">
                        <Icon icon="spinner" store={store} spin />
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
                {this.$slots.listFooter?.()}
                {(store.state.footer || store.state.multiple) && (
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
