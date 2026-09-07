/* File Purpose:
 * It renders the search input of the list panel: the text field, and the
 * button which empties it. It is used directly by MultilinesList, and
 * through Filter by the dropdown panel.
 */

import {Vue, Component, Prop, h} from 'vtyx';

import Store from './Store';
import Icon from './Icon';

export interface Props {
    store: Store;

    /** If true, only handle keys pressed inside the parent component
     * (for always-displayed contexts like the multilines mode) */
    scoped?: boolean;
}

/** Elements from which typed keys must not be stolen */
const INTERACTIVE_TAGS = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];

@Component
export default class FilterSearch extends Vue<Props> {
    public $refs: {
        filterInput: HTMLInputElement;
    };

    /* {{{ props */

    @Prop()
    private store: Store;

    @Prop({default: false})
    private scoped: boolean;

    /* }}} */
    /* {{{ computed */

    get searchPlaceholder(): string {
        return this.store.data.labels.searchPlaceholder;
    }

    get clearSearchLabel(): string {
        return this.store.data.labels.clearSearch;
    }

    /** The clear action is only offered when there is something to clear */
    get hasSearch(): boolean {
        return !!this.store.state.searchText;
    }

    get listBoxId(): string {
        return this.store.listBoxId;
    }

    get activeDescendant(): string | undefined {
        const state = this.store.state;

        if (state.activeItemIdx < 0) {
            return;
        }

        return this.store.optionId(state.activeItemIdx);
    }

    get onKeyPressed() {
        return this.keypressed.bind(this);
    }

    /* }}} */
    /* {{{ methods */

    private keypressed(evt: KeyboardEvent) {
        const key = evt.key;

        /* handle only printable characters */
        if (key.length !== 1 || this.store.state.disabled) {
            return;
        }

        const el = this.$refs.filterInput;
        const target = evt.target as HTMLElement | null;

        if (el === evt.target) {
            return;
        }

        /* do not steal keys typed in other interactive elements (like the
         * footer buttons, activated with Space) */
        if (target && (INTERACTIVE_TAGS.includes(target.tagName)
            || target.isContentEditable))
        {
            return;
        }

        /* in multilines mode the component is always displayed: only
         * handle keys pressed inside it */
        if (this.scoped) {
            const rootEl = this.$el?.parentElement;

            if (!rootEl || !target || !rootEl.contains(target)) {
                return;
            }
        }

        if (el) {
            el.value += key;
            this.store.commit('searchText', el.value);
        }
        this.focus();
    }

    private clearSearch() {
        this.store.commit('searchText', '');
        this.focus();
    }

    private onInput(evt: Event) {
        const el = evt.currentTarget as HTMLInputElement;
        this.store.commit('searchText', el.value);
    }

    public focus() {
        setTimeout(() => this.$refs.filterInput?.focus(), 0);
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        document.addEventListener('keypress', this.onKeyPressed);
    }

    public unmounted() {
        document.removeEventListener('keypress', this.onKeyPressed);
    }

    /* }}} */

    public render() {
        const store = this.store;
        const state = store.state;

        return (
            <div class="filter-panel__input form-group has-feedback">
                <input
                    type="text"
                    class="form-control filter-input"
                    placeholder={this.searchPlaceholder}
                    aria-label={this.searchPlaceholder}
                    role="combobox"
                    aria-expanded="true"
                    aria-autocomplete="list"
                    aria-controls={this.listBoxId}
                    aria-activedescendant={this.activeDescendant}
                    value={state.searchText}
                    disabled={state.disabled}
                    on={{
                        'input.stop.prevent': this.onInput,
                    }}
                    ref="filterInput"
                />
                {this.hasSearch ? (
                    <button
                        type="button"
                        class="selectic-search-clear form-control-feedback"
                        title={this.clearSearchLabel}
                        aria-label={this.clearSearchLabel}
                        disabled={state.disabled}
                        on={{
                            'click.stop.prevent': this.clearSearch,
                        }}
                    >
                        <Icon icon="times" store={store} />
                    </button>
                ) : (
                    <Icon
                        icon="search"
                        store={store}
                        class="selectic-search-scope form-control-feedback"
                    />
                )}
            </div>
        );
    }
}
