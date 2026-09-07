import { Vue, h } from 'vtyx';
import Store from './Store';
export interface Props {
    store: Store;
}
export default class Footer extends Vue<Props> {
    private store;
    get hasNotAllItems(): boolean;
    /** In multilines mode the footer is rendered even when the component is
     * disabled: none of its actions must be reachable then. */
    get isDisabled(): boolean;
    get enableRevert(): boolean;
    get disabledPartialData(): boolean;
    get disableSelectAll(): boolean;
    get titleSelectAll(): string | undefined;
    get disableRevert(): boolean;
    /** True in multiple mode when at least one item is selected.
     *
     * In exclusion mode `internalValue` holds the *excluded* items, so it
     * cannot be counted this way; `canShowSelection` hides the actions
     * which would need it. */
    get hasSelection(): boolean;
    /** The "show selection" view needs a plain selection and every item
     * known: in dynamic mode the not-yet-fetched selected items would be
     * missing from a view whose hint counts them. */
    get canShowSelection(): boolean;
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
    /** Clear the whole selection. The deep-watcher in the store then
     * flips `showSelection` back off, restoring the normal buttons. */
    private onClearSelection;
    private onClearFilter;
    /** Closing the list is what validates the selection: the standard
     * closing circuit emits `change`. */
    private onApply;
    render(): h.JSX.Element;
}
