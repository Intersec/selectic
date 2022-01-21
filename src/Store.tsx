/* File Purpose:
 * It keeps and computes all states at a single place.
 * Every inner components of Selectic should communicate with this file to
 * change or to get states.
 */

import { reactive, watch, unref, computed, ComputedRef } from 'vue';
import { convertToRegExp, assignObject } from './tools';

/* {{{ Types definitions */

type MandateProps<T extends {}> = {
    [TK in keyof T]-?: T[TK];
}

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
    /* Display the list at bottom but if there is not enough space, display it at top */
  | 'auto';

export type HideFilter =
    /* Display or hide the filter panel */
    boolean
    /* The handler to open the filter panel is hidden only if there is less
     * than 10 options */
  | 'auto'
    /* The panel filter is always open */
  | 'open';

export interface SelecticStoreStateParams {
    /* Equivalent of <select>'s "multiple" attribute */
    multiple?: boolean;

    /* Equivalent of <input>'s "placeholder" attribute */
    placeholder?: string;

    /* Hide filter component when enabled */
    hideFilter?: HideFilter;

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

    /* Indicate where the list should be deployed */
    listPosition?: ListPosition;

    /* If true, the component is open at start */
    isOpen?: boolean;
}

export interface Props {
    /* Selected value */
    value?: SelectedValue | null;

    /* If true, the value represents the ones we don't want to select */
    selectionIsExcluded?: boolean;

    /* Equivalent of "disabled" Select's attribute */
    disabled?: boolean;

    /* List of options to display */
    options?: OptionProp[] | null;

    /* List of options to display from child elements */
    childOptions?: OptionValue[];

    /* Define groups which will be used by items */
    groups?: GroupValue[];

    /* Overwrite default texts */
    texts?: PartialMessages | null;

    /* Keep this component open if another Selectic component opens */
    keepOpenWithOtherSelectic?: boolean;

    /* Selectic configuration */
    params?: SelecticStoreStateParams;

    /* Method to call to fetch extra data */
    fetchCallback?: FetchCallback | null;

    /* Method to call to get specific item */
    getItemsCallback?: GetCallback | null;
}

type InternalProps = MandateProps<Props>;

export interface Data {
    /* Number of items displayed in a page (before scrolling) */
    itemsPerPage: number;

    labels: Messages;
    /* used to avoid checking and updating table while doing batch stuff */
    doNotUpdate: boolean;
    cacheItem: Map<OptionId, OptionValue>;
    activeOrder: OptionBehaviorOrder;
    dynOffset: number;
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

    /* If true, the filter panel is always open */
    keepFilterOpen: boolean;

    /* Allow to reverse selection.
     * If true, parent should support the selectionIsExcluded property.
     * If false, the action is never available.
     * If undefined, the action is available only when it is not needed to
     * change selectionIsExcluded property.
     */
    allowRevert?: boolean;

    /* If true, user can clear current selection
     * (if false, it is still possible to clear it programmatically) */
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

        /* If true, it means the current change has been done automatically by Selectic */
        automaticChange: boolean;

        /* If true, it means the current close has been done automatically by Selectic */
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

export type PartialMessages = { [K in keyof Messages]?: Messages[K] };

/* }}} */
/* {{{ Static */

export function changeTexts(texts: PartialMessages) {
    messages = Object.assign(messages, texts);
}

/* }}} */

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

/* }}} */

let uid = 0;

export default class SelecticStore {
    public props: InternalProps;

    /* {{{ data */

    public state: SelecticStoreState;
    public data: Data;

    /* Do not need reactivity */
    private requestId: number = 0;
    private cacheRequest: Map<string, Promise<OptionValue[]>>;
    private closeSelectic: () => void;

    /* }}} */
    /* {{{ computed */

    /* Number of item to pre-display */
    public marginSize: ComputedRef<number>;

    public isPartial: ComputedRef<boolean>;
    public hasAllItems: ComputedRef<boolean>;
    public hasFetchedAllItems: ComputedRef<boolean>;
    private listOptions: ComputedRef<OptionValue[]>;
    private elementOptions: ComputedRef<OptionValue[]>;

    /* }}} */

    public _uid: number; /* Mainly for debugging */

