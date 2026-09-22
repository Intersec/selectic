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
        /* on the component itself: the keys pressed in its focused element
         * (search input, or list when there is no search) bubble up to it.
         * The list is always displayed, so a listener on the document would
         * catch the keys of the whole page (and of the whole page only, in a
         * detached window). */
        this.$el.addEventListener('keydown', this.onKeyDown);
    }

    public unmounted() {
        this.$el.removeEventListener('keydown', this.onKeyDown);
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
