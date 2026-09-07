/* File Purpose:
 * It renders what the dropdown panel (ExtendedList) and the inline panel
 * (MultilinesList) display under their options list: the `listFooter`
 * slot, the status messages, then the footer bar.
 *
 * Both modes must stay visually identical, so this content — and the
 * `selectic__list-panel` class its hosts share — is defined once.
 */

import { Vue, Component, Prop, h } from 'vtyx';

import Store from './Store';
import Footer from './Footer';
import Icon from './Icon';

export interface Props {
    store: Store;
}

@Component
export default class PanelContent extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ computed */

    get searchingLabel(): string {
        return this.store.data.labels.searching;
    }

    get searching(): boolean {
        return this.store.state.status.searching;
    }

    get errorMessage(): string {
        return this.store.state.status.errorMessage;
    }

    get infoMessage(): string {
        if (this.searching) {
            return '';
        }

        const store = this.store;
        const state = store.state;
        const labels = store.data.labels;

        /* "Show selection" view: surface a persistent hint about the
         * filtered scope with the current selection count. The store's
         * watcher exits this view as soon as the selection empties, so
         * there is always at least one selected item here. */
        if (store.isShowingSelection) {
            const count = Array.isArray(state.internalValue)
                ? state.internalValue.length
                : 0;

            return labels.showingSelection.replace(/%d/, String(count));
        }

        if (state.filteredOptions.length === 0) {
            return state.searchText ? labels.noResult : labels.noData;
        }

        return '';
    }

    get hasFooter(): boolean {
        const state = this.store.state;

        return !!state.footer || state.multiple;
    }

    /* }}} */

    /* Returns several nodes (a Vue 3 fragment): the return type cannot be
     * `VNode` here, and the project does not configure
     * `jsxFragmentFactory` to allow `<>...</>`. */
    public render(): any {
        const store = this.store;

        return [
            this.$slots.default?.(),
            this.infoMessage && (
                <div class="selectic__message alert-info" role="status">
                    {this.infoMessage}
                </div>
            ),
            this.searching && (
                <div class="selectic__message" role="status">
                    <Icon icon="spinner" store={store} spin />
                    {this.searchingLabel}
                </div>
            ),
            this.errorMessage && (
                <div
                    class="selectic__message alert-danger"
                    role="alert"
                    on={{ click: () => store.resetErrorMessage() }}
                >
                    {this.errorMessage}
                </div>
            ),
            this.hasFooter && (
                <Footer store={store} />
            ),
        ];
    }
}
