import { Vue, h } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    /** If true, the listbox itself can take the DOM focus (used in
     * multilines mode when there is no search input) */
    focusable?: boolean;
}
export default class List extends Vue<Props> {
    $refs: {
        elList: HTMLDivElement;
        listItems: HTMLUListElement;
    };
    private store;
    private focusable;
    private groupId;
    private doNotScroll;
    get itemHeight(): number;
    get filteredOptions(): OptionItem[];
    get isMultiple(): boolean;
    get isDisabled(): boolean;
    get itemsMargin(): number;
    get shortOptions(): OptionItem[];
    get totalItems(): number;
    get endIndex(): number;
    get startIndex(): number;
    get leftItems(): number;
    get topOffset(): number;
    get bottomOffset(): number;
    get formatItem(): import("./Store").FormatCallback;
    get activeDescendant(): string | undefined;
    get debounce(): (callback: () => void) => void;
    get supportScrollIntoViewOptions(): boolean;
    private click;
    private checkOffset;
    private computeGroupId;
    private onMouseOver;
    /** Move the DOM focus to the listbox (when it is focusable) */
    focus(): void;
    onIndexChange(): void;
    onOffsetChange(): void;
    onFilteredOptionsChange(oldVal: OptionItem[], newVal: OptionItem[]): void;
    onGroupIdChange(): void;
    mounted(): void;
    render(): h.JSX.Element;
}
