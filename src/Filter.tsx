/* File Purpose:
 * It manages all controls which can filter the data.
 */

import {Vue, Component, Prop, h} from 'vtyx';

import Store from './Store';
import Icon from './Icon';

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
    /* {{{ computed */

    get searchPlaceholder(): string {
        return this.store.data.labels.searchPlaceholder;
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

    private getFocus() {
        const el = this.$refs.filterInput;
        if (el) {
            setTimeout(() => el.focus(), 0);
        }
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        document.addEventListener('keypress', this.onKeyPressed);
        this.getFocus();
    }

    public unmounted() {
        document.removeEventListener('keypress', this.onKeyPressed);
    }

    /* }}} */

    public render() {
        const state = this.store.state;

        return (
            <div class="filter-panel">
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
                    <Icon
                        icon="search"
                        store={this.store}
                        class="selectic-search-scope form-control-feedback"
                    />
                </div>
           </div>
        );
    }
}
