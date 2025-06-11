import { Vue, h } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
}
export default class List extends Vue<Props> {
    $refs: {
        elList: HTMLDivElement;
    };
    private store;
    private itemHeight;
    private groupId;
    private doNotScroll;
    get filteredOptions(): OptionItem[];
    get isMultiple(): boolean;
    get itemsMargin(): number;
    get shortOptions(): OptionItem[];
    get totalItems(): number;
    get endIndex(): number;
    get startIndex(): number;
    get leftItems(): number;
    get topOffset(): number;
    get bottomOffset(): number;
    get formatItem(): import("./Store").FormatCallback;
    get debounce(): (callback: () => void) => void;
    get supportScrollIntoViewOptions(): boolean;
    private click;
    private checkOffset;
    private computeGroupId;
    private onMouseOver;
    onIndexChange(): void;
    onOffsetChange(): void;
    onFilteredOptionsChange(oldVal: OptionItem[], newVal: OptionItem[]): void;
    onGroupIdChange(): void;
    mounted(): void;
    render(): h.JSX.Element;
}
