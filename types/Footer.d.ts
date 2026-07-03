import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
}
export default class Footer extends Vue<Props> {
    private store;
    get hasNotAllItems(): boolean;
    get enableRevert(): boolean;
    get disabledPartialData(): boolean;
    get disableSelectAll(): boolean;
    get titleSelectAll(): string | undefined;
    get disableRevert(): boolean;
    /** True in multiple mode when at least one item is currently selected. */
    get hasSelection(): boolean;
    private getConfig;
    private getLabelFor;
    private isActive;
    private getLabel;
    /** aria-pressed is only set when the label does not already announce
     * the state (a label describing the opposite action must not be
     * combined with a pressed state) */
    private togglePressed;
    private onSelectAll;
    private onInvertSelection;
    private onShowSelection;
    /** Clear the whole selection. In multiple mode `store.selectItem(null)`
     * empties `internalValue` (keeping disabled entries per the store's
     * existing rule); the deep-watcher in the store then auto-flips
     * `showSelection` back off, so the view returns to its initial state
     * with the normal set of left-side buttons restored. */
    private onClearSelection;
    render(): h.JSX.Element;
}
