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
    private nbItems;
    private groupId;
    private doNotScroll;
    readonly filteredOptions: OptionItem[];
    readonly isMultiple: boolean;
    readonly itemsMargin: number;
    readonly shortOptions: OptionItem[];
    readonly totalItems: number;
    readonly endIndex: number;
    readonly startIndex: number;
    readonly leftItems: number;
    readonly topOffset: number;
    readonly bottomOffset: number;
    readonly formatItem: import("./Store").FormatCallback;
    readonly debounce: (callback: () => void) => void;
    readonly supportScrollIntoViewOptions: boolean;
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
