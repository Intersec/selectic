/* File Purpose:
 * It keeps and computes all states at a single place.
 * Every inner components of Selectic should comunicate with this file to
 * change or to get states.
 */

import {Vue, Component, Prop, Watch} from 'vtyx';

/* {{{ Types definitions */

type voidCaller = () => void;

export type StrictOptionId = string | number;
export type OptionId = StrictOptionId | null;
export type SelectedValue = OptionId | StrictOptionId[];

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

    /* Used to store specific information about this option.
     * This `data` is not used by Selectic. */
    data?: any;
}

type OptionBehaviorOperation = 'sort' | 'force';
type OptionBehaviorOrder = 'O' | 'D' | 'E';

export interface OptionItem extends OptionValue {
    selected: boolean;
    disabled: boolean;
    isGroup: boolean;
}

export type OptionProp = OptionValue | string;

export interface GroupValue {
    id: StrictOptionId;
    text: string;
}

export type FetchCallback = (_search: string, _offsetItem: number, _pageSize: number)
    => Promise<{total: number, result: OptionValue[]}>;

export type GetCallback = (_ids: OptionId[])
    => Promise<OptionValue[]>;

export type FormatCallback = (_option: OptionItem) => OptionItem;

export type SelectionOverflow =
    /* Items are reduced in width and an ellipsis is displayed in their name. */
    'collapsed'
    /* The container extends in height in order to display all items. */
  | 'multiline';

export type ListPosition =
    /* Display the list at bottom */
    'bottom'
    /* Display the list at bottom */
  | 'top'
    /* Display the list at bootom but if there is not enough space, display it at top */
  | 'auto';

export interface SelecticStoreStateParams {
    /* Equivalent of <select>'s "multiple" attribute */
    multiple?: boolean;

    /* Equivalent of <input>'s "placeholder" attribute */
    placeholder?: string;

    /* Hide filter component when enabled */
    hideFilter?: boolean | 'auto';

    /* Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;

    /* Allow user to clear current selection */
    allowClearSelection?: boolean;

    /* Number of items to retrieve in fetch request  (it is possible
     * to fetch more items at once if several pages are requested) */
    pageSize?: number;

    /* Select the first available option */
    autoSelect?: boolean;

    /* Disable the select if only one option is given and must be selected. */
    autoDisabled?: boolean;

    /* Accept only values which are in options */
    strictValue?: boolean;

    /* Define how the component should behave when selected items are too
     * large for the container.
     *     collapsed (default): Items are reduced in width and an ellipsis
     *                          is displayed in their name.
     *     multiline: The container extends in height in order to display all
     *                items.
     */
    selectionOverflow?: SelectionOverflow;

    /* Called when item is displayed in the list. */
    formatOption?: FormatCallback;

    /* Called when item is displayed in the selection area. */
    formatSelection?: FormatCallback;

    /* Described behavior when options from several sources are set (static, dynamic, slots)
     * It describe what to do (sort or force)
     * and the order (O → static options, D → dynamic options, E → slot elements)
     * Example: "sort-ODE"
     */
    optionBehavior?: string;

    /* If true, the component is open at start */
    isOpen?: boolean;
}

export interface Props {
    /* Selected value */
    value?: SelectedValue;

    /* If true, the value represents the ones we don't want to select */
    selectionIsExcluded?: boolean;

    /* Equivalent of "disabled" select's attribute */
    disabled?: boolean;

    /* List of options to display */
    options?: OptionProp[];

    /* List of options to display from child elements */
    childOptions?: OptionProp[];

    /* Define groups which will be used by items */
    groups?: GroupValue[];

    /* Overwrite default texts */
    texts?: PartialMessages;

    /* Keep this component open if another Selectic component opens */
    keepOpenWithOtherSelectic?: boolean;

    /* Selectic configuration */
    params?: SelecticStoreStateParams;

    /* Method to call to fetch extra data */
    fetchCallback?: FetchCallback;

    /* Method to call to get specific item */
    getItemsCallback?: GetCallback;
}

export interface SelecticStoreState {
    /* The current selected values */
    internalValue: SelectedValue;

    /* If true, user wants to choose the opposite selection */
    selectionIsExcluded: boolean;

    /* If true, several value can be selected */
    multiple: boolean;

    /* If true, no change can be done by user */
    disabled: boolean;

    /* Define the default text to display when there is no selection */
    placeholder: string;

    /* If true, filters and controls are hidden */
    hideFilter: boolean;

    /* Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;

    /* If true, user can clear current selection
     * (if false, it is still possible to clear it programatically) */
    allowClearSelection: boolean;

    /* If false, do not select the first available option even if value is mandatory */
    autoSelect: boolean;

    /* If true, Selectic is disabled if there is only one mandatory option. */
    autoDisabled: boolean;

    /* If true, only values which are in options are accepted. */
    strictValue: boolean;

    /* Define how to behave when selected items are too large for container. */
    selectionOverflow: SelectionOverflow;

