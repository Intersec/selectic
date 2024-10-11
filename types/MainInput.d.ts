import { Vue, h } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    id?: string;
}
export default class MainInput extends Vue<Props> {
    $refs: {
        selectedItems?: HTMLDivElement;
    };
    private store;
    private id;
    private nbHiddenItems;
    private domObserver;
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
    get isSelectionReversed(): boolean;
    get reverseSelectionLabel(): string;
    get formatItem(): import("./Store").FormatCallback;
    get selectedOptions(): OptionItem | OptionItem[] | null;
    get showSelectedOptions(): OptionItem[];
    get moreSelectedNb(): string;
    get moreSelectedTitle(): string;
    private toggleFocus;
    private selectItem;
    private clearSelection;
    private computeSize;
    private closeObserver;
    private createObserver;
    onInternalChange(): void;
    updated(): void;
    beforeUnmount(): void;
    render(): h.JSX.Element;
}
