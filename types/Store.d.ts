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
    exclusive?: boolean;
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
export declare type RequestResult = {
    /** The total number of expecting options.
     * Needed to know if there are more items to fetch, and to size the scrollbar.
     */
    total: number;
    /** The list of the options. */
    result: OptionValue[];
};
export declare type FetchCallback = (_search: string, _offsetItem: number, _pageSize: number) => Promise<RequestResult>;
export declare type GetCallback = (_ids: OptionId[]) => Promise<OptionValue[]>;
export declare type FormatCallback = (_option: OptionItem) => OptionItem;
export declare type SelectionOverflow = 
/** Items are reduced in width and an ellipsis is displayed in their name. */
'collapsed' | 'multiline';
export declare type ListPosition = 
/** Display the list at bottom */
'bottom'
/** Display the list at bottom */
 | 'top'
/** Display the list at bottom but if there is not enough space, display it at top */
 | 'auto';
export declare type HideFilter = 
/** Display or hide the filter panel */
boolean
/** The handler to open the filter panel is hidden only if there is less
 * than 10 options */
 | 'auto'
/** The panel filter is always open */
 | 'open';
export declare type SelectAllOption = 
/** Display the "select all" only when data are all fetched or allowRevert */
'auto'
/** Always display the "select all" in mulitple mode. */
 | 'visible';
