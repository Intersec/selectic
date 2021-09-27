import { ComputedRef } from 'vue';
declare type MandateProps<T extends {}> = {
    [TK in keyof T]-?: T[TK];
};
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
declare type OptionBehaviorOperation = 'sort' | 'force';
declare type OptionBehaviorOrder = 'O' | 'D' | 'E';
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
export declare type ListPosition = 'bottom' | 'top' | 'auto';
export declare type HideFilter = boolean | 'auto' | 'open';
export interface SelecticStoreStateParams {
    multiple?: boolean;
    placeholder?: string;
    hideFilter?: HideFilter;
    allowRevert?: boolean;
    allowClearSelection?: boolean;
    pageSize?: number;
    autoSelect?: boolean;
    autoDisabled?: boolean;
    strictValue?: boolean;
    selectionOverflow?: SelectionOverflow;
    formatOption?: FormatCallback;
    formatSelection?: FormatCallback;
    optionBehavior?: string;
    listPosition?: ListPosition;
    isOpen?: boolean;
}
export interface Props {
    value?: SelectedValue | null;
    selectionIsExcluded?: boolean;
    disabled?: boolean;
    options?: OptionProp[] | null;
    childOptions?: OptionValue[];
    groups?: GroupValue[];
    texts?: PartialMessages | null;
    keepOpenWithOtherSelectic?: boolean;
    params?: SelecticStoreStateParams;
    fetchCallback?: FetchCallback | null;
    getItemsCallback?: GetCallback | null;
}
declare type InternalProps = MandateProps<Props>;
export interface Data {
    itemsPerPage: number;
    labels: Messages;
    doNotUpdate: boolean;
    cacheItem: Map<OptionId, OptionValue>;
    activeOrder: OptionBehaviorOrder;
    dynOffset: number;
}
export interface SelecticStoreState {
    internalValue: SelectedValue;
    selectionIsExcluded: boolean;
    multiple: boolean;
    disabled: boolean;
    placeholder: string;
    hideFilter: boolean;
    keepFilterOpen: boolean;
    allowRevert?: boolean;
    allowClearSelection: boolean;
    autoSelect: boolean;
    autoDisabled: boolean;
    strictValue: boolean;
    selectionOverflow: SelectionOverflow;
    isOpen: boolean;
    searchText: string;
    allOptions: OptionValue[];
    dynOptions: OptionValue[];
    filteredOptions: OptionItem[];
    selectedOptions: OptionItem | OptionItem[] | null;
    totalAllOptions: number;
    totalDynOptions: number;
    totalFilteredOptions: number;
    groups: Map<OptionId, string>;
    offsetItem: number;
    activeItemIdx: number;
    pageSize: number;
    formatOption?: FormatCallback;
    formatSelection?: FormatCallback;
    optionBehaviorOperation: OptionBehaviorOperation;
    optionBehaviorOrder: OptionBehaviorOrder[];
    listPosition: ListPosition;
    status: {
        searching: boolean;
        errorMessage: string;
        areAllSelected: boolean;
        hasChanged: boolean;
        automaticChange: boolean;
        automaticClose: boolean;
    };
}
interface Messages {
    noFetchMethod: string;
    searchPlaceholder: string;
    searching: string;
    cannotSelectAllSearchedItems: string;
    cannotSelectAllRevertItems: string;
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
    unknownPropertyValue: string;
}
export declare type PartialMessages = {
    [K in keyof Messages]?: Messages[K];
};
export declare function changeTexts(texts: PartialMessages): void;
export default class SelecticStore {
    props: InternalProps;
    state: {
        internalValue: OptionId | StrictOptionId[];
        selectionIsExcluded: boolean;
        multiple: boolean;
        disabled: boolean;
        placeholder: string;
        hideFilter: boolean;
        keepFilterOpen: boolean;
        allowRevert?: boolean | undefined;
        allowClearSelection: boolean;
        autoSelect: boolean;
        autoDisabled: boolean;
        strictValue: boolean;
        selectionOverflow: SelectionOverflow;
        isOpen: boolean;
        searchText: string;
        allOptions: {
            id: OptionId;
            text: string;
            title?: string | undefined;
            disabled?: boolean | undefined;
            group?: StrictOptionId | undefined;
            className?: string | undefined;
            style?: string | undefined;
            icon?: string | undefined;
            options?: any[] | undefined;
            data?: any;
        }[];
        dynOptions: {
            id: OptionId;
            text: string;
            title?: string | undefined;
            disabled?: boolean | undefined;
            group?: StrictOptionId | undefined;
            className?: string | undefined;
            style?: string | undefined;
            icon?: string | undefined;
            options?: any[] | undefined;
            data?: any;
        }[];
        filteredOptions: {
            selected: boolean;
            disabled: boolean;
            isGroup: boolean;
            id: OptionId;
            text: string;
            title?: string | undefined;
            group?: StrictOptionId | undefined;
            className?: string | undefined;
            style?: string | undefined;
            icon?: string | undefined;
            options?: {
                id: OptionId;
                text: string;
                title?: string | undefined;
                disabled?: boolean | undefined;
                group?: StrictOptionId | undefined;
                className?: string | undefined;
                style?: string | undefined;
                icon?: string | undefined;
                options?: any[] | undefined;
                data?: any;
            }[] | undefined;
            data?: any;
        }[];
        selectedOptions: {
            selected: boolean;
            disabled: boolean;
            isGroup: boolean;
            id: OptionId;
            text: string;
            title?: string | undefined;
            group?: StrictOptionId | undefined;
            className?: string | undefined;
            style?: string | undefined;
            icon?: string | undefined;
            options?: {
                id: OptionId;
                text: string;
                title?: string | undefined;
                disabled?: boolean | undefined;
                group?: StrictOptionId | undefined;
                className?: string | undefined;
                style?: string | undefined;
                icon?: string | undefined;
                options?: any[] | undefined;
                data?: any;
            }[] | undefined;
            data?: any;
        } | {
            selected: boolean;
            disabled: boolean;
            isGroup: boolean;
            id: OptionId;
            text: string;
            title?: string | undefined;
            group?: StrictOptionId | undefined;
            className?: string | undefined;
            style?: string | undefined;
            icon?: string | undefined;
            options?: {
                id: OptionId;
                text: string;
                title?: string | undefined;
                disabled?: boolean | undefined;
                group?: StrictOptionId | undefined;
                className?: string | undefined;
                style?: string | undefined;
                icon?: string | undefined;
                options?: any[] | undefined;
                data?: any;
            }[] | undefined;
            data?: any;
        }[] | null;
        totalAllOptions: number;
        totalDynOptions: number;
        totalFilteredOptions: number;
        groups: Map<OptionId, string>;
        offsetItem: number;
        activeItemIdx: number;
        pageSize: number;
        formatOption?: FormatCallback | undefined;
        formatSelection?: FormatCallback | undefined;
        optionBehaviorOperation: OptionBehaviorOperation;
        optionBehaviorOrder: OptionBehaviorOrder[];
        listPosition: ListPosition;
        status: {
            searching: boolean;
            errorMessage: string;
            areAllSelected: boolean;
            hasChanged: boolean;
            automaticChange: boolean;
            automaticClose: boolean;
        };
    };
    data: Data;
    private requestId;
    private cacheRequest;
    private closeSelectic;
    marginSize: ComputedRef<number>;
    isPartial: ComputedRef<boolean>;
    hasAllItems: ComputedRef<boolean>;
    hasFetchedAllItems: ComputedRef<boolean>;
    private listOptions;
    private elementOptions;
    _uid: number;
    constructor(props?: Props);
    commit<N extends keyof SelecticStoreState, V extends SelecticStoreState[N]>(name: N, value: V): void;
    setAutomaticChange(): void;
    setAutomaticClose(): void;
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
    private getValue;
    private convertTypeValue;
    private assertValueType;
    private assertCorrectValue;
    private updateFilteredOptions;
    private addGroups;
    private getListOptions;
    private getElementOptions;
    private buildAllOptions;
    private buildFilteredOptions;
    private buildSelectedOptions;
    private fetchData;
    private filterOptions;
    private addStaticFilteredOptions;
    private buildSelectedItems;
    private hasItemInStore;
    private buildItems;
    private buildGroupItems;
    private buildOptionBehavior;
    private nbGroups;
    private checkAutoSelect;
    private checkAutoDisabled;
    private checkHideFilter;
}
export {};
