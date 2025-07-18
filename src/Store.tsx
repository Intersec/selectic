/* File Purpose:
 * It keeps and computes all states at a single place.
 * Every inner components of Selectic should communicate with this file to
 * change or to get states.
 */

import { reactive, watch, unref, computed, ComputedRef } from 'vue';
import {
    assignObject,
    isDeepEqual,
    convertToRegExp,
    debug,
    deepClone,
} from './tools';

/* For debugging */
debug.enable(false);

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
    exclusive?: boolean;

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

export type RequestResult = {
    /** The total number of expecting options.
     * Needed to know if there are more items to fetch, and to size the scrollbar.
     */
    total: number;

    /** The list of the options. */
    result: OptionValue[];
};

/** false means that the request is deprecated */
type FetchResult = RequestResult & { deprecated: boolean; } | false;

export type FetchCallback = (_search: string, _offsetItem: number, _pageSize: number)
    => Promise<RequestResult>;

export type GetCallback = (_ids: OptionId[])
    => Promise<OptionValue[]>;

export type FormatCallback = (_option: OptionItem) => OptionItem;

export type SelectionOverflow =
    /** Items are reduced in width and an ellipsis is displayed in their name. */
    'collapsed'
    /* The container extends in height in order to display all items. */
  | 'multiline';

export type ListPosition =
    /** Display the list at bottom */
    'bottom'
    /** Display the list at bottom */
  | 'top'
    /** Display the list at bottom but if there is not enough space, display it at top */
  | 'auto';

export type HideFilter =
    /** Display or hide the filter panel */
    boolean
    /** The handler to open the filter panel is hidden only if there is less
     * than 10 options */
  | 'auto'
    /** The panel filter is always open */
  | 'open';

export type SelectAllOption =
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

type InternalProps = MandateProps<Props>;

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

export type IconFamily = ''
    | 'selectic'
    | 'font-awesome-4'
    | 'font-awesome-5'
    | 'font-awesome-6'
    | 'raw'
    | `prefix:${string}`
;

export type IconKey =
    | 'caret-down'
    | 'caret-up'
    | 'check'
    | 'dot'
    | 'search'
    | 'spinner'
    | 'strikethrough'
    | 'times'
    | 'question'
    | 'spin'
;

export type IconValue =
    | `selectic:${IconKey}${'' | ':spin'}`
    | `raw:${string}`
    | `current:${IconKey}${'' | ':spin'}`
    | string
;
export type Icons = Record<IconKey, IconValue>;
export type PartialIcons = { [K in IconKey]?: Icons[K] };

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

export type PartialMessages = { [K in keyof Messages]?: Messages[K] };

/* }}} */
/* {{{ Static */

export function changeTexts(texts: PartialMessages) {
    messages = Object.assign(messages, texts);
}

export function changeIcons(newIcons: PartialIcons, newFamilyIcon?: IconFamily) {
    icons = Object.assign(icons, newIcons);

    if (newFamilyIcon) {
        defaultFamilyIcon = newFamilyIcon;
    }
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
    wrongQueryResult: 'Query did not return all results.',
};

let defaultFamilyIcon: IconFamily = 'selectic';
let icons: PartialIcons = {
};

let closePreviousSelectic: undefined | voidCaller;

/**
 * Time to wait before considering there is no other requests.
 * This time is await only if there is already a requested request.
 */
const DEBOUNCE_REQUEST = 250;

/* }}} */

let uid = 0;

export default class SelecticStore {
    public props: InternalProps;

    /* {{{ data */

    public state: SelecticStoreState;
    public data: Data;

    /* Do not need reactivity */
    private requestId: number = 0;
    private requestSearchId: number = 0; /* Used for search request */
    private isRequesting: boolean = false;
    private cacheRequest: Map<string, Promise<OptionValue[]>>;
    private closeSelectic: () => void;

    /* }}} */
    /* {{{ computed */

    /** Number of item to pre-display */
    public marginSize: ComputedRef<number>;