    /* If true, the list is displayed */
    isOpen: boolean;

    /* Text entered by user to look for options */
    searchText: string;

    /* Contains all known options */
    allOptions: OptionValue[];

    /* Contains all fetched dynamic options */
    dynOptions: OptionValue[];

    /* Contains options which should be displayed */
    filteredOptions: OptionItem[];

    /* Contains options which are selected */
    selectedOptions: OptionItem | OptionItem[] | null;

    /* The total number of all options (static + dynamic + elements) without any filter */
    totalAllOptions: number;

    /* The total number of options which can be fetched (without any filter) */
    totalDynOptions: number;

    /* The total number of options which should be displayed (filter is applied) */
    totalFilteredOptions: number;

    /* Description of groups (optGroup) */
    groups: Map<OptionId, string>;

    /* Starting index of options which are displayed */
    offsetItem: number;

    /* Index of active item */
    activeItemIdx: number;

    /* Number of items to fetch per page */
    pageSize: number;

    /* Called when item is displayed in the list. */
    formatOption?: FormatCallback;

    /* Called when item is displayed in the selection area. */
    formatSelection?: FormatCallback;

    /* Operation to apply when there are several sources */
    optionBehaviorOperation: OptionBehaviorOperation;

    /* Order of sources options */
    optionBehaviorOrder: OptionBehaviorOrder[];

    /* Indicate where the list should be deployed */
    listPosition: ListPosition;

