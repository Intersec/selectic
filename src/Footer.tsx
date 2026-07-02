/* File Purpose:
 * It renders the footer bar displayed at the bottom of the extended list.
 * Up to four semantic buttons (selectAll, invertSelection, clearFilter,
 * apply) can be configured through `store.state.footer`.
 *
 * The two left-side actions carry built-in behavior — clicking Select all
 * toggles the store's select-all state, clicking Invert selection flips
 * `selectionIsExcluded`. Both are auto-hidden when the current store mode
 * cannot support them (mirroring the previous Filter-panel checkboxes) and
 * auto-disabled under the same conditions.
 *
 * Every click also emits a Vue event so consumers can hook additional
 * behavior. The right-side actions (Clear filter, Apply) have no built-in
 * behavior; they simply emit their event.
 */

import {Vue, Component, Emits, Prop, h} from 'vtyx';
import { unref } from 'vue';

import Store, { FooterButtonConfig } from './Store';

export interface Props {
    store: Store;
}

type LinkKey = 'selectAll' | 'invertSelection';
type ButtonKey = 'clearFilter' | 'apply';

@Component
export default class Footer extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ computed */

    /* Mirror the visibility/disabled logic that used to live in Filter.tsx
     * for the Select all + Invert selection checkboxes. */

    get hasNotAllItems(): boolean {
        return !unref(this.store.hasAllItems);
    }

    get enableRevert(): boolean {
        const state = this.store.state;
        return state.multiple && state.allowRevert !== false;
    }

    get disabledPartialData(): boolean {
        const state = this.store.state;
        const autoDisplay = state.forceSelectAll === 'auto';
        return this.hasNotAllItems && !this.enableRevert && autoDisplay;
    }

    get disableSelectAll(): boolean {
        const state = this.store.state;
        const hasNoItems = state.filteredOptions.length === 0;
        const canNotSelect = this.hasNotAllItems && !!state.searchText;

        return !state.multiple || hasNoItems || canNotSelect || this.disabledPartialData;
    }

    get titleSelectAll(): string {
        if (this.disableSelectAll && this.disabledPartialData) {
            return this.store.data.labels.cannotSelectAllRevertItems;
        }
        return '';
    }

    get disableRevert(): boolean {
        return !this.store.state.multiple || !unref(this.store.hasFetchedAllItems);
    }

    /* }}} */
    /* {{{ methods */

    private getConfig(key: LinkKey | ButtonKey): FooterButtonConfig | null {
        const state = this.store.state;
        const footer = state.footer;

        /* Multiple-mode default: auto-enable the two left links even when no
         * explicit `params.footer` is provided. */
        if (!footer) {
            if (state.multiple && (key === 'selectAll' || key === 'invertSelection')) {
                return {};
            }
            return null;
        }

        const config = footer[key];

        if (!config || config.visible === false) {
            return null;
        }

        return config;
    }

    private getLabel(
        key: LinkKey | ButtonKey,
        fallback: 'footerSelectAll' | 'footerInvertSelection' | 'footerClearFilter' | 'footerApply',
    ): string {
        const config = this.getConfig(key);
        const state = this.store.state;
        const labels = this.store.data.labels;

        const isActive =
            (key === 'selectAll' && state.status.areAllSelected) ||
            (key === 'invertSelection' && state.selectionIsExcluded);

        if (isActive && config?.textActive) {
            return config.textActive;
        }
        if (config?.text) {
            return config.text;
        }
        if (isActive && key === 'selectAll') {
            return labels.footerUnselectAll;
        }
        return labels[fallback];
    }

    private onSelectAll() {
        if (this.disableSelectAll) {
            return;
        }
        this.store.toggleSelectAll();
        this.$emit('selectAll');
    }

    private onInvertSelection() {
        if (this.disableRevert) {
            return;
        }
        this.store.commit('selectionIsExcluded', !this.store.state.selectionIsExcluded);
        this.$emit('invertSelection');
    }

    /* }}} */

    @Emits(['selectAll', 'invertSelection', 'clearFilter', 'apply'])
    public render() {
        const state = this.store.state;
        /* Auto-hide left-side actions when the current mode fundamentally
         * doesn't support them — matches the previous Filter behavior. */
        const showSelectAll = state.multiple;
        const showInvert = this.enableRevert;

        const selectAllCfg = showSelectAll ? this.getConfig('selectAll') : null;
        const invertCfg = showInvert ? this.getConfig('invertSelection') : null;
        const clearCfg = this.getConfig('clearFilter');
        const applyCfg = this.getConfig('apply');

        const selectAllDisabled = !!selectAllCfg?.disabled || this.disableSelectAll;
        const invertDisabled = !!invertCfg?.disabled || this.disableRevert;

        return (
            <div class="selectic__extended-list__footer">
                <div class="selectic__footer-left">
                    {selectAllCfg && (
                        <button
                            type="button"
                            class={['selectic__footer-link', {
                                'selectic__footer-link--active': state.status.areAllSelected,
                            }]}
                            disabled={selectAllDisabled}
                            title={selectAllCfg.title ?? this.titleSelectAll}
                            on={{
                                'click.stop.prevent': this.onSelectAll,
                            }}
                        >
                            {this.getLabel('selectAll', 'footerSelectAll')}
                        </button>
                    )}
                    {invertCfg && (
                        <button
                            type="button"
                            class={['selectic__footer-link', {
                                'selectic__footer-link--active': state.selectionIsExcluded,
                            }]}
                            disabled={invertDisabled}
                            title={invertCfg.title}
                            on={{
                                'click.stop.prevent': this.onInvertSelection,
                            }}
                        >
                            {this.getLabel('invertSelection', 'footerInvertSelection')}
                        </button>
                    )}
                </div>
                <div class="selectic__footer-right">
                    {clearCfg && (
                        <button
                            type="button"
                            class="selectic__footer-btn selectic__footer-btn--secondary"
                            disabled={!!clearCfg.disabled}
                            title={clearCfg.title}
                            on={{
                                'click.stop.prevent': () => this.$emit('clearFilter'),
                            }}
                        >
                            {this.getLabel('clearFilter', 'footerClearFilter')}
                        </button>
                    )}
                    {applyCfg && (
                        <button
                            type="button"
                            class="selectic__footer-btn selectic__footer-btn--primary"
                            disabled={!!applyCfg.disabled}
                            title={applyCfg.title}
                            on={{
                                'click.stop.prevent': () => this.$emit('apply'),
                            }}
                        >
                            {this.getLabel('apply', 'footerApply')}
                        </button>
                    )}
                </div>
            </div>
        );
    }
}