    /** If true, it is possible to click on group to select all items inside */
    public allowGroupSelection: ComputedRef<boolean>;

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
            icons: null,
            iconFamily: null,
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
            activeItemIdx: -1,
            allOptions: [],
            allowClearSelection: false,
            allowRevert: undefined,
            autoDisabled: true,
            autoSelect: true,
            disabled: false,
            disableGroupSelection: false,
            dynOptions: [],
            filteredOptions: [],
            forceSelectAll: 'auto',
            groups: new Map(),
            hideFilter: false,
            internalValue: null,
            isOpen: false,
            keepFilterOpen: false,
            listPosition: 'auto',
            multiple: false,
            offsetItem: 0,
            optionBehaviorOperation: 'sort',
            optionBehaviorOrder: ['O', 'D', 'E'],
            pageSize: 100,
            placeholder: '',
            searchText: '',
            selectedOptions: null,
            selectionIsExcluded: false,
            selectionOverflow: 'collapsed',
            strictValue: false,
            totalAllOptions: Infinity,
            totalDynOptions: Infinity,
            totalFilteredOptions: Infinity,

            status: {
                areAllSelected: false,
                automaticChange: false,
                automaticClose: false,
                errorMessage: '',
                hasChanged: false,
                searching: false,
            },
        });

        this.data = reactive({
            labels: Object.assign({}, messages),
            icons: Object.assign({}, icons),
            iconFamily: defaultFamilyIcon,
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

        this.allowGroupSelection = computed(() => {
            return this.state.multiple && !this.isPartial.value && !this.state.disableGroupSelection;
        });

        /* }}} */
        /* {{{ watch */

        watch(() => [this.props.options, this.props.childOptions], () => {
            this.data.cacheItem.clear();
            this.setAutomaticClose();
            this.commit('isOpen', false);
            this.clearDisplay();
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
            /* If there is only one item, and the previous selected value was
             * different, then if we change it to the only available item we
             * should disable Selectic (user has no more choice).
             * This is why it is needed to check autoDisabled here. */
            this.checkAutoDisabled();
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

        const value = deepClone(this.props.value);

        /* set initial value for non reactive attribute */
        this.cacheRequest = new Map();

        const stateParam: SelecticStoreStateParams | SelecticStoreState =
            deepClone(this.props.params, ['data']);

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
        if (this.props.icons || this.props.iconFamily) {
            this.changeIcons(this.props.icons, this.props.iconFamily);
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

        debug('commit', 'start', name, value, 'oldValue:', oldValue);

        if (oldValue === value) {
            return;
        }

        this.state[name] = value;

        switch (name) {
          case 'searchText':
            this.state.offsetItem = 0;
            this.state.activeItemIdx = -1;
            this.clearDisplay();

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
        debug('commit', '(done)', name);
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

    public selectGroup(id: OptionId, itemsSelected: boolean) {
        const state = this.state;

        if (!unref(this.allowGroupSelection)) {
            return;
        }

        const selectItem = this.selectItem.bind(this);
        let hasChanged = false;
        this.data.doNotUpdate = true;
        const items = state.filteredOptions.filter((item) => {
            const isInGroup = item.group === id && !item.exclusive && !item.disabled;

            if (isInGroup) {
                hasChanged = selectItem(item.id, itemsSelected, true) || hasChanged;
            }

            return isInGroup;
        });
        this.data.doNotUpdate = false;

        if (hasChanged && items.length) {
            this.updateFilteredOptions();
        }

        return;
    }

    public selectItem(id: OptionId, selected?: boolean, keepOpen = false): boolean {
        const state = this.state;
        let hasChanged = false;
        const item = state.allOptions.find((opt) => opt.id === id);

        /* Check that item is not disabled */
        if (item?.disabled) {
            return hasChanged;
        }

        if (state.strictValue && !this.hasValue(id)) {
            /* reject invalid values */
            return hasChanged;
        }

        if (state.multiple) {
            /* multiple = true */
            const internalValue = state.internalValue as StrictOptionId[];
            const isAlreadySelected = (internalValue as OptionId[]).includes(id);

            if (selected === undefined) {
                selected = !isAlreadySelected;
            }

            const selectedOptions = Array.isArray(state.selectedOptions)
                ? state.selectedOptions
                : [];

            if (id === null) {
                /* Keep disabled items: we cannot removed them because they
                 * are disabled */
                const newSelection = selectedOptions.reduce((list, item) => {
                    if (item.disabled && item.id) {
                        list.push(item.id);
                    }

                    return list;
                }, [] as StrictOptionId[]);

                state.internalValue = newSelection;
                hasChanged = internalValue.length > newSelection.length;
            } else
            if (selected && !isAlreadySelected) {
                let addItem = true;

                if (item?.exclusive) {
                    const hasDisabledSelected = selectedOptions.some((opt) => {
                        return opt.disabled;
                    });

                    if (hasDisabledSelected) {
                        /* do not remove disabled item from selection */
                        addItem = false;
                    } else {
                        /* clear the current selection because the item is exclusive */
                        internalValue.splice(0, Infinity);
                    }
                } else if (internalValue.length === 1) {
                    const selectedId = internalValue[0];
                    const selectedItem = state.allOptions.find((opt) => opt.id === selectedId);

                    if (selectedItem?.exclusive) {
                        if (selectedItem.disabled) {
                            /* If selected item is disabled and exclusive do not change the selection */
                            addItem = false;
                        } else {
                            /* clear the current selection because the old item was exclusive */
                            internalValue.pop();
                        }
                    }
                }

                if (addItem) {
                    internalValue.push(id);
                    hasChanged = true;
                }
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
                    return hasChanged;
                }

                const oldOption = state.selectedOptions as OptionItem | null;

                if (oldOption?.disabled) {
                    /* old selection is disabled so do not unselect it */
                    return hasChanged;
                }

                id = null;
            } else
            if (id === oldValue) {
                return hasChanged;
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

        return hasChanged;
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
        debug('clearCache', 'start', forceReset);
        const isPartial = unref(this.isPartial);
        const total = isPartial ? Infinity : 0;

        this.data.cacheItem.clear();

        this.state.allOptions = [];
        this.state.totalAllOptions = total;
        this.state.totalDynOptions = total;

        this.clearDisplay();

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

    public changeIcons(icons: PartialIcons | null, family?: IconFamily | null) {
        if (icons) {
            this.data.icons = Object.assign({}, this.data.icons, icons);
        }

        if (typeof family === 'string') {
            this.data.iconFamily = family;
        }
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

    /** Reset the display cache in order to rebuild it */
    private clearDisplay() {
        debug('clearDisplay', 'start');
        this.state.filteredOptions = [];
        this.state.totalFilteredOptions = Infinity;
    }

    /** rebuild the state filteredOptions to normalize their values */
    private updateFilteredOptions() {
        if (!this.data.doNotUpdate) {
            this.state.filteredOptions = this.buildItems(this.state.filteredOptions);
            this.buildSelectedOptions();
            this.updateGroupSelection();
        }
    }

    private addGroups(groups: GroupValue[]) {
        groups.forEach((group) => {
            this.state.groups.set(group.id, group.text);
        });
    }

    /** This method is for the computed property listOptions */
    private getListOptions(): OptionValue[] {
        const options = deepClone(this.props.options, ['data']);
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

    /** This method is for the computed property elementOptions */
    private getElementOptions(): OptionValue[] {
        const options = deepClone(this.props.childOptions, ['data']);
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

    /** Generate the list of all options by combining the 3 option lists */
    private buildAllOptions(keepFetched = false, stopFetch = false) {
        debug('buildAllOptions', 'start', 'keepFetched', keepFetched, 'stopFetch', stopFetch);
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

        if (!stopFetch) {
            this.buildFilteredOptions().then(() => {
                /* XXX: To recompute for strict mode and auto-select */
                this.assertCorrectValue();
            });
        } else {
            /* Do not fetch again just build filteredOptions */
            const search = this.state.searchText;
            if (!search) {
                this.setFilteredOptions(this.buildGroupItems(allOptions));
                return;
            }
            const options = this.filterOptions(allOptions, search);
            this.setFilteredOptions(options);
        }

        debug('buildAllOptions', 'end', 'allOptions:', this.state.allOptions.length, 'totalAllOptions:', this.state.totalAllOptions);
    }

    private async buildFilteredOptions() {
        const state = this.state;

        if (!state.isOpen) {
            /* Do not try to fetch anything while the select is not open */
            return;
        }

        const allOptions = state.allOptions;
        const search = state.searchText;
        const totalAllOptions = state.totalAllOptions;
        const allOptionsLength = allOptions.length;
        let filteredOptionsLength = state.filteredOptions.length;
        const hasAllItems = unref(this.hasAllItems);

        debug('buildFilteredOptions', 'start', 'hasAllItems:', hasAllItems, 'allOptions', allOptions.length, 'search:', search, 'filteredOptionsLength:', filteredOptionsLength);

        if (hasAllItems) {
            /* Everything has already been fetched and stored in filteredOptions */
            return;
        }

        const hasFetchedAllItems = unref(this.hasFetchedAllItems);
        /* Check if all options have been fetched */
        if (hasFetchedAllItems) {
            if (!search) {
                this.setFilteredOptions(this.buildGroupItems(allOptions));
                return;
            }

            const options = this.filterOptions(allOptions, search);
            this.setFilteredOptions(options);
            return;
        }

        /* When we only have partial options */

        const offsetItem = state.offsetItem;
        const marginSize = unref(this.marginSize);
        const endIndex = offsetItem + marginSize;


        debug('buildFilteredOptions', 'partial options', 'offsetItem:',offsetItem, 'marginSize:',marginSize, 'filteredOptionsLength', filteredOptionsLength);

        if (endIndex <= filteredOptionsLength) {
            return;
        }

        if (!search && endIndex <= allOptionsLength) {
            this.setFilteredOptions(this.buildGroupItems(allOptions), false, totalAllOptions + state.groups.size);

            const isPartial = unref(this.isPartial);
            if (isPartial && state.totalDynOptions === Infinity) {
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

        debug('buildFilteredOptions', 'end', '(will call fetchData)', this.state.filteredOptions.length);
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

    private async fetchRequest(fetchCallback: FetchCallback, search: string, offset: number, limit: number): Promise<FetchResult> {
        const searchRqId = ++this.requestSearchId;

        if (!search) {
            ++this.requestId
        }

        const requestId = this.requestId;

        debug('fetchRequest', 'start', 'search:', search, 'offset:', offset, 'limit:', limit, 'requestId:', requestId, 'requestSearchId:', searchRqId, 'isRequesting:', this.isRequesting);

        if (this.isRequesting) {
            debug('fetchRequest', `await ${DEBOUNCE_REQUEST}ms`);

            /* debounce the call to avoid sending too much requests */
            await new Promise((resolve) => {
                setTimeout(resolve, DEBOUNCE_REQUEST);
            });

            /* Check if there are other requested requests, in such case drop this one */
            if (requestId !== this.requestId || (search && searchRqId !== this.requestSearchId)) {
                debug('fetchRequest', '××deprecated××', requestId, searchRqId);
                return false;
            }
        }

        this.isRequesting = true;
        const response = await fetchCallback(search, offset, limit);

        /* Check if request is obsolete */
        if (requestId !== this.requestId || (search && searchRqId !== this.requestSearchId)) {
            debug('fetchRequest', '×××deprecated×××', requestId, searchRqId);
            return false;
        }

        this.isRequesting = false;

        const deprecated = searchRqId !== this.requestSearchId;
        debug('fetchRequest', 'end', response.result.length, response.total, deprecated);

        return {
            ...response,
            /* this is to fulfill the cache */
            deprecated: deprecated,
        };
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

        debug('fetchData', 'start', 'search:', search, 'offset:', offset, 'limit:', limit);

        try {
            const response = await this.fetchRequest(fetchCallback, search, offset, limit);

            if (!response) {
                debug('fetchData', '×× deprecated ××', search, offset, limit);
                return;
            }

            const {total: rTotal, result, deprecated} = response;

            let total = rTotal;
            let errorMessage = '';

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
                const old = state.dynOptions.splice(offset, result.length, ...result);

                if (isDeepEqual(old, result)) {
                    /* Added options are the same as previous ones.
                     * Stop fetching to avoid infinite loop
                     */

                    debug('fetchData', 'no new values');

                    if (!unref(this.hasFetchedAllItems)) {
                        /* Display error if all items are not fetch
                         * We can have the case where old value and result
                         * are the same but total is correct when the
                         * total is 0 */
                        errorMessage = labels.wrongQueryResult;
                    }

                    setTimeout(() => {
                        debug('fetchData', 'before buildAllOptions (stopped)', 'offsetItem:', this.state.offsetItem, 'allOptions:', this.state.allOptions.length);
                        this.buildAllOptions(true, true)
                    }, 0);
                } else {
                    setTimeout(() => {
                        debug('fetchData', 'before buildAllOptions', 'offsetItem:', this.state.offsetItem, 'allOptions:', this.state.allOptions.length);
                        this.buildAllOptions(true)
                     }, 0);
                }
            }

            /* Check request (without search) is not obsolete */
            if (deprecated) {
                debug('fetchData', '××× deprecated ×××', search, offset, limit);
                return;
            }

            if (!search) {
                state.filteredOptions = this.buildGroupItems(state.allOptions);
            } else {
                const previousItem = state.filteredOptions[filteredOptionsLength - 1];
                const options = this.buildGroupItems(result, previousItem);
                const nbGroups1 = this.nbGroups(options);

                /* replace existing options by what have been received
                 * or add received options.
                 * This allow to manage requests received in different orders.
                 */
                state.filteredOptions.splice(offset + dynOffset, limit + nbGroups1, ...options);
            }

            let nbGroups = state.groups.size;
            if (offset + limit >= total) {
                nbGroups = this.nbGroups(state.filteredOptions);
            }

            state.totalFilteredOptions = total + nbGroups + dynOffset;
            this.updateGroupSelection();

            if (search && state.totalFilteredOptions <= state.filteredOptions.length) {
                this.addStaticFilteredOptions(true);
            }

            state.status.errorMessage = errorMessage;
        } catch (e) {
            state.status.errorMessage = (e as Error).message;
            debug('fetchData', 'error', (e as Error).message);

            if (!search) {
                state.totalDynOptions = 0;
                this.buildAllOptions(true, true);
            }
        }

        this.state.status.searching = false;

        debug('fetchData', 'end');
    }

    private filterOptions(options: OptionValue[], search: string): OptionItem[] {
        debug('filterOptions', 'start', 'options:', options.length, 'search:', search);

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

        debug('addStaticFilteredOptions', 'start', 'fromDynamic:', fromDynamic, 'optionBehaviorOperation:', this.state.optionBehaviorOperation);

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
            this.setFilteredOptions(options, true);
        }

        debug('addStaticFilteredOptions', 'end');
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

        debug('buildGroupItems', 'start', 'options:', options.length, 'previousGroupId:', previousGroupId);

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

        debug('buildGroupItems', 'end', list.length);

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

        const selectedOptions = state.selectedOptions;
        const enabledOptions = state.allOptions.filter((opt) => !opt.disabled);
        const nbEnabled = enabledOptions.length;
        const value = state.internalValue;
        const hasValue = Array.isArray(value) ? value.length > 0 : value !== null;
        const hasDisabledSelected = Array.isArray(selectedOptions)
            ? selectedOptions.some((opt) => opt.disabled)
            : false;
        const hasOnlyValidValue = hasValue && !hasDisabledSelected && (
            Array.isArray(value) ? value.every((val) => this.hasValue(val)) :
            this.hasValue(value)
        );

        const isEmpty = nbEnabled === 0;
        const hasOnlyOneOption = nbEnabled === 1 && hasOnlyValidValue && !state.allowClearSelection;
        const isExclusiveDisabledItem = Array.isArray(selectedOptions) /* which means "multiple" mode */
            && selectedOptions.length === 1
            && selectedOptions[0].exclusive
            && selectedOptions[0].disabled;

        if (hasOnlyOneOption || isEmpty || isExclusiveDisabledItem) {
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

    /** update group item, to mark them as selected if needed */
    private updateGroupSelection() {
        const state = this.state;

        if (!unref(this.allowGroupSelection)) {
            return;
        }

        const filteredOptions = state.filteredOptions;;
        const groupIdx = new Map<OptionId, number>();
        const groupAllSelected = new Map<OptionId, boolean>();
        const groupNbItem = new Map<OptionId, number>();

        filteredOptions.forEach((option, idx) => {
            const groupId = option.group;

            if (option.isGroup) {
                const id = option.id;
                groupIdx.set(id, idx);
                groupAllSelected.set(id, true);
            } else
            if (groupId !== undefined) {
                if (option.disabled || option.exclusive) {
                    return;
                }

                groupNbItem.set(groupId, (groupNbItem.get(groupId) || 0) + 1)

                if (!option.selected) {
                    groupAllSelected.set(groupId, false);
                }
            }
        });

        for (const [id, idx] of groupIdx.entries()) {
            const group = filteredOptions[idx];
            group.selected = !!(groupAllSelected.get(id) && groupNbItem.get(id));
        }
    }

    /** assign new value to the filteredOptions and apply change depending on it */
    private setFilteredOptions(options: OptionItem[], add = false, length = 0) {
        debug('setFilteredOptions', 'start', 'options:', options.length, 'add', add, 'length', length);

        if (!add) {
            this.state.filteredOptions = options;
            this.state.totalFilteredOptions = length || options.length;
        } else {
            this.state.filteredOptions.push(...options);
            this.state.totalFilteredOptions += length || options.length;
        }

        this.updateGroupSelection();
    }

    /* }}} */
    /* }}} */

};
