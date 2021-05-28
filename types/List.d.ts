import { Vue, h } from 'vtyx';
import Store, { OptionItem, OptionId } from './Store';
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
    get filteredOptions(): {
        selected: boolean;
        disabled: boolean;
        isGroup: boolean;
        id: OptionId;
        text: string;
        title?: string | undefined;
        group?: import("./Store").StrictOptionId | undefined;
        className?: string | undefined;
        style?: string | undefined;
        icon?: string | undefined;
        options?: {
            id: OptionId;
            text: string;
            title?: string | undefined;
            disabled?: boolean | undefined;
            group?: import("./Store").StrictOptionId | undefined;
            className?: string | undefined;
            style?: string | undefined;
            icon?: string | undefined;
            options?: any[] | undefined;
            data?: any;
        }[] | undefined;
        data?: any;
    }[];
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
    onFilteredOptionsChange(): void;
    onGroupIdChange(): void;
    mounted(): void;
    render(): h.JSX.Element;
}