    constructor(props: Props = {}) {
        this._uid = ++uid;

        /* {{{ Props */

        const defaultProps: InternalProps = {
            value: null,
            selectionIsExcluded: false,
            disabled: false,
            options: null,
            childOptions: [],
            groups: [],
            texts: null,
            params: {},
            fetchCallback: null,
            getItemsCallback: null,
            keepOpenWithOtherSelectic: false,
        };
        const propsVal: InternalProps = assignObject(defaultProps, props);
        this.props = reactive(propsVal);

        /* }}} */
        /* {{{ data */

        this.state = reactive<SelecticStoreState>({
            multiple: false,
            disabled: false,
            placeholder: '',
            hideFilter: false,
            keepFilterOpen: false,
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
                automaticChange: false,
                automaticClose: false,
            },
        });

        this.data = reactive({
            labels: Object.assign({}, messages),
            itemsPerPage: 10,
            doNotUpdate: false,
            cacheItem: new Map(),
            activeOrder: 'D',
            dynOffset: 0,
        });

        /* }}} */
        /* {{{ computed */

        this.marginSize = computed(() => {
            return this.state.pageSize / 2;
        });

        this.isPartial = computed(() => {
            const state = this.state;
            let isPartial =  typeof this.props.fetchCallback === 'function';

            if (isPartial &&
                state.optionBehaviorOperation === 'force' &&
                this.data.activeOrder !== 'D'
            ) {
                isPartial = false;
            }

            return isPartial;
        });

        this.hasAllItems = computed(() => {
            const state = this.state;
            const nbItems = state.totalFilteredOptions + state.groups.size;

            return this.state.filteredOptions.length >= nbItems;
        });

        this.hasFetchedAllItems = computed(() => {
            const isPartial = unref(this.isPartial);

            if (!isPartial) {
                return true;
            }
            const state = this.state;

            return state.dynOptions.length === state.totalDynOptions;
        });

        this.listOptions = computed(() => {
            return this.getListOptions();
        });

        this.elementOptions = computed(() => {
            return this.getElementOptions();
        });

        /* }}} */
        /* {{{ watch */

        watch(() => [this.props.options, this.props.childOptions], () => {
            this.data.cacheItem.clear();
            this.setAutomaticClose();
            this.commit('isOpen', false);
            this.buildAllOptions(true);
            this.buildSelectedOptions();
        }, { deep: true });

        watch(() => [this.listOptions, this.elementOptions], () => {
            /* TODO: transform allOptions as a computed properties and this
             * watcher become useless */
            this.buildAllOptions(true);
        }, { deep: true });

        watch(() => this.props.value, () => {
            const value = this.props.value ?? null;
            this.commit('internalValue', value);
        }, { deep: true });

        watch(() => this.props.selectionIsExcluded, () => {
            this.commit('selectionIsExcluded', this.props.selectionIsExcluded);
        });

        watch(() => this.props.disabled, () => {
            this.commit('disabled', this.props.disabled);
        });

        watch(() => this.state.filteredOptions, () => {
            let areAllSelected = false;
            const hasAllItems = unref(this.hasAllItems);

            if (hasAllItems) {
                const selectionIsExcluded = +this.state.selectionIsExcluded;
                /* eslint-disable-next-line no-bitwise */
                areAllSelected = this.state.filteredOptions.every((item) =>
                    !!(+item.selected ^ selectionIsExcluded));
            }

            this.state.status.areAllSelected = areAllSelected;
        }, { deep: true });

        watch(() => this.state.internalValue, () => {
            this.buildSelectedOptions();
        }, { deep: true });

        watch(() => this.state.allOptions, () => {
            this.checkAutoSelect();
            this.checkAutoDisabled();
        }, { deep: true });

        watch(() => this.state.totalAllOptions, () => {
            this.checkHideFilter();
        });

        /* }}} */

        this.closeSelectic = () => {
            this.setAutomaticClose();
            this.commit('isOpen', false);
        }

        const value = this.props.value;

        /* set initial value for non reactive attribute */
        this.cacheRequest = new Map();

        const stateParam: SelecticStoreStateParams | SelecticStoreState =
            Object.assign({}, this.props.params);

        if (stateParam.optionBehavior) {
            this.buildOptionBehavior(
                stateParam.optionBehavior,
                stateParam as SelecticStoreState
            );
            delete stateParam.optionBehavior;
        }

