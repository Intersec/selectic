import { Vue } from 'vtyx';
import Store, { OptionItem } from './Store';
export interface Props {
    store: Store;
    options?: any[];
    nbItems?: number;
    multiple?: boolean;
}
export default class List extends Vue<Props> {
    $refs: {
        elList: HTMLUListElement;
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
    protected onIndexChange(): void;
    protected onOffsetChange(): void;
    protected onFilteredOptionsChange(): void;
    protected onGroupIdChange(): void;
    protected mounted(): void;
    protected render(): JSX.Element;
}
