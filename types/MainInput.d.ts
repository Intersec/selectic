import { Vue, h } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    id?: string;
}
export default class MainInput extends Vue<Props> {
    $refs: {
        selectedItems?: HTMLDivElement;
        comboboxEl?: HTMLDivElement;
    };
    private store;
    private id;
    private nbHiddenItems;
    /** ids of the external <label> elements naming the combobox */
    private ariaLabelledby;
    private domObserver;
    private doNotOpenOnFocus;
    private hasTriedToUnfold;
    private wasOpenAtMousedown;
    get isDisabled(): boolean;
    get hasValue(): boolean;
    get disabledList(): OptionItem[];
    get displayPlaceholder(): boolean;
    get canBeCleared(): boolean;
    get showClearAll(): boolean;
    get clearedLabel(): string;
    get singleSelectedItem(): undefined | OptionItem;
    get singleSelectedItemText(): string;
    get singleSelectedItemTitle(): string;
    get singleStyle(): string | undefined;
    get selecticId(): string | undefined;
    get listBoxId(): string;
    get activeDescendant(): string | undefined;
    /** Text announced (live region) when navigating through chips */
    get chipsAnnouncement(): string;
    get isSelectionReversed(): boolean;
    get reverseSelectionLabel(): string;
    get formatItem(): import("./Store").FormatCallback;
    get selectedOptions(): OptionItem | OptionItem[] | null;
    get showSelectedOptions(): OptionItem[];
    get moreSelectedNb(): string;
    get moreSelectedTitle(): string;
    private onMousedown;
    private toggleFocus;
    /** Move the DOM focus on the combobox element.
     * With doNotOpen, getting the focus does not open the list. */
    focusCombobox(doNotOpen?: boolean): void;
    /** When the list is closed, no other listener handles keys (the one of
     * ExtendedList only exists while the panel is mounted). Without this,
     * the combobox could not be reopened with the keyboard after Escape. */
    private onComboboxKeydown;
    private onComboboxFocus;
    private onComboboxBlur;
    private removeItemLabel;
    /** Retrieve the <label> elements associated to the hidden input, so
     * the combobox gets the same accessible name. */
    private findAriaLabels;
    private selectItem;
    private clearSelection;
    private computeSize;
    private closeObserver;
    private createObserver;
    onInternalChange(): void;
    /** All the chips are rendered while navigating through them, but the
     * input stays on a single line: keep the active one visible. */
    onActiveChipChange(): void;
    mounted(): void;
    updated(): void;
    beforeUnmount(): void;
    render(): h.JSX.Element;
}