        if (stateParam.hideFilter === 'auto') {
            delete stateParam.hideFilter;
        } else if (stateParam.hideFilter === 'open') {
            this.state.keepFilterOpen = true;
            delete stateParam.hideFilter;
        }

        /* Update state */
        assignObject(this.state, stateParam as SelecticStoreState);
        /* XXX: should be done in 2 lines, in order to set the multiple state
         * and ensure convertValue run with correct state */
        assignObject(this.state, {
            internalValue: this.convertTypeValue(value),
            selectionIsExcluded: !!this.props.selectionIsExcluded,
            disabled: !!this.props.disabled, /* XXX: !! is needed to copy value and not proxy reference */
        });

        this.checkHideFilter();

        if (this.props.texts) {
            this.changeTexts(this.props.texts);
        }

        this.addGroups(this.props.groups);
        this.assertValueType();
        this.buildAllOptions();

        this.buildSelectedOptions();
        this.checkAutoDisabled();
    }

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
                if (!this.props.keepOpenWithOtherSelectic) {
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
                this.setAutomaticClose();
                this.commit('isOpen', false);
            }
            break;
        }
    }

    public setAutomaticChange() {
        this.state.status.automaticChange = true;
        setTimeout(() => this.state.status.automaticChange = false, 0);
    }

    public setAutomaticClose() {
        this.state.status.automaticClose = true;
        setTimeout(() => this.state.status.automaticClose = false, 0);
    }

    public getItem(id: OptionId): OptionValue {
        let item: OptionValue;

        if (this.hasItemInStore(id)) {
            item = this.data.cacheItem.get(id) as OptionValue;
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
        const getItemsCallback = this.props.getItemsCallback;

        if (itemsToFetch.length && typeof getItemsCallback === 'function') {
            const cacheRequest = this.cacheRequest;
            const requestId = itemsToFetch.toString();
            let promise: Promise<OptionValue[]>;

            if (cacheRequest.has(requestId)) {
                promise = cacheRequest.get(requestId)!;
            } else {
                promise = getItemsCallback(itemsToFetch);
                cacheRequest.set(requestId, promise);
                promise.then(() => {
                    cacheRequest.delete(requestId);
                });
            }

            const items = await promise;
            const cacheItem = this.data.cacheItem;

            for (const item of items) {
                if (item) {
                    cacheItem.set(item.id, item);
                }
            }
        }

        return this.buildSelectedItems(ids);
    }

    public selectItem(id: OptionId, selected?: boolean, keepOpen = false) {
        const state = this.state;
        let hasChanged = false;
        const isPartial = unref(this.isPartial);

        /* Check that item is not disabled */
        if (!isPartial) {
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

            if (keepOpen) {
                /* if keepOpen is true it means that it is an automatic change */
                this.setAutomaticChange();
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
        const hasAllItems = unref(this.hasAllItems);

        if (!hasAllItems) {
            const labels = this.data.labels;

            if (this.state.searchText) {
                this.state.status.errorMessage = labels.cannotSelectAllSearchedItems;
                return;
            }

            if (!this.state.allowRevert) {
                this.state.status.errorMessage = labels.cannotSelectAllRevertItems;
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
        this.data.doNotUpdate = true;
        this.state.filteredOptions.forEach((item) => this.selectItem(item.id, selectAll));
        this.data.doNotUpdate = false;
        this.updateFilteredOptions();
    }

    public resetChange() {
        this.state.status.hasChanged = false;
    }

    public resetErrorMessage() {
        this.state.status.errorMessage = '';
    }

    public clearCache(forceReset = false) {
        const isPartial = unref(this.isPartial);
        const total = isPartial ? Infinity : 0;

        this.data.cacheItem.clear();

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
        this.data.labels = Object.assign({}, this.data.labels, texts);
    }

    /* }}} */
    /* {{{ private methods */

    private hasValue(id: OptionId): boolean {
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
            unref(this.listOptions).find(findId) ||
            unref(this.elementOptions).find(findId);
    }

    private convertTypeValue(oldValue: OptionId | StrictOptionId[]) {
        const state = this.state;
        const isMultiple = state.multiple;
        let newValue = oldValue;

        if (isMultiple) {
            if (!Array.isArray(oldValue)) {
                newValue = oldValue === null ? [] : [oldValue];
            }
        } else {
            if (Array.isArray(oldValue)) {
                const value = oldValue[0];
                newValue = typeof value === 'undefined' ? null : value;
            }
        }
        return newValue;
    }

    private assertValueType() {
        const state = this.state;
        const internalValue = state.internalValue;
        const newValue = this.convertTypeValue(internalValue);

        if (newValue !== internalValue) {
            this.setAutomaticChange();
            state.internalValue = newValue;
        }
    }

    private assertCorrectValue(applyStrict = false) {
        const state = this.state;
        this.assertValueType();
        const internalValue = state.internalValue;
        const selectionIsExcluded = state.selectionIsExcluded;
        const isMultiple = state.multiple;
        const checkStrict = state.strictValue;
        let newValue = internalValue;
        const isPartial = unref(this.isPartial);

        if (isMultiple) {
            const hasFetchedAllItems = unref(this.hasFetchedAllItems);

            if (selectionIsExcluded && hasFetchedAllItems) {
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
            state.selectionIsExcluded = false;
        }

        if (checkStrict) {
            let isDifferent = false;
            let filteredValue: SelectedValue;

            if (isMultiple) {
                filteredValue = (newValue as StrictOptionId[])
                    .filter((value) => this.hasItemInStore(value));
                isDifferent = filteredValue.length !== (newValue as StrictOptionId[]).length;

                if (isDifferent && isPartial && !applyStrict) {
                    this.getItems(newValue as StrictOptionId[])
                        .then(() => this.assertCorrectValue(true));
                    return;
                }
            } else
            if (newValue !== null && !this.hasItemInStore(newValue as OptionId)) {
                filteredValue = null;
                isDifferent = true;

                if (isPartial && !applyStrict) {
                    this.getItems([newValue as OptionId])
                        .then(() => this.assertCorrectValue(true));
                    return;
                }
            }

            if (isDifferent) {
                this.setAutomaticChange();
                newValue = filteredValue!;
            }
        }

        state.internalValue = newValue;

        if (state.autoSelect && newValue === null) {
            this.checkAutoSelect();
        }
    }

    private updateFilteredOptions() {
        if (!this.data.doNotUpdate) {
            this.state.filteredOptions = this.buildItems(this.state.filteredOptions);
            this.buildSelectedOptions();
        }
    }

    private addGroups(groups: GroupValue[]) {
        groups.forEach((group) => {
            this.state.groups.set(group.id, group.text);
        });
    }

    /* This method is for the computed property listOptions */
    private getListOptions(): OptionValue[] {
        const options = this.props.options;
        const listOptions: OptionValue[] = [];

        if (!Array.isArray(options)) {
            return listOptions;
        }
        const state = this.state;

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
            if (group && !state.groups.has(group)) {
                state.groups.set(group, String(group));
            }

            /* check for sub options */
            if (subOptions) {
                const groupId = option.id as StrictOptionId;
                state.groups.set(groupId, option.text);

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

    /* This method is for the computed property elementOptions */
    private getElementOptions(): OptionValue[] {
        const options = this.props.childOptions;
        const childOptions: OptionValue[] = [];

        if (!Array.isArray(options) || options.length === 0) {
            return childOptions;
        }
        const state = this.state;

        options.forEach((option) => {
            const group = option.group;
            const subOptions = option.options;

            /* check for groups */
            if (group && !state.groups.has(group)) {
                state.groups.set(group, String(group));
            }

            /* check for sub options */
            if (subOptions) {
                const groupId = option.id as StrictOptionId;
                state.groups.set(groupId, option.text);

                const sOpts: OptionValue[] = subOptions.map((subOpt) => {
                    return Object.assign({}, subOpt, {
                        group: groupId,
                    });
                });
                childOptions.push(...sOpts);
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
        const isPartial = unref(this.isPartial);

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
            if (isPartial) {
                this.state.totalAllOptions = Infinity;
                this.state.totalDynOptions = Infinity;
            } else {
                this.state.totalDynOptions = 0;
            }
        }

        listOptions = unref(this.listOptions);
        elementOptions = unref(this.elementOptions);

        if (this.state.optionBehaviorOperation === 'force') {
            const orderValue = optionBehaviorOrder.find((value) => lengthFromOrder(value) > 0)!;
            allOptions.push(...arrayFromOrder(orderValue));
            length = lengthFromOrder(orderValue);
            this.data.activeOrder = orderValue;
            this.data.dynOffset = 0;
        } else {
            /* sort */
            let offset = 0;
            for (const orderValue of optionBehaviorOrder) {
                const list = arrayFromOrder(orderValue);
                const lngth = lengthFromOrder(orderValue);

                if (orderValue === 'D') {
                    this.data.dynOffset = offset;
                } else {
                    offset += lngth;
                }

                allOptions.push(...list);
                if (list.length < lngth) {
                    /* All dynamic options are not fetched yet */
                    break;
                }
            }
            this.data.activeOrder = 'D';
            length = optionBehaviorOrder.reduce((total, orderValue) => total + lengthFromOrder(orderValue), 0);
        }

        this.state.allOptions = allOptions;

        if (keepFetched) {
            this.state.totalAllOptions = length;
        } else {
            if (!isPartial) {
                this.state.totalAllOptions = allOptions.length;
            }
        }

        this.state.filteredOptions = [];
        this.state.totalFilteredOptions = Infinity;

        this.buildFilteredOptions().then(() => {
            /* XXX: To recompute for strict mode and auto-select */
            this.assertCorrectValue();
        });
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
        const hasAllItems = unref(this.hasAllItems);

        if (hasAllItems) {
            /* Everything has already been fetched and stored in filteredOptions */
            return;
        }

        const hasFetchedAllItems = unref(this.hasFetchedAllItems);
        /* Check if all options have been fetched */
        if (hasFetchedAllItems) {
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
        const marginSize = unref(this.marginSize);
        const endIndex = offsetItem + marginSize;

        if (endIndex <= filteredOptionsLength) {
            return;
        }

        if (!search && endIndex <= allOptionsLength) {
            this.state.filteredOptions = this.buildGroupItems(allOptions);
            this.state.totalFilteredOptions = totalAllOptions + this.state.groups.size;
            const isPartial = unref(this.isPartial);
            if (isPartial && this.state.totalDynOptions === Infinity) {
                this.fetchData();
            }
            return;
        }

        if (filteredOptionsLength === 0 && this.state.optionBehaviorOperation === 'sort') {
            this.addStaticFilteredOptions();

            filteredOptionsLength = this.state.filteredOptions.length;
            this.data.dynOffset = filteredOptionsLength;
            if (endIndex <= filteredOptionsLength) {
                return;
            }
        }

        await this.fetchData();
    }

    private async buildSelectedOptions() {
        const internalValue = this.state.internalValue;
        const state = this.state;

        if (state.multiple) {
            /* display partial information about selected items */
            state.selectedOptions = this.buildSelectedItems(internalValue as StrictOptionId[]);

            const items: OptionItem[] = await this.getItems(internalValue as StrictOptionId[]).catch(() => []);
            if (internalValue !== state.internalValue) {
                /* Values have been deprecated */
                return;
            }

            if (items.length !== (internalValue as StrictOptionId[]).length) {
                if (!state.strictValue) {
                    const updatedItems = state.selectedOptions.map((option) => {
                        const foundItem = items.find((item) => item.id === option.id);

                        return foundItem || option;
                    });

                    state.selectedOptions = updatedItems;
                } else {
                    const itemIds = items.map((item) => item.id as StrictOptionId) ;

                    this.setAutomaticChange();
                    this.commit('internalValue', itemIds);
                }
                return;
            }

            /* display full information about selected items */
            state.selectedOptions = items;
        } else
        if (internalValue === null) {
            state.selectedOptions = null;
        } else {
            /* display partial information about selected items */
            state.selectedOptions = this.buildSelectedItems([internalValue as OptionId])[0];

            const items = await this.getItems([internalValue as OptionId]).catch(() => []);
            if (internalValue !== state.internalValue) {
                /* Values have been deprecated */
                return;
            }

            if (!items.length) {
                if (state.strictValue) {
                    this.setAutomaticChange();
                    this.commit('internalValue', null);
                }
                return;
            }

            /* display full information about selected items */
            state.selectedOptions = items[0];
        }
    }

    private async fetchData() {
        const state = this.state;
        const labels = this.data.labels;
        const fetchCallback = this.props.fetchCallback;

        if (!fetchCallback) {
            state.status.errorMessage = labels.noFetchMethod;
            return;
        }

        const search = state.searchText;
        const filteredOptionsLength = state.filteredOptions.length;
        const offsetItem = state.offsetItem;
        const pageSize = state.pageSize;
        const marginSize = unref(this.marginSize);
        const endIndex = offsetItem + marginSize;
        const dynOffset = this.data.dynOffset;

        /* Run the query */
        this.state.status.searching = true;

        /* Manage cases where offsetItem is not equal to the last item received */
        const offset = filteredOptionsLength - this.nbGroups(state.filteredOptions) - dynOffset;
        const nbItems = endIndex - offset;
        const limit = Math.ceil(nbItems / pageSize) * pageSize;

        try {
            const requestId = ++this.requestId;
            const {total: rTotal, result} = await fetchCallback(search, offset, limit);
            let total = rTotal;

            /* Assert result is correctly formatted */
            if (!Array.isArray(result)) {
                throw new Error(labels.wrongFormattedData);
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
                setTimeout(() => this.buildAllOptions(true), 0);
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

                state.filteredOptions.splice(offset + dynOffset, limit + nbGroups1, ...options);
            }

            let nbGroups = state.groups.size;
            if (offset + limit >= total) {
                nbGroups = this.nbGroups(state.filteredOptions);
            }

            state.totalFilteredOptions = total + nbGroups + dynOffset;

            if (search && state.totalFilteredOptions <= state.filteredOptions.length) {
                this.addStaticFilteredOptions(true);
            }

            state.status.errorMessage = '';
        } catch (e) {
            state.status.errorMessage = (e as Error).message;
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
                    options = this.filterOptions(unref(this.listOptions), search);
                    break;
                case 'E':
                    options = this.filterOptions(unref(this.elementOptions), search);
                    break;
            }
            this.state.filteredOptions.push(...options);
            this.state.totalFilteredOptions += options.length;
        }
    }

    private buildSelectedItems(ids: OptionId[]): OptionItem[] {
        return this.buildItems(ids.map((id) => {
            const cacheItem = this.data.cacheItem;
            const item = cacheItem.get(id);

            return item || {
                id,
                text: String(id),
            };
        }));
    }

    private hasItemInStore(id: OptionId): boolean {
        const cacheItem = this.data.cacheItem;
        let item: OptionValue | undefined = cacheItem.get(id);

        if (!item) {
            item = this.getValue(id);

            if (item) {
                cacheItem.set(item.id, item);
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
                /* eslint-disable-next-line no-bitwise */
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
            const labels = this.data.labels;
            this.state.status.errorMessage = labels.unknownPropertyValue.replace(/%s/, 'optionBehavior');
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
                this.checkAutoDisabled();
                return;
            }
        }
    }

    private checkAutoDisabled() {
        const state = this.state;
        const isPartial = unref(this.isPartial);
        const doNotCheck = isPartial || this.props.disabled || !state.autoDisabled;
        const hasFetchedAllItems = unref(this.hasFetchedAllItems);

        if (doNotCheck || !hasFetchedAllItems) {
            return;
        }

        const enabledOptions = state.allOptions.filter((opt) => !opt.disabled);
        const nb = enabledOptions.length;
        const value = state.internalValue;
        const hasValue = Array.isArray(value) ? value.length > 0 : value !== null;
        const hasValidValue = hasValue && (
            Array.isArray(value) ? value.every((val) => this.hasValue(val)) :
            this.hasValue(value)
        );
        const isEmpty = nb === 0;
        const hasOnlyOneOption = nb === 1 && hasValidValue && !state.allowClearSelection;

        if (hasOnlyOneOption || isEmpty) {
            if (state.isOpen) {
                this.setAutomaticClose();
                this.commit('isOpen', false);
            }
            this.commit('disabled', true);
        } else {
            this.commit('disabled', false);
        }
    }

    private checkHideFilter() {
        const params = this.props.params;
        if (params && params.hideFilter !== 'auto') {
            return;
        }

        const state = this.state;
        const isPartial = unref(this.isPartial);

        if (state.multiple || isPartial) {
            state.hideFilter = false;
        } else {
            state.hideFilter = state.totalAllOptions <= this.data.itemsPerPage;
        }
    }

    /* }}} */
    /* }}} */

};