    /* Inner status which should be modified only by store */
    status: {
        /* If true, a search is currently done */
        searching: boolean;

        /* If not empty, an error happens */
        errorMessage: string;

        /* If true it means that all options are selected */
        areAllSelected: boolean;

        /* If true, a change has been done by user */
        hasChanged: boolean;
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

export type PartialMessages = { [K in keyof Messages]?: Messages[K] };

/* }}} */

/**
 * Escape search string to consider regexp special characters as they
 * are and not like special characters.
 * Consider * characters as a wildcards characters (meanings 0 or
 * more characters) and convert them to .* (the wildcard characters
 * in Regexp)
 *
 * @param  {String} name the original string to convert
 * @param  {String} [flag] mode to apply for regExp
 * @return {String} the string ready to use for RegExp format
 */
function convertToRegExp(name: string, flag = 'i'): RegExp {
    const pattern = name.replace(/[\\^$.+?(){}[\]|]/g, '\\$&')
                        .replace(/\*/g, '.*');

    return new RegExp(pattern, flag);
}

let messages: Messages = {
    noFetchMethod: 'Fetch callback is missing: it is not possible to retrieve data.',
    searchPlaceholder: 'Search',
    searching: 'Searching',
    cannotSelectAllSearchedItems: 'Cannot select all items: too much items in the search result.',
    cannotSelectAllRevertItems: 'Cannot select all items: some items are not fetched yet.',
    selectAll: 'Select all',
    excludeResult: 'Invert selection',
    reverseSelection: 'The displayed elements are those not selected.',
    noData: 'No data',
    noResult: 'No results',
    clearSelection: 'Clear current selection',
    clearSelections: 'Clear all selections',
    wrongFormattedData: 'The data fetched is not correctly formatted.',
    moreSelectedItem: '+1 other',
    moreSelectedItems: '+%d others',
    unknownPropertyValue: 'property "%s" has incorrect values.',
};

let closePreviousSelectic: undefined | voidCaller;

/* {{{ Static */

export function changeTexts(texts: PartialMessages) {
    messages = Object.assign(messages, texts);
}

/* }}} */

@Component
export default class SelecticStore extends Vue<Props> {
    /* {{{ props */

    @Prop()
    public value?: SelectedValue;

    @Prop({default: false})
    public selectionIsExcluded: boolean;

    @Prop({default: false})
    public disabled: boolean;

    @Prop()
    public options?: OptionProp[];

    @Prop()
    public childOptions?: OptionValue[];

    @Prop({default: () => []})
    public groups: GroupValue[];

    @Prop()
    public texts?: PartialMessages;

    @Prop()
    private params?: SelecticStoreStateParams;

    @Prop()
    private fetchCallback?: FetchCallback;

    @Prop()
    private getItemsCallback?: GetCallback;

    @Prop({ default: false })
    private keepOpenWithOtherSelectic: boolean;

    /* }}} */
    /* {{{ data */

    /* Number of items displayed in a page (before scrolling) */
    public itemsPerPage = 10;

    public state: SelecticStoreState = {
        multiple: false,
        disabled: false,
        placeholder: '',
        hideFilter: false,
        allowRevert: undefined,
        allowClearSelection: false,
        autoSelect: true,
        autoDisabled: true,
        strictValue: false,
        selectionOverflow: 'collapsed',

        internalValue: null,
        isOpen: false,
        searchText: '',
        selectionIsExcluded: false,
        allOptions: [],
        dynOptions: [],
        filteredOptions: [],
        selectedOptions: null,
        totalAllOptions: Infinity,
        totalDynOptions: Infinity,
        totalFilteredOptions: Infinity,
        groups: new Map(),
        offsetItem: 0,
        activeItemIdx: -1,
        pageSize: 100,
        listPosition: 'auto',

        optionBehaviorOperation: 'sort',
        optionBehaviorOrder: ['O', 'D', 'E'],

        status: {
            searching: false,
            errorMessage: '',
            areAllSelected: false,
            hasChanged: false,
        },
    };
    public labels = Object.assign({}, messages);
    /* used to avoid checking and updating table while doing batch stuff */
    private doNotUpdate = false;
    private cacheItem: Map<OptionId, OptionValue> = new Map();
    private activeOrder: OptionBehaviorOrder = 'D';
    private dynOffset: number = 0;

    /* Do not need reactivity */
    private requestId: number;
    private cacheRequest: Map<string, Promise<OptionValue[]>>;

    /* }}} */
    /* {{{ computed */

    /* Number of item to pre-display */
    get marginSize() {
        return this.state.pageSize / 2;
    }

    get isPartial(): boolean {
        const state = this.state;
        let isPartial =  typeof this.fetchCallback === 'function';

        if (isPartial && state.optionBehaviorOperation === 'force' && this.activeOrder !== 'D') {
            isPartial = false;
        }

        return isPartial;
    }

    get hasAllItems() {
        const nbItems = this.state.totalFilteredOptions + this.state.groups.size;

        return this.state.filteredOptions.length >= nbItems;
    }

    get hasFetchedAllItems() {
        const state = this.state;

        if (!this.isPartial) {
            return true;
        }

        return state.dynOptions.length === state.totalDynOptions;
    }

    get closeSelectic() {
        return () => this.commit('isOpen', false);
    }

    /* }}} */
    /* {{{ methods */
    /* {{{ public methods */

    public commit<
        N extends keyof SelecticStoreState,
        V extends SelecticStoreState[N]
    >(name: N, value: V)
    {
        const oldValue = this.state[name];

        if (oldValue === value) {
            return;
        }

        this.state[name] = value;

        switch (name) {
          case 'searchText':
            this.state.offsetItem = 0;
            this.state.activeItemIdx = -1;
            this.state.filteredOptions = [];
            this.state.totalFilteredOptions = Infinity;
            if (value) {
                this.buildFilteredOptions();
            } else {
                this.buildAllOptions(true);
            }
            break;
          case 'isOpen':
            if (closePreviousSelectic === this.closeSelectic) {
                closePreviousSelectic = undefined;
            }
            if (value) {
                if (this.state.disabled) {
                    this.commit('isOpen', false);
                    return;
                }

                this.state.offsetItem = 0;
                this.state.activeItemIdx = -1;
                this.resetChange();
                this.buildFilteredOptions();
                if (typeof closePreviousSelectic === 'function') {
                    closePreviousSelectic();
                }
                if (!this.keepOpenWithOtherSelectic) {
                    closePreviousSelectic = this.closeSelectic;
                }
            }
            break;
          case 'offsetItem':
            this.buildFilteredOptions();
            break;
          case 'internalValue':
            this.assertCorrectValue();
            this.updateFilteredOptions();
            break;
          case 'selectionIsExcluded':
            this.assertCorrectValue();
            this.updateFilteredOptions();
            this.buildSelectedOptions();
            break;
          case 'disabled':
            if (value) {
                this.commit('isOpen', false);
            }
            break;
        }
    }

    public getItem(id: OptionId): OptionValue {
        let item: OptionValue;

        if (this.hasItemInStore(id)) {
            item = this.cacheItem.get(id) as OptionValue;
        } else {
            this.getItems([id]);
            item = {
                id,
                text: String(id),
            };
        }

        return this.buildItems([item])[0];
    }

    public async getItems(ids: OptionId[]): Promise<OptionItem[]> {
        const itemsToFetch: OptionId[] = ids.filter((id) => !this.hasItemInStore(id));

        if (itemsToFetch.length && typeof this.getItemsCallback === 'function') {
            const cacheRequest = this.cacheRequest;
            const requestId = itemsToFetch.toString();
            let promise: Promise<OptionValue[]>;

            if (cacheRequest.has(requestId)) {
                promise = cacheRequest.get(requestId)!;
            } else {
                promise = this.getItemsCallback(itemsToFetch);
                cacheRequest.set(requestId, promise);
                promise.then(() => {
                    cacheRequest.delete(requestId);
                });
            }

            const items = await promise;

            for (const item of items) {
                if (item) {
                    this.cacheItem.set(item.id, item);
                }
            }
        }

        return this.buildSelectedItems(ids);
    }

    public selectItem(id: OptionId, selected?: boolean, keepOpen = false) {
        const state = this.state;
        let hasChanged = false;

        /* Check that item is not disabled */
        if (!this.isPartial) {
            const item = state.allOptions.find((opt) => opt.id === id);
            if (item && item.disabled) {
                return;
            }
        }

        if (state.strictValue && !this.hasValue(id)) {
            /* reject invalid values */
            return;
        }

        if (state.multiple) {
            /* multiple = true */
            const internalValue = state.internalValue as StrictOptionId[];
            const isAlreadySelected = (internalValue as OptionId[]).includes(id);

            if (selected === undefined) {
                selected = !isAlreadySelected;
            }

            if (id === null) {
                state.internalValue = [];
                hasChanged = internalValue.length > 0;
            } else
            if (selected && !isAlreadySelected) {
                internalValue.push(id);
                hasChanged = true;
            } else
            if (!selected && isAlreadySelected) {
                internalValue.splice(internalValue.indexOf(id), 1);
                hasChanged = true;
            }

            if (hasChanged) {
                this.updateFilteredOptions();
            }
        } else {
            /* multiple = false */
            const oldValue = state.internalValue as OptionId;

            if (!keepOpen) {
                this.commit('isOpen', false);
            }

            if (selected === undefined || id === null) {
                selected = true;
            }

            if (!selected) {
                if (id !== oldValue) {
                    return;
                }
                id = null;
            } else
            if (id === oldValue) {
                return;
            }

            this.commit('internalValue', id);
            hasChanged = true;
        }

        if (hasChanged) {
            state.status.hasChanged = true;
        }
    }

    public toggleSelectAll() {
        if (!this.state.multiple) {
            return;
        }

        if (!this.hasAllItems) {
            if (this.state.searchText) {
                this.state.status.errorMessage = this.labels.cannotSelectAllSearchedItems;
                return;
            }

            if (!this.state.allowRevert) {
                this.state.status.errorMessage = this.labels.cannotSelectAllRevertItems;
                return;
            }

            const value = this.state.internalValue as StrictOptionId[];
            const selectionIsExcluded = !!value.length || !this.state.selectionIsExcluded;
            this.state.selectionIsExcluded = selectionIsExcluded;
            this.state.internalValue = [];
            this.state.status.hasChanged = true;
            this.updateFilteredOptions();
            return;
        }

        const selectAll = !this.state.status.areAllSelected;
        this.state.status.areAllSelected = selectAll;
        this.doNotUpdate = true;
        this.state.filteredOptions.forEach((item) => this.selectItem(item.id, selectAll));
        this.doNotUpdate = false;
        this.updateFilteredOptions();
    }

    public resetChange() {
        this.state.status.hasChanged = false;
    }

    public resetErrorMessage() {
        this.state.status.errorMessage = '';
    }

    public clearCache(forceReset = false) {
        const total = this.isPartial ? Infinity : 0;

        this.cacheItem.clear();

        this.state.allOptions = [];
        this.state.totalAllOptions = total;
        this.state.totalDynOptions = total;

        this.state.filteredOptions = [];
        this.state.totalFilteredOptions = Infinity;

        this.state.status.errorMessage = '';
        this.state.status.hasChanged = false;

        if (forceReset) {
            this.state.internalValue = null;
            this.state.selectionIsExcluded = false;

            this.state.searchText = '';
        }
        this.assertCorrectValue();

        if (forceReset) {
            this.buildFilteredOptions();
        } else {
            this.buildAllOptions();
        }
    }

    public changeGroups(groups: GroupValue[]) {
        this.state.groups.clear();
        this.addGroups(groups);
        this.buildFilteredOptions();
    }

    public changeTexts(texts: PartialMessages) {
        this.labels = Object.assign({}, this.labels, texts);
    }

    /* }}} */
    /* {{{ private methods */

    private hasValue(id: OptionId): boolean {
        const allOptions = this.state.allOptions;

        if (id === null) {
            return true;
        }

        return !!this.getValue(id);
    }

    private getValue(id: OptionId): OptionValue | undefined {
        function findId(option: OptionValue): boolean {
            return option.id === id;
        }

        return this.state.filteredOptions.find(findId) ||
            this.state.dynOptions.find(findId) ||
            this.getListOptions().find(findId) ||
            this.getElementOptions().find(findId);
    }

    private assertCorrectValue(forceStrict = false) {
        const state = this.state;
        const internalValue = state.internalValue;
        const selectionIsExcluded = state.selectionIsExcluded;
        const isMultiple = state.multiple;
        const checkStrict = state.strictValue;
        let newValue = internalValue;
        const isPartial = this.isPartial;

        if (isMultiple) {
            if (!Array.isArray(internalValue)) {
                newValue = internalValue === null ? [] : [internalValue];
            }

            if (selectionIsExcluded && this.hasFetchedAllItems) {
                newValue = state.allOptions.reduce((values, option) => {
                    const id = option.id as StrictOptionId;

                    if (!(internalValue as StrictOptionId[]).includes(id)) {
                        values.push(id);
                    }

                    return values;
                }, [] as StrictOptionId[]);
                state.selectionIsExcluded = false;
            }
        } else {
            if (Array.isArray(internalValue)) {
                const value = internalValue[0];
                newValue = typeof value === 'undefined' ? null : value;
            }

            state.selectionIsExcluded = false;
        }

        if (checkStrict) {
            let isDifferent = false;
            let filteredValue: SelectedValue;

            if (isMultiple) {
                filteredValue = (newValue as StrictOptionId[])
                .filter((value) => this.hasItemInStore(value));
                isDifferent = filteredValue.length !== (newValue as StrictOptionId[]).length;

                if (isDifferent && isPartial && !forceStrict) {
                    this.getItems(newValue as StrictOptionId[]).then(() => this.assertCorrectValue(true));
                    return;
                }
            } else
            if (!this.hasItemInStore(newValue as OptionId)) {
                filteredValue = null;
                isDifferent = true;

                if (isPartial && !forceStrict) {
                    this.getItems([newValue as OptionId]).then(() => this.assertCorrectValue(true));
                    return;
                }
            }

            if (isDifferent) {
                newValue = filteredValue!;
            }
        }

        state.internalValue = newValue;
    }

    private updateFilteredOptions() {
        if (!this.doNotUpdate) {
            this.state.filteredOptions = this.buildItems(this.state.filteredOptions);
        }
    }

    private addGroups(groups: GroupValue[]) {
        groups.forEach((group) => {
            this.state.groups.set(group.id, group.text);
        });
    }

    /* XXX: This is not a computed property to avoid consuming more memory */
    private getListOptions(): OptionValue[] {
        const options = this.options;
        const listOptions: OptionValue[] = [];

        if (!Array.isArray(options)) {
            return listOptions;
        }

        options.forEach((option) => {
            /* manage simple string */
            if (typeof option === 'string') {
                listOptions.push({
                    id: option,
                    text: option,
                });
                return;
            }

            const group = option.group;
            const subOptions = option.options;

            /* check for groups */
            if (group && !this.state.groups.has(group)) {
                this.state.groups.set(group, String(group));
            }

            /* check for sub options */
            if (subOptions) {
                const groupId = option.id as StrictOptionId;
                this.state.groups.set(groupId, option.text);

                subOptions.forEach((subOpt) => {
                    subOpt.group = groupId;
                });
                listOptions.push(...subOptions);
                return;
            }

            listOptions.push(option);
        });

        return listOptions;
    }

    /* XXX: This is not a computed property to avoid consuming more memory */
    private getElementOptions(): OptionValue[] {
        const options = this.childOptions;
        const childOptions: OptionValue[] = [];

        if (!Array.isArray(options)) {
            return childOptions;
        }

        options.forEach((option) => {
            const group = option.group;
            const subOptions = option.options;

            /* check for groups */
            if (group && !this.state.groups.has(group)) {
                this.state.groups.set(group, String(group));
            }

            /* check for sub options */
            if (subOptions) {
                const groupId = option.id as StrictOptionId;
                this.state.groups.set(groupId, option.text);

                subOptions.forEach((subOpt) => {
                    subOpt.group = groupId;
                });
                childOptions.push(...subOptions);
                return;
            }

            childOptions.push(option);
        });

        return childOptions;
    }

    private buildAllOptions(keepFetched = false) {
        const allOptions: OptionValue[] = [];
        let listOptions: OptionValue[] = [];
        let elementOptions: OptionValue[] = [];
        const optionBehaviorOrder = this.state.optionBehaviorOrder;
        let length: number = Infinity;

        const arrayFromOrder = (orderValue: OptionBehaviorOrder): OptionValue[] => {
            switch(orderValue) {
                case 'O': return listOptions;
                case 'D': return this.state.dynOptions;
                case 'E': return elementOptions;
            }
            return [];
        };

        const lengthFromOrder = (orderValue: OptionBehaviorOrder): number => {
            switch(orderValue) {
                case 'O': return listOptions.length;
                case 'D': return this.state.totalDynOptions;
                case 'E': return elementOptions.length;
            }
            return 0;
        };

        if (!keepFetched) {
            if (this.isPartial) {
                this.state.totalAllOptions = Infinity;
                this.state.totalDynOptions = Infinity;
            } else {
                this.state.totalDynOptions = 0;
            }
        }

        listOptions = this.getListOptions();
        elementOptions = this.getElementOptions();

        if (this.state.optionBehaviorOperation === 'force') {
            const orderValue = optionBehaviorOrder.find((value) => lengthFromOrder(value) > 0)!;
            allOptions.push(...arrayFromOrder(orderValue));
            length = lengthFromOrder(orderValue);
            this.activeOrder = orderValue;
            this.dynOffset = 0;
        } else {
            /* sort */
            let offset = 0;
            for (const orderValue of optionBehaviorOrder) {
                const list = arrayFromOrder(orderValue);
                const lngth = lengthFromOrder(orderValue);

                if (orderValue === 'D') {
                    this.dynOffset = offset;
                } else {
                    offset += lngth;
                }

                allOptions.push(...list);
                if (list.length < lngth) {
                    /* All dynamic options are not fetched yet */
                    break;
                }
            }
            this.activeOrder = 'D';
            length = optionBehaviorOrder.reduce((total, orderValue) => total + lengthFromOrder(orderValue), 0);
        }

        this.state.allOptions = allOptions;

        if (keepFetched) {
            this.state.totalAllOptions = length;
        } else {
            if (!this.isPartial) {
                this.state.totalAllOptions = allOptions.length;
            }
        }

        this.state.filteredOptions = [];
        this.state.totalFilteredOptions = Infinity;

        this.buildFilteredOptions();
    }

    private async buildFilteredOptions() {
        if (!this.state.isOpen) {
            /* Do not try to fetch anything while the select is not open */
            return;
        }

        const allOptions = this.state.allOptions;
        const search = this.state.searchText;
        const totalAllOptions = this.state.totalAllOptions;
        const allOptionsLength = allOptions.length;
        let filteredOptionsLength = this.state.filteredOptions.length;

        if (this.hasAllItems) {
            /* Everything has already been fetched and stored in filteredOptions */
            return;
        }

        /* Check if all options have been fetched */
        if (this.hasFetchedAllItems) {
            if (!search) {
                this.state.filteredOptions = this.buildGroupItems(allOptions);
                this.state.totalFilteredOptions = this.state.filteredOptions.length;
                return;
            }

            const options = this.filterOptions(allOptions, search);
            this.state.filteredOptions = options;
            this.state.totalFilteredOptions = this.state.filteredOptions.length;
            return;
        }

        /* When we only have partial options */

        const offsetItem = this.state.offsetItem;
        const marginSize = this.marginSize;
        const endIndex = offsetItem + marginSize;

        if (endIndex <= filteredOptionsLength) {
            return;
        }

        if (!search && endIndex <= allOptionsLength) {
            this.state.filteredOptions = this.buildGroupItems(allOptions);
            this.state.totalFilteredOptions = totalAllOptions + this.state.groups.size;
            if (this.isPartial && this.state.totalDynOptions === Infinity) {
                this.fetchData();
            }
            return;
        }

        if (filteredOptionsLength === 0 && this.state.optionBehaviorOperation === 'sort') {
            this.addStaticFilteredOptions();

            filteredOptionsLength = this.state.filteredOptions.length;
            this.dynOffset = filteredOptionsLength;
            if (endIndex <= filteredOptionsLength) {
                return;
            }
        }

        await this.fetchData();
    }

    private async buildSelectedOptions() {
        const internalValue = this.state.internalValue;

        if (this.state.multiple) {
            /* display partial information about selected items */
            this.state.selectedOptions = this.buildSelectedItems(internalValue as StrictOptionId[]);

            const items: OptionItem[] = await this.getItems(internalValue as StrictOptionId[]).catch(() => []);
            if (internalValue !== this.state.internalValue) {
                /* Values have been deprecated */
                return;
            }

            if (items.length !== (internalValue as StrictOptionId[]).length) {
                if (!this.state.strictValue) {
                    const updatedItems = this.state.selectedOptions.map((option) => {
                        const foundItem = items.find((item) => item.id === option.id);

                        return foundItem || option;
                    });

                    this.state.selectedOptions = updatedItems;
                } else {
                    const itemIds = items.map((item) => item.id as StrictOptionId) ;

                    this.commit('internalValue', itemIds);
                }
                return;
            }

            /* display full information about selected items */
            this.state.selectedOptions = items;
        } else
        if (internalValue === null) {
            this.state.selectedOptions = null;
        } else {
            /* display partial information about selected items */
            this.state.selectedOptions = this.buildSelectedItems([internalValue as OptionId])[0];

            const items = await this.getItems([internalValue as OptionId]).catch(() => []);
            if (internalValue !== this.state.internalValue) {
                /* Values have been deprecated */
                return;
            }

            if (!items.length) {
                if (this.state.strictValue) {
                    this.commit('internalValue', null);
                }
                return;
            }

            /* display full information about selected items */
            this.state.selectedOptions = items[0];
        }
    }

    private async fetchData() {
        const state = this.state;

        if (!this.fetchCallback) {
            state.status.errorMessage = this.labels.noFetchMethod;
            return;
        }

        const search = state.searchText;
        const filteredOptionsLength = state.filteredOptions.length;
        const offsetItem = state.offsetItem;
        const pageSize = state.pageSize;
        const marginSize = this.marginSize;
        const endIndex = offsetItem + marginSize;

        /* Run the query */
        this.state.status.searching = true;

        /* Manage cases where offsetItem is not equal to the last item received */
        const offset = filteredOptionsLength - this.nbGroups(state.filteredOptions) - this.dynOffset;
        const nbItems = endIndex - offset;
        const limit = Math.ceil(nbItems / pageSize) * pageSize;

        try {
            const requestId = ++this.requestId;
            const {total: rTotal, result} = await this.fetchCallback(search, offset, limit);
            let total = rTotal;

            /* Assert result is correctly formatted */
            if (!Array.isArray(result)) {
                throw new Error(this.labels.wrongFormattedData);
            }

            /* Handle case where total is not returned */
            if (typeof total !== 'number') {
                total = search ? state.totalFilteredOptions
                               : state.totalDynOptions;

                if (!isFinite(total)) {
                    total = result.length;
                }
            }

            if (!search) {
                /* update cache */
                state.totalDynOptions = total;
                state.dynOptions.splice(offset, limit, ...result);
                this.$nextTick(() => this.buildAllOptions(true));
            }

            /* Check request is not obsolete */
            if (requestId !== this.requestId) {
                return;
            }

            if (!search) {
                state.filteredOptions = this.buildGroupItems(state.allOptions);
            } else {
                const previousItem = state.filteredOptions[filteredOptionsLength - 1];
                const options = this.buildGroupItems(result, previousItem);
                const nbGroups1 = this.nbGroups(options);

                state.filteredOptions.splice(offset + this.dynOffset, limit + nbGroups1, ...options);
            }

            let nbGroups = state.groups.size;
            if (offset + limit >= total) {
                nbGroups = this.nbGroups(state.filteredOptions);
            }

            state.totalFilteredOptions = total + nbGroups + this.dynOffset;

            if (search && state.totalFilteredOptions <= state.filteredOptions.length) {
                this.addStaticFilteredOptions(true);
            }

            state.status.errorMessage = '';
        } catch (e) {
            state.status.errorMessage = e.message;
            if (!search) {
                state.totalDynOptions = 0;
                this.buildAllOptions(true);
            }
        }

        this.state.status.searching = false;
    }

    private filterOptions(options: OptionValue[], search: string): OptionItem[] {
        if (!search) {
            return this.buildGroupItems(options);
        }

        /* Filter options on what is search for */
        const rgx = convertToRegExp(search, 'i');
        return this.buildGroupItems(
            options.filter((option) => rgx.test(option.text))
        );
    }

    private addStaticFilteredOptions(fromDynamic = false) {
        const search = this.state.searchText;
        let continueLoop = fromDynamic;

        if (this.state.optionBehaviorOperation !== 'sort') {
            return;
        }

        for (const order of this.state.optionBehaviorOrder) {
            let options: OptionItem[] = [];
            if (order === 'D') {
                if (!continueLoop) {
                    return;
                }
                continueLoop = false;
                continue;
            } else if (continueLoop) {
                continue;
            }

            switch (order) {
                case 'O':
                    options = this.filterOptions(this.getListOptions(), search);
                    break;
                case 'E':
                    options = this.filterOptions(this.getElementOptions(), search);
                    break;
            }
            this.state.filteredOptions.push(...options);
            this.state.totalFilteredOptions += options.length;
        }
    }

    private buildSelectedItems(ids: OptionId[]): OptionItem[] {
        return this.buildItems(ids.map((id) => {
            const item = this.cacheItem.get(id);

            return item || {
                id,
                text: String(id),
            };
        }));
    }

    private hasItemInStore(id: OptionId): boolean {
        let item: OptionValue | undefined = this.cacheItem.get(id);

        if (!item) {
            item = this.getValue(id);

            if (item) {
                this.cacheItem.set(item.id, item);
            }
        }

        return !!item;
    }

    private buildItems(options: OptionValue[]): OptionItem[] {
        const internalValue = this.state.internalValue;
        const selected = this.state.multiple
                       ? internalValue as StrictOptionId[]
                       : [internalValue as OptionId];
        const selectionIsExcluded = +this.state.selectionIsExcluded;

        return options.map((option) => {
            const id = option.id;

            return Object.assign({
                disabled: false,
                isGroup: false,
            }, option, {
                // tslint:disable-next-line:no-bitwise
                selected: !!(+selected.includes(id) ^ selectionIsExcluded),
            });
        });
    }

    private buildGroupItems(options: OptionValue[], previousItem?: OptionItem):
        OptionItem[]
    {
        let previousGroupId = previousItem && previousItem.group;

        const list = this.buildItems(options).reduce((items: OptionItem[], item) => {
            if (item.group !== previousGroupId) {
                const groupId = item.group as StrictOptionId;
                const groupLabel = this.state.groups.get(groupId) as string;

                items.push({
                    id: groupId,
                    text: groupLabel,
                    isGroup: true,
                    disabled: false,
                    selected: false,
                });

                previousGroupId = groupId;
            }

            items.push(item);

            return items;
        }, []);

        return list;
    }

    private buildOptionBehavior(optionBehavior: string, state: SelecticStoreState) {
        let [operation, order] = optionBehavior.split('-');
        let isValid = true;
        let orderArray: OptionBehaviorOrder[];

        isValid = isValid && ['sort', 'force'].includes(operation);
        isValid = isValid && /^[ODE]+$/.test(order);

        if (!isValid) {
            this.state.status.errorMessage = this.labels.unknownPropertyValue.replace(/%s/, 'optionBehavior');
            operation = 'sort';
            orderArray = ['O', 'D', 'E'];
        } else {
            order += 'ODE';

            orderArray = order.split('') as OptionBehaviorOrder[];
            /* Keep only one letter for each of them */
            orderArray = Array.from(new Set(orderArray));
        }

        state.optionBehaviorOperation = operation as OptionBehaviorOperation;
        state.optionBehaviorOrder = orderArray;
    }

    private nbGroups(items: OptionItem[]) {
        return items.reduce((nb, item) => +item.isGroup + nb, 0);
    }

    private checkAutoSelect() {
        const state = this.state;
        const isAutoSelectActive = state.autoSelect && !state.allowClearSelection
                                && state.internalValue === null;

        if (!isAutoSelectActive || state.isOpen) {
            return;
        }
        const options = state.allOptions;

        for (const option of options) {
            if (!option.disabled) {
                this.selectItem(option.id, true, true);
                return;
            }
        }
    }

    private checkAutoDisabled() {
        const state = this.state;
        const doNotCheck = this.disabled || this.isPartial || !state.autoDisabled;

        if (doNotCheck || !this.hasFetchedAllItems) {
            return;
        }

        const enabledOptions = state.allOptions.filter((opt) => !opt.disabled);
        const nb = enabledOptions.length;
        const value = state.internalValue;
        const hasValue = Array.isArray(value) ? value.length > 0 : value !== null;
        const isEmpty = nb === 0;
        const hasOnlyOneOption = nb === 1 && hasValue && !state.allowClearSelection;

        if (hasOnlyOneOption || isEmpty) {
            this.commit('isOpen', false);
            this.commit('disabled', true);
        } else {
            this.commit('disabled', false);
        }
    }

    private checkHideFilter() {
        if (this.params && this.params.hideFilter !== 'auto') {
            return;
        }

        const state = this.state;

        if (state.multiple || this.isPartial) {
            state.hideFilter = false;
        } else {
            state.hideFilter = state.totalAllOptions <= this.itemsPerPage;
        }
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('options')
    protected onOptionsChange() {
        this.cacheItem.clear();
        this.buildAllOptions();
        this.assertCorrectValue();
        this.buildSelectedOptions();
    }

    @Watch('childOptions')
    protected onChildOptionsChange() {
        this.cacheItem.clear();
        this.buildAllOptions();
        this.assertCorrectValue();
        this.buildSelectedOptions();
    }

    @Watch('value')
    protected onValueChange() {
        const value = typeof this.value === 'undefined' ? null : this.value;
        this.commit('internalValue', value);
    }

    @Watch('selectionIsExcluded')
    protected onSelectionExcludedChange() {
        this.commit('selectionIsExcluded', this.selectionIsExcluded);
    }

    @Watch('disabled')
    protected onDisabledChange() {
        this.commit('disabled', this.disabled);
    }

    @Watch('state.filteredOptions')
    protected onFilteredChange() {
        let areAllSelected = false;

        if (this.hasAllItems) {
            const selectionIsExcluded = +this.state.selectionIsExcluded;
            // tslint:disable-next-line:no-bitwise
            areAllSelected = this.state.filteredOptions.every((item) => !!(+item.selected ^ selectionIsExcluded));
        }

        this.state.status.areAllSelected = areAllSelected;
    }

    @Watch('state.internalValue')
    protected onInternalValueChange() {
        this.buildSelectedOptions();
    }

    @Watch('state.allOptions')
    protected onAllOptionChange() {
        this.checkAutoSelect();
        this.checkAutoDisabled();
    }

    @Watch('state.totalAllOptions')
    protected onTotalAllOptionsChange() {
        this.checkHideFilter();
    }

    /* }}} */
    /* {{{ life cycles methods */

    protected created() {
        const value = typeof this.value === 'undefined' ? null : this.value;

        /* set initial value for non reactive attribute */
        this.requestId = 0;
        this.cacheRequest = new Map();

        const stateParam = Object.assign({}, this.params);

        if (stateParam.optionBehavior) {
            this.buildOptionBehavior(stateParam.optionBehavior, stateParam as SelecticStoreState);
            delete stateParam.optionBehavior;
        }

        this.state = Object.assign(this.state, stateParam, {
            internalValue: value,
            selectionIsExcluded: this.selectionIsExcluded,
            disabled: this.disabled,
        });

        this.checkHideFilter();

        if (this.texts) {
            this.changeTexts(this.texts);
        }

        this.addGroups(this.groups);
        this.buildAllOptions();
        this.assertCorrectValue();
        this.buildSelectedOptions();
    }

    /* }}} */
}
