import { Vue } from 'vtyx';
export declare type StrictOptionId = string | number;
export declare type OptionId = StrictOptionId | null;
export declare type SelectedValue = OptionId | StrictOptionId[];
export interface OptionValue {
    id: OptionId;
    text: string;
    title?: string;
    disabled?: boolean;
    group?: StrictOptionId;
    className?: string;
    style?: string;
    icon?: string;
    options?: OptionValue[];
    data?: any;
}
export interface OptionItem extends OptionValue {
    selected: boolean;
    disabled: boolean;
    isGroup: boolean;
}
export declare type OptionProp = OptionValue | string;
export interface GroupValue {
    id: StrictOptionId;
    text: string;
}
export declare type FetchCallback = (_search: string, _offsetItem: number, _pageSize: number) => Promise<{
    total: number;
    result: OptionValue[];
}>;
export declare type GetCallback = (_ids: OptionId[]) => Promise<OptionValue[]>;
export declare type FormatCallback = (_option: OptionItem) => OptionItem;
export declare type SelectionOverflow = 'collapsed' | 'multiline';
export interface SelecticStoreStateParams {
    multiple?: boolean;
    placeholder?: string;
    hideFilter?: boolean | 'auto';
    allowRevert?: boolean;
    allowClearSelection?: boolean;
    pageSize?: number;
    autoSelect?: boolean;
    autoDisabled?: boolean;
    strictValue?: boolean;
    selectionOverflow?: SelectionOverflow;
    formatOption?: FormatCallback;
    formatSelection?: FormatCallback;
}
export interface Props {
    value?: SelectedValue;
    selectionIsExcluded?: boolean;
    disabled?: boolean;
    options?: OptionProp[];
    groups?: GroupValue[];
    texts?: PartialMessages;
    params?: SelecticStoreStateParams;
    fetchCallback?: FetchCallback;
    getItemsCallback?: GetCallback;
}
export interface SelecticStoreState {
    internalValue: SelectedValue;
    selectionIsExcluded: boolean;
    multiple: boolean;
    disabled: boolean;
    placeholder: string;
    hideFilter: boolean;
    allowRevert?: boolean;
    allowClearSelection: boolean;
    autoSelect: boolean;
    autoDisabled: boolean;
    strictValue: boolean;
    selectionOverflow: SelectionOverflow;
    isOpen: boolean;
    searchText: string;
    allOptions: OptionValue[];
    filteredOptions: OptionItem[];
    selectedOptions: OptionItem | OptionItem[] | null;
    totalAllOptions: number;
    totalFilteredOptions: number;
    groups: Map<OptionId, string>;
    offsetItem: number;
    activeItemIdx: number;
    pageSize: number;
    formatOption?: FormatCallback;
    formatSelection?: FormatCallback;
    status: {
        searching: boolean;
        errorMessage: string;
        areAllSelected: boolean;
        hasChanged: boolean;
    };
}
interface Messages {
    noFetchMethod: string;
    searchPlaceholder: string;
    searching: string;
    cannotSelectAllSearchedItems: string;
    selectAll: string;
    excludeResult: string;
    reverseSelection: string;
    noData: string;
    noResult: string;
    clearSelection: string;
    clearSelections: string;
    wrongFormattedData: string;
    moreSelectedItem: string;
    moreSelectedItems: string;
}
export declare type PartialMessages = {
    [K in keyof Messages]?: Messages[K];
};
export declare function changeTexts(texts: PartialMessages): void;
export default class SelecticStore extends Vue<Props> {
    value?: SelectedValue;
    selectionIsExcluded: boolean;
    disabled: boolean;
    options?: OptionProp[];
    groups: GroupValue[];
    texts?: PartialMessages;
    private params?;
    private fetchCallback?;
    private getItemsCallback?;
    itemsPerPage: number;
    get marginSize(): number;
    state: SelecticStoreState;
    labels: Messages;
    private doNotUpdate;
    private cacheItem;
    private requestId;
    get isPartial(): boolean;
    get hasAllItems(): boolean;
    get hasFetchedAllItems(): boolean;
    get closeSelectic(): () => void;
    commit<N extends keyof SelecticStoreState, V extends SelecticStoreState[N]>(name: N, value: V): void;
    getItem(id: OptionId): OptionValue;
    getItems(ids: OptionId[]): Promise<OptionItem[]>;
    selectItem(id: OptionId, selected?: boolean, keepOpen?: boolean): void;
    toggleSelectAll(): void;
    resetChange(): void;
    resetErrorMessage(): void;
    clearCache(forceReset?: boolean): void;
    changeGroups(groups: GroupValue[]): void;
    changeTexts(texts: PartialMessages): void;
    private hasValue;
    private assertCorrectValue;
    private updateFilteredOptions;
    private addGroups;
    private buildAllOptions;
    private buildFilteredOptions;
    private buildSelectedOptions;
    private buildSelectedItems;
    private hasItemInStore;
    private buildItems;
    private buildGroupItems;
    private nbGroups;
    private checkAutoSelect;
    private checkAutoDisabled;
    private checkHideFilter;
    protected onOptionsChange(): void;
    protected onValueChange(): void;
    protected onSelectionExcludedChange(): void;
    protected onDisabledChange(): void;
    protected onFilteredChange(): void;
    protected onInternalValueChange(): void;
    protected onAllOptionChange(): void;
    protected onTotalAllOptionsChange(): void;
    protected created(): void;
}
export {};
