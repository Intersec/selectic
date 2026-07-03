/* File Purpose:
 * It renders the footer bar displayed at the bottom of the extended
 * list, configured through `store.state.footer`.
 *
 * The left side hosts the store-driven links (selectAll,
 * invertSelection, showSelection), displayed by default in `multiple`
 * mode. They also emit a Vue event, so consumers can hook additional
 * behavior. The right side hosts the two opt-in buttons (clearFilter,
 * apply), which only emit theirs.
 */

import {Vue, Component, Emits, Prop, h} from 'vtyx';
import { unref } from 'vue';

import Store, { FooterButtonConfig } from './Store';

export interface Props {
    store: Store;
}

type LinkKey = 'selectAll' | 'invertSelection' | 'showSelection';
type ButtonKey = 'clearFilter' | 'apply';
type LinkLabel = 'footerSelectAll'
    | 'footerInvertSelection'
    | 'footerShowSelection';
type ButtonLabel = 'footerClearFilter' | 'footerApply';
type LabelKey = LinkLabel | ButtonLabel;

@Component
export default class Footer extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private store: Store;

    /* }}} */
    /* {{{ computed */

    get hasNotAllItems(): boolean {
        return !unref(this.store.hasAllItems);
    }

    /** In multilines mode the footer is rendered even when the component is
     * disabled: none of its actions must be reachable then. */
    get isDisabled(): boolean {
        return this.store.state.disabled;
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

        return this.isDisabled || !state.multiple || hasNoItems
            || canNotSelect || this.disabledPartialData;
    }

    get titleSelectAll(): string | undefined {
        if (this.disableSelectAll && this.disabledPartialData) {
            return this.store.data.labels.cannotSelectAllRevertItems;
        }
        return undefined;
    }

    get disableRevert(): boolean {
        return this.isDisabled || !this.store.state.multiple
            || !unref(this.store.hasFetchedAllItems);
    }

    /** True in multiple mode when at least one item is selected.
     *
     * In exclusion mode `internalValue` holds the *excluded* items, so it
     * cannot be counted this way; `canShowSelection` hides the actions
     * which would need it. */
    get hasSelection(): boolean {
        const state = this.store.state;
        if (!state.multiple || state.selectionIsExcluded) {
            return false;
        }
        const value = state.internalValue;
        return Array.isArray(value) && value.length > 0;
    }

    /** The "show selection" view needs a plain selection and every item
     * known: in dynamic mode the not-yet-fetched selected items would be
     * missing from a view whose hint counts them. */
    get canShowSelection(): boolean {
        return !this.store.state.selectionIsExcluded
            && unref(this.store.hasFetchedAllItems);
    }

    /* }}} */
    /* {{{ methods */

    private getConfig(key: LinkKey | ButtonKey): FooterButtonConfig | null {
        const state = this.store.state;
        const explicit = state.footer?.[key];

        /* an explicit entry wins, including `visible: false` */
        if (explicit) {
            return explicit.visible === false ? null : explicit;
        }

        /* Without an explicit entry, the left-side links are displayed
         * by default in `multiple` mode; the right-side buttons stay
         * opt-in. */
        const isLeftLink = key === 'selectAll'
            || key === 'invertSelection'
            || key === 'showSelection';

        if (state.multiple && isLeftLink) {
            return {};
        }

        return null;
    }

    private getLabelFor(
        key: LinkKey | ButtonKey,
        fallback: LabelKey,
        isActive: boolean,
    ): string {
        const config = this.getConfig(key);
        const labels = this.store.data.labels;

        if (isActive && config?.textActive) {
            return config.textActive;
        }
        if (config?.text) {
            return config.text;
        }
        if (isActive && key === 'selectAll') {
            return labels.footerUnselectAll;
        }
        if (isActive && key === 'showSelection') {
            return labels.footerShowAll;
        }
        return labels[fallback];
    }

    private isActive(key: LinkKey | ButtonKey): boolean {
        const state = this.store.state;
        switch (key) {
            case 'selectAll': return state.status.areAllSelected;
            case 'invertSelection': return state.selectionIsExcluded;
            case 'showSelection': return state.showSelection;
            default: return false;
        }
    }

    private getLabel(
        key: LinkKey | ButtonKey,
        fallback: LabelKey,
    ): string {
        return this.getLabelFor(key, fallback, this.isActive(key));
    }

    /** aria-pressed is only set when the label does not already announce
     * the state (a label describing the opposite action must not be
     * combined with a pressed state) */
    private togglePressed(
        key: LinkKey,
        fallback: LinkLabel,
        isActive: boolean,
    ): 'true' | 'false' | undefined {
        if (this.getLabelFor(key, fallback, true)
            !== this.getLabelFor(key, fallback, false))
        {
            return;
        }

        return isActive ? 'true' : 'false';
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

    private onShowSelection() {
        if (this.isDisabled) {
            return;
        }
        this.store.commit('showSelection', !this.store.state.showSelection);
        this.$emit('showSelection');
    }

    /** Clear the whole selection. The deep-watcher in the store then
     * flips `showSelection` back off, restoring the normal buttons. */
    private onClearSelection() {
        if (this.isDisabled) {
            return;
        }
        this.store.selectItem(null);
        this.$emit('clearSelection');
    }

    /* }}} */

    @Emits(['selectAll', 'invertSelection', 'showSelection', 'clearSelection', 'clearFilter', 'apply'])
    public render() {
        const state = this.store.state;
        const labels = this.store.data.labels;

        /* the view is already scoped to the selection: the only action
         * left on the left side is to reset it */
        const inShowSelectionView = state.multiple && state.showSelection
            && this.canShowSelection;

        const hasSelection = this.hasSelection;
        const areAllSelected = state.status.areAllSelected;

        const showSelectAll = state.multiple && !inShowSelectionView;
        const showInvert = this.enableRevert && !inShowSelectionView;
        /* It stays visible while the view is on, so that the user has a
         * way back: its label then toggles to "Show all". */
        const showShowSelection = state.multiple && this.canShowSelection
            && (inShowSelectionView || (hasSelection && !areAllSelected));

        const selectAllCfg = showSelectAll ? this.getConfig('selectAll') : null;
        const invertCfg = showInvert ? this.getConfig('invertSelection') : null;
        const showSelectionCfg = showShowSelection ? this.getConfig('showSelection') : null;
        const clearCfg = this.getConfig('clearFilter');
        const applyCfg = this.getConfig('apply');

        const selectAllDisabled = !!selectAllCfg?.disabled || this.disableSelectAll;
        const invertDisabled = !!invertCfg?.disabled || this.disableRevert;
        const showSelectionDisabled = !!showSelectionCfg?.disabled || this.isDisabled;

        return (
            <div class="selectic__extended-list__footer">
                <div class="selectic__footer-left">
                    {inShowSelectionView && (
                        <button
                            type="button"
                            class="selectic__footer-link"
                            disabled={this.isDisabled}
                            on={{
                                'click.stop.prevent': this.onClearSelection,
                            }}
                        >
                            {labels.footerClearSelection}
                        </button>
                    )}
                    {selectAllCfg && (
                        <button
                            type="button"
                            class={['selectic__footer-link', {
                                'selectic__footer-link--active': areAllSelected,
                            }]}
                            disabled={selectAllDisabled}
                            title={selectAllCfg.title ?? this.titleSelectAll}
                            aria-pressed={this.togglePressed('selectAll',
                                'footerSelectAll', areAllSelected)}
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
                            aria-pressed={this.togglePressed('invertSelection',
                                'footerInvertSelection', state.selectionIsExcluded)}
                            on={{
                                'click.stop.prevent': this.onInvertSelection,
                            }}
                        >
                            {this.getLabel('invertSelection', 'footerInvertSelection')}
                        </button>
                    )}
                </div>
                <div class="selectic__footer-center">
                    {showSelectionCfg && (
                        <button
                            type="button"
                            class="selectic__footer-link"
                            disabled={showSelectionDisabled}
                            title={showSelectionCfg.title}
                            aria-pressed={this.togglePressed('showSelection',
                                'footerShowSelection', state.showSelection)}
                            on={{
                                'click.stop.prevent': this.onShowSelection,
                            }}
                        >
                            {this.getLabel('showSelection', 'footerShowSelection')}
                        </button>
                    )}
                </div>
                <div class="selectic__footer-right">
                    {clearCfg && (
                        <button
                            type="button"
                            class="selectic__footer-btn selectic__footer-btn--secondary"
                            disabled={!!clearCfg.disabled || this.isDisabled}
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
                            disabled={!!applyCfg.disabled || this.isDisabled}
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