export interface SelecticStoreStateParams {
    /** Equivalent of <select>'s "multiple" attribute */
    multiple?: boolean;
    /** Equivalent of <input>'s "placeholder" attribute */
    placeholder?: string;
    /** Hide filter component when enabled */
    hideFilter?: HideFilter;
    /** Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;
    /** Force the availability of the "select all" even if all data is not fetched yet. */
    forceSelectAll?: SelectAllOption;
    /** Allow user to clear current selection */
    allowClearSelection?: boolean;
    /** Number of items to retrieve in fetch request  (it is possible
     * to fetch more items at once if several pages are requested) */
    pageSize?: number;
    /** Select the first available option */
    autoSelect?: boolean;
    /** Disable the select if only one option is given and must be selected. */
    autoDisabled?: boolean;
    /** Accept only values which are in options */
    strictValue?: boolean;
    /** Define how the component should behave when selected items are too
     * large for the container.
     *     collapsed (default): Items are reduced in width and an ellipsis
     *                          is displayed in their name.
     *     multiline: The container extends in height in order to display all
     *                items.
     */
    selectionOverflow?: SelectionOverflow;
    /** Called when item is displayed in the list. */
    formatOption?: FormatCallback;
    /** Called when item is displayed in the selection area. */
    formatSelection?: FormatCallback;
    /** Described behavior when options from several sources are set (static, dynamic, slots)
     * It describe what to do (sort or force)
     * and the order (O → static options, D → dynamic options, E → slot elements)
     * Example: "sort-ODE"
     */
    optionBehavior?: string;
    /** Indicate where the list should be deployed */
    listPosition?: ListPosition;
    /** If true, the component is open at start */
    isOpen?: boolean;
    /** Avoid selecting all items when clicking on group's header */
    disableGroupSelection?: boolean;
}
export interface Props {
    /** Selected value */
    value?: SelectedValue | null;
    /** If true, the value represents the ones we don't want to select */
    selectionIsExcluded?: boolean;
    /** Equivalent of "disabled" Select's attribute */
    disabled?: boolean;
    /** List of options to display */
    options?: OptionProp[] | null;
    /** List of options to display from child elements */
    childOptions?: OptionValue[];
    /** Define groups which will be used by items */
    groups?: GroupValue[];
    /** Overwrite default texts */
    texts?: PartialMessages | null;
    /** Overwrite default icons */
    icons?: PartialIcons | null;
    /** Overwrite default icon family */
    iconFamily?: IconFamily | null;
    /** Keep this component open if another Selectic component opens */
    keepOpenWithOtherSelectic?: boolean;
    /** Selectic configuration */
    params?: SelecticStoreStateParams;
    /** Method to call to fetch extra data */
    fetchCallback?: FetchCallback | null;
    /** Method to call to get specific item */
    getItemsCallback?: GetCallback | null;
}
declare type InternalProps = MandateProps<Props>;
export interface Data {
    /** Number of items displayed in a page (before scrolling) */
    itemsPerPage: number;
    labels: Messages;
    icons: PartialIcons;
    iconFamily: IconFamily;
    /** used to avoid checking and updating table while doing batch stuff */
    doNotUpdate: boolean;
    cacheItem: Map<OptionId, OptionValue>;
    activeOrder: OptionBehaviorOrder;
    dynOffset: number;
}
export interface SelecticStoreState {
    /** The current selected values */
    internalValue: SelectedValue;
    /** If true, user wants to choose the opposite selection */
    selectionIsExcluded: boolean;
    /** If true, several value can be selected */
    multiple: boolean;
    /** If true, no change can be done by user */
    disabled: boolean;
    /** Define the default text to display when there is no selection */
    placeholder: string;
    /** If true, filters and controls are hidden */
    hideFilter: boolean;
    /** If true, the filter panel is always open */
    keepFilterOpen: boolean;
    /** Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;
    /** If true, user can clear current selection
     * (if false, it is still possible to clear it programmatically) */
    allowClearSelection: boolean;
    /** If false, do not select the first available option even if value is mandatory */
    autoSelect: boolean;
    /** If true, Selectic is disabled if there is only one mandatory option. */
    autoDisabled: boolean;
    /** If true, only values which are in options are accepted. */
    strictValue: boolean;
    /** Define how to behave when selected items are too large for container. */
    selectionOverflow: SelectionOverflow;
    /** If true, the list is displayed */
    isOpen: boolean;
    /** Text entered by user to look for options */
    searchText: string;
    /** Contains all known options */
    allOptions: OptionValue[];
    /** Contains all fetched dynamic options */
    dynOptions: OptionValue[];
    /** Contains options which should be displayed */
    filteredOptions: OptionItem[];
    /** Contains options which are selected */
    selectedOptions: OptionItem | OptionItem[] | null;
    /** The total number of all options (static + dynamic + elements) without any filter */
    totalAllOptions: number;
    /** The total number of options which can be fetched (without any filter) */
    totalDynOptions: number;
    /** The total number of options which should be displayed (filter is applied) */
    totalFilteredOptions: number;
    /** Description of groups (optGroup) */
    groups: Map<OptionId, string>;
    /** Starting index of options which are displayed */
    offsetItem: number;
    /** Index of active item */
    activeItemIdx: number;
    /** Number of items to fetch per page */
    pageSize: number;
    /** Called when item is displayed in the list. */
    formatOption?: FormatCallback;
    /** Called when item is displayed in the selection area. */
    formatSelection?: FormatCallback;
    /** Operation to apply when there are several sources */
    optionBehaviorOperation: OptionBehaviorOperation;
    /** Order of sources options */
    optionBehaviorOrder: OptionBehaviorOrder[];
    /** Indicate where the list should be deployed */
    listPosition: ListPosition;
    /** If true, the "select All" is still available even if all data are not fetched yet. */
    forceSelectAll: SelectAllOption;
    /** Avoid selecting all items when clicking on group's header */
    disableGroupSelection: boolean;
    /** Inner status which should be modified only by store */
    status: {
        /** If true, a search is currently done */
        searching: boolean;
        /** If not empty, an error happens */
        errorMessage: string;
        /** If true it means that all options are selected */
        areAllSelected: boolean;
        /** If true, a change has been done by user */
        hasChanged: boolean;
        /** If true, it means the current change has been done automatically by Selectic */
        automaticChange: boolean;
        /** If true, it means the current close has been done automatically by Selectic */
        automaticClose: boolean;
    };
}
export declare type IconFamily = '' | 'selectic' | 'font-awesome-4' | 'font-awesome-5' | 'font-awesome-6' | 'raw' | `prefix:${string}`;
export declare type IconKey = 'caret-down' | 'caret-up' | 'check' | 'dot' | 'search' | 'spinner' | 'strikethrough' | 'times' | 'question' | 'spin';
export declare type IconValue = `selectic:${IconKey}${'' | ':spin'}` | `raw:${string}` | `current:${IconKey}${'' | ':spin'}` | string;
export declare type Icons = Record<IconKey, IconValue>;
export declare type PartialIcons = {
    [K in IconKey]?: Icons[K];
};
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
    wrongQueryResult: string;
}
export declare type PartialMessages = {
    [K in keyof Messages]?: Messages[K];
};
export declare function changeTexts(texts: PartialMessages): void;
export declare function changeIcons(newIcons: PartialIcons, newFamilyIcon?: IconFamily): void;
export default class SelecticStore {
    props: InternalProps;
    state: SelecticStoreState;
    data: Data;
    private requestId;
    private requestSearchId;
    private isRequesting;
    private cacheRequest;
    private closeSelectic;
    /** Number of item to pre-display */
    marginSize: ComputedRef<number>;
    /** If true, it is possible to click on group to select all items inside */
    allowGroupSelection: ComputedRef<boolean>;
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
    selectGroup(id: OptionId, itemsSelected: boolean): void;
    selectItem(id: OptionId, selected?: boolean, keepOpen?: boolean): boolean;
    toggleSelectAll(): void;
    resetChange(): void;
    resetErrorMessage(): void;
    clearCache(forceReset?: boolean): void;
    changeGroups(groups: GroupValue[]): void;
    changeTexts(texts: PartialMessages): void;
    changeIcons(icons: PartialIcons | null, family?: IconFamily | null): void;
    private hasValue;
    private getValue;
    private convertTypeValue;
    private assertValueType;
    private assertCorrectValue;
    /** Reset the display cache in order to rebuild it */
    private clearDisplay;
    /** rebuild the state filteredOptions to normalize their values */
    private updateFilteredOptions;
    private addGroups;
    /** This method is for the computed property listOptions */
    private getListOptions;
    /** This method is for the computed property elementOptions */
    private getElementOptions;
    /** Generate the list of all options by combining the 3 option lists */
    private buildAllOptions;
    private buildFilteredOptions;
    private buildSelectedOptions;
    private fetchRequest;
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
    /** update group item, to mark them as selected if needed */
    private updateGroupSelection;
    /** assign new value to the filteredOptions and apply change depending on it */
    private setFilteredOptions;
}
export {};
