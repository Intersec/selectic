/* File Purpose:
 * It manages the panel content when Selectic is in multilines mode.
 * Unlike ExtendedList, it renders inline without absolute positioning or
 * dropdown lifecycle (no body append, no click-outside listener).
 */

import { Vue, Component, Prop, h } from 'vtyx';

import Store from './Store';
import FilterSearch from './FilterSearch';
import List from './List';
import PanelContent from './PanelContent';

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
            <div class="selectic selectic__list-panel selectic__multilines-list">
                {!store.state.hideFilter && (
                    <FilterSearch store={store} scoped ref="filterSearch" />
                )}
                {/* without search input, the list itself takes the focus */}
                <List
                    store={store}
                    focusable={store.state.hideFilter}
                    ref="list"
                />
                <PanelContent store={store}>
                    {this.$slots.listFooter?.()}
                </PanelContent>
            </div>
        );
    }
}
