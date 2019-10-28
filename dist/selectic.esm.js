import { Prop, Watch, Component, Vue } from 'vtyx';

/* File Purpose:
 * It keeps and computes all states at a single place.
 * Every inner components of Selectic should comunicate with this file to
 * change or to get states.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
function convertToRegExp(name, flag = 'i') {
    const pattern = name.replace(/[\\^$.+?(){}[\]|]/g, '\\$&')
        .replace(/\*/g, '.*');
    return new RegExp(pattern, flag);
}
let messages = {
    noFetchMethod: 'Fetch callback is missing: it is not possible to retrieve data.',
    searchPlaceholder: 'Search',
    searching: 'Searching',
    cannotSelectAllSearchedItems: 'Cannot select all items: too much items in the search result.',
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
};
let closePreviousSelectic;
/* {{{ Static */
function changeTexts(texts) {
    messages = Object.assign(messages, texts);
}
/* }}} */
let SelecticStore = class SelecticStore extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        /* Number of items displayed in a page (before scrolling) */
        this.itemsPerPage = 10;
        /* }}} */
        /* {{{ data */
        this.state = {
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
            filteredOptions: [],
            selectedOptions: null,
            totalAllOptions: Infinity,
            totalFilteredOptions: Infinity,
            groups: new Map(),
            offsetItem: 0,
            activeItemIdx: -1,
            pageSize: 100,
            status: {
                searching: false,
                errorMessage: '',
                areAllSelected: false,
                hasChanged: false,
            },
        };
        this.labels = messages;
        /* used to avoid checking and updating table while doing batch stuff */
        this.doNotUpdate = false;
        this.cacheItem = new Map();
        /* }}} */
    }
    /* }}} */
    /* {{{ computed */
    /* Number of item to pre-display */
    get marginSize() {
        return this.state.pageSize / 2;
    }
    /* }}} */
    /* {{{ computed */
    get isPartial() {
        return typeof this.fetchCallback === 'function';
    }
    get hasAllItems() {
        const nbItems = this.state.totalFilteredOptions + this.state.groups.size;
        return this.state.filteredOptions.length >= nbItems;
    }
    get hasFetchedAllItems() {
        const state = this.state;
        return state.allOptions.length === state.totalAllOptions;
    }
    get closeSelectic() {
        return () => this.commit('isOpen', false);
    }
    /* }}} */
    /* {{{ methods */
    /* {{{ public methods */
    commit(name, value) {
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
                this.buildFilteredOptions();
                break;
            case 'isOpen':
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
                    closePreviousSelectic = this.closeSelectic;
                }
                else if (closePreviousSelectic === this.closeSelectic) {
                    closePreviousSelectic = undefined;
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
    getItem(id) {
        let item;
        if (this.hasItemInStore(id)) {
            item = this.cacheItem.get(id);
        }
        else {
            this.getItems([id]);
            item = {
                id,
                text: String(id),
            };
        }
        return this.buildItems([item])[0];
    }
    async getItems(ids) {
        const itemsToFetch = ids.filter((id) => !this.hasItemInStore(id));
        if (itemsToFetch.length && typeof this.getItemsCallback === 'function') {
            const items = await this.getItemsCallback(itemsToFetch);
            for (const item of items) {
                if (item) {
                    this.cacheItem.set(item.id, item);
                }
            }
        }
        return this.buildSelectedItems(ids);
    }
    selectItem(id, selected, keepOpen = false) {
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
            const internalValue = state.internalValue;
            const isAlreadySelected = internalValue.includes(id);
            if (selected === undefined) {
                selected = !isAlreadySelected;
            }
            if (id === null) {
                state.internalValue = [];
                hasChanged = internalValue.length > 0;
            }
            else if (selected && !isAlreadySelected) {
                internalValue.push(id);
                hasChanged = true;
            }
            else if (!selected && isAlreadySelected) {
                internalValue.splice(internalValue.indexOf(id), 1);
                hasChanged = true;
            }
            if (hasChanged) {
                this.updateFilteredOptions();
            }
        }
        else {
            /* multiple = false */
            const oldValue = state.internalValue;
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
            }
            else if (id === oldValue) {
                return;
            }
            this.commit('internalValue', id);
            hasChanged = true;
        }
        if (hasChanged) {
            state.status.hasChanged = true;
        }
    }
    toggleSelectAll() {
        if (!this.state.multiple) {
            return;
        }
        if (!this.hasAllItems) {
            if (this.state.searchText) {
                this.state.status.errorMessage = this.labels.cannotSelectAllSearchedItems;
                return;
            }
            const value = this.state.internalValue;
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
    resetChange() {
        this.state.status.hasChanged = false;
    }
    resetErrorMessage() {
        this.state.status.errorMessage = '';
    }
    clearCache(forceReset = false) {
        const total = this.isPartial ? Infinity : 0;
        this.cacheItem.clear();
        this.state.allOptions = [];
        this.state.totalAllOptions = total;
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
        }
        else {
            this.buildAllOptions();
        }
    }
    changeGroups(groups) {
        this.state.groups.clear();
        this.addGroups(groups);
        this.buildFilteredOptions();
    }
    changeTexts(texts) {
        this.labels = Object.assign({}, this.labels, texts);
    }
    /* }}} */
    /* {{{ private methods */
    hasValue(id) {
        const allOptions = this.state.allOptions;
        return id === null || allOptions.some((option) => option.id === id);
    }
    assertCorrectValue() {
        const state = this.state;
        const internalValue = state.internalValue;
        const selectionIsExcluded = state.selectionIsExcluded;
        const isMultiple = state.multiple;
        const checkStrict = state.strictValue && this.hasFetchedAllItems;
        let newValue = internalValue;
        if (isMultiple) {
            if (!Array.isArray(internalValue)) {
                newValue = internalValue === null ? [] : [internalValue];
            }
            if (selectionIsExcluded && this.hasFetchedAllItems) {
                newValue = state.allOptions.reduce((values, option) => {
                    const id = option.id;
                    if (!internalValue.includes(id)) {
                        values.push(id);
                    }
                    return values;
                }, []);
                state.selectionIsExcluded = false;
            }
        }
        else {
            if (Array.isArray(internalValue)) {
                const value = internalValue[0];
                newValue = typeof value === 'undefined' ? null : value;
            }
            state.selectionIsExcluded = false;
        }
        if (checkStrict) {
            if (isMultiple) {
                newValue = newValue
                    .filter((value) => this.hasValue(value));
            }
            else if (!this.hasValue(newValue)) {
                newValue = null;
            }
        }
        state.internalValue = newValue;
    }
    updateFilteredOptions() {
        if (!this.doNotUpdate) {
            this.state.filteredOptions = this.buildItems(this.state.filteredOptions);
        }
    }
    addGroups(groups) {
        groups.forEach((group) => {
            this.state.groups.set(group.id, group.text);
        });
    }
    buildAllOptions() {
        const allOptions = [];
        if (Array.isArray(this.options)) {
            this.options.forEach((option) => {
                /* manage simple string */
                if (typeof option === 'string') {
                    allOptions.push({
                        id: option,
                        text: option,
                    });
                    return;
                }
                const group = option.group;
                const options = option.options;
                /* check for groups */
                if (group && !this.state.groups.has(group)) {
                    this.state.groups.set(group, String(group));
                }
                /* check for sub options */
                if (options) {
                    const groupId = option.id;
                    this.state.groups.set(groupId, option.text);
                    options.forEach((subOpt) => {
                        subOpt.group = groupId;
                    });
                    allOptions.push(...options);
                    return;
                }
                allOptions.push(option);
            });
        }
        this.state.allOptions = allOptions;
        if (this.isPartial) {
            this.state.totalAllOptions = Infinity;
        }
        else {
            this.state.totalAllOptions = allOptions.length;
        }
        this.state.filteredOptions = [];
        this.state.totalFilteredOptions = Infinity;
        this.buildFilteredOptions();
    }
    async buildFilteredOptions() {
        if (!this.state.isOpen) {
            /* Do not try to fetch anything while the select is not open */
            return;
        }
        const allOptions = this.state.allOptions;
        const search = this.state.searchText;
        const totalAllOptions = this.state.totalAllOptions;
        const allOptionsLength = allOptions.length;
        const filteredOptionsLength = this.state.filteredOptions.length;
        if (this.hasAllItems) {
            /* Everything has already been fetched */
            return;
        }
        /* Check if all options have been fetched */
        if (this.hasFetchedAllItems) {
            if (!search) {
                this.state.filteredOptions = this.buildGroupItems(allOptions);
                this.state.totalFilteredOptions = this.state.filteredOptions.length;
                return;
            }
            /* Filter options on what is search for */
            const rgx = convertToRegExp(search, 'i');
            const options = this.buildGroupItems(allOptions.filter((option) => rgx.test(option.text)));
            this.state.filteredOptions = options;
            this.state.totalFilteredOptions = this.state.filteredOptions.length;
            return;
        }
        /* When we only have partial options */
        const offsetItem = this.state.offsetItem;
        const pageSize = this.state.pageSize;
        const marginSize = this.marginSize;
        const endIndex = offsetItem + marginSize;
        if (endIndex <= filteredOptionsLength) {
            return;
        }
        if (!search && endIndex <= allOptionsLength) {
            this.state.filteredOptions = this.buildGroupItems(allOptions);
            this.state.totalFilteredOptions = totalAllOptions + this.state.groups.size;
            return;
        }
        if (!this.fetchCallback) {
            this.state.status.errorMessage = this.labels.noFetchMethod;
            return;
        }
        /* Run the query */
        this.state.status.searching = true;
        /* Manage cases where offsetItem is not equal to the last item received */
        const offset = filteredOptionsLength - this.nbGroups(this.state.filteredOptions);
        const nbItems = endIndex - offset;
        const limit = Math.ceil(nbItems / pageSize) * pageSize;
        try {
            const requestId = ++this.requestId;
            const { total: rTotal, result } = await this.fetchCallback(search, offset, limit);
            let total = rTotal;
            /* Assert result is correctly formatted */
            if (!Array.isArray(result)) {
                throw new Error(this.labels.wrongFormattedData);
            }
            /* Handle case where total is not returned */
            if (typeof total !== 'number') {
                total = search ? this.state.totalFilteredOptions
                    : this.state.totalAllOptions;
                if (!isFinite(total)) {
                    total = result.length;
                }
            }
            if (!search) {
                /* update cache */
                this.state.totalAllOptions = total;
                this.state.allOptions.splice(offset, limit, ...result);
            }
            /* Check request is not obsolete */
            if (requestId !== this.requestId) {
                return;
            }
            if (!search) {
                this.state.filteredOptions = this.buildGroupItems(this.state.allOptions);
            }
            else {
                const previousItem = this.state.filteredOptions[filteredOptionsLength - 1];
                const options = this.buildGroupItems(result, previousItem);
                const nbGroups1 = this.nbGroups(options);
                this.state.filteredOptions.splice(offset, limit + nbGroups1, ...options);
            }
            let nbGroups = this.state.groups.size;
            if (offset + limit >= total) {
                nbGroups = this.nbGroups(this.state.filteredOptions);
            }
            this.state.totalFilteredOptions = total + nbGroups;
            this.state.status.errorMessage = '';
        }
        catch (e) {
            this.state.status.errorMessage = e.message;
        }
        this.state.status.searching = false;
    }
    async buildSelectedOptions() {
        const internalValue = this.state.internalValue;
        if (this.state.multiple) {
            /* display partial information about selected items */
            this.state.selectedOptions = this.buildSelectedItems(internalValue);
            const items = await this.getItems(internalValue);
            if (internalValue !== this.state.internalValue) {
                /* Values have been deprecated */
                return;
            }
            /* display full information about selected items */
            this.state.selectedOptions = items;
        }
        else if (internalValue === null) {
            this.state.selectedOptions = null;
        }
        else {
            /* display partial information about selected items */
            this.state.selectedOptions = this.buildSelectedItems([internalValue])[0];
            const items = await this.getItems([internalValue]);
            if (internalValue !== this.state.internalValue) {
                /* Values have been deprecated */
                return;
            }
            /* display full information about selected items */
            this.state.selectedOptions = items[0];
        }
    }
    buildSelectedItems(ids) {
        return this.buildItems(ids.map((id) => {
            const item = this.cacheItem.get(id);
            return item || {
                id,
                text: String(id),
            };
        }));
    }
    hasItemInStore(id) {
        let item = this.cacheItem.get(id);
        if (!item) {
            item = this.state.filteredOptions.find((option) => option.id === id);
            if (!item) {
                item = this.state.allOptions.find((option) => option.id === id);
            }
            if (item) {
                this.cacheItem.set(item.id, item);
            }
        }
        return !!item;
    }
    buildItems(options) {
        const internalValue = this.state.internalValue;
        const selected = this.state.multiple
            ? internalValue
            : [internalValue];
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
    buildGroupItems(options, previousItem) {
        let previousGroupId = previousItem && previousItem.group;
        const list = this.buildItems(options).reduce((items, item) => {
            if (item.group !== previousGroupId) {
                const groupId = item.group;
                const groupLabel = this.state.groups.get(groupId);
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
    nbGroups(items) {
        return items.reduce((nb, item) => +item.isGroup + nb, 0);
    }
    checkAutoSelect() {
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
    checkAutoDisabled() {
        const state = this.state;
        const doNotCheck = this.disabled || this.isPartial || !state.autoDisabled;
        if (doNotCheck) {
            return;
        }
        const nb = state.totalAllOptions;
        const value = state.internalValue;
        const hasValue = Array.isArray(value) ? value.length > 0 : value !== null;
        const isEmpty = nb === 0;
        const hasOnlyOneOption = nb === 1 && hasValue && !state.allowClearSelection;
        if (hasOnlyOneOption || isEmpty) {
            this.commit('isOpen', false);
            this.commit('disabled', true);
        }
        else {
            this.commit('disabled', false);
        }
    }
    checkHideFilter() {
        if (this.params && this.params.hideFilter !== 'auto') {
            return;
        }
        const state = this.state;
        if (state.multiple || this.isPartial) {
            state.hideFilter = false;
        }
        else {
            state.hideFilter = state.totalAllOptions <= this.itemsPerPage;
        }
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onOptionsChange() {
        this.cacheItem.clear();
        this.buildAllOptions();
        this.assertCorrectValue();
        this.buildSelectedOptions();
    }
    onValueChange() {
        const value = typeof this.value === 'undefined' ? null : this.value;
        this.commit('internalValue', value);
    }
    onSelectionExcludedChange() {
        this.commit('selectionIsExcluded', this.selectionIsExcluded);
    }
    onDisabledChange() {
        this.commit('disabled', this.disabled);
    }
    onFilteredChange() {
        let areAllSelected = false;
        if (this.hasAllItems) {
            const selectionIsExcluded = +this.state.selectionIsExcluded;
            // tslint:disable-next-line:no-bitwise
            areAllSelected = this.state.filteredOptions.every((item) => !!(+item.selected ^ selectionIsExcluded));
        }
        this.state.status.areAllSelected = areAllSelected;
    }
    onInternalValueChange() {
        this.buildSelectedOptions();
    }
    onAllOptionChange() {
        this.checkAutoSelect();
        this.checkAutoDisabled();
    }
    onTotalAllOptionsChange() {
        this.checkHideFilter();
    }
    /* }}} */
    /* {{{ life cycles methods */
    created() {
        const value = typeof this.value === 'undefined' ? null : this.value;
        /* set initial value for non reactive attribute */
        this.requestId = 0;
        this.state = Object.assign(this.state, this.params, {
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
};
__decorate([
    Prop()
], SelecticStore.prototype, "value", void 0);
__decorate([
    Prop({ default: false })
], SelecticStore.prototype, "selectionIsExcluded", void 0);
__decorate([
    Prop({ default: false })
], SelecticStore.prototype, "disabled", void 0);
__decorate([
    Prop()
], SelecticStore.prototype, "options", void 0);
__decorate([
    Prop({ default: () => [] })
], SelecticStore.prototype, "groups", void 0);
__decorate([
    Prop()
], SelecticStore.prototype, "texts", void 0);
__decorate([
    Prop()
], SelecticStore.prototype, "params", void 0);
__decorate([
    Prop()
], SelecticStore.prototype, "fetchCallback", void 0);
__decorate([
    Prop()
], SelecticStore.prototype, "getItemsCallback", void 0);
__decorate([
    Watch('options')
], SelecticStore.prototype, "onOptionsChange", null);
__decorate([
    Watch('value')
], SelecticStore.prototype, "onValueChange", null);
__decorate([
    Watch('selectionIsExcluded')
], SelecticStore.prototype, "onSelectionExcludedChange", null);
__decorate([
    Watch('disabled')
], SelecticStore.prototype, "onDisabledChange", null);
__decorate([
    Watch('state.filteredOptions')
], SelecticStore.prototype, "onFilteredChange", null);
__decorate([
    Watch('state.internalValue')
], SelecticStore.prototype, "onInternalValueChange", null);
__decorate([
    Watch('state.allOptions')
], SelecticStore.prototype, "onAllOptionChange", null);
__decorate([
    Watch('state.totalAllOptions')
], SelecticStore.prototype, "onTotalAllOptionsChange", null);
SelecticStore = __decorate([
    Component
], SelecticStore);
var Store = SelecticStore;

/* File Purpose:
 * It displays the core element which is always visible (where selection is
 * displayed) and handles all interaction with it.
 */
var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let Selectic = class Selectic extends Vue {
    constructor() {
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.nbHiddenItems = 0;
    }
    /* }}} */
    /* {{{ computed */
    get isDisabled() {
        return this.store.state.disabled;
    }
    get hasValue() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.internalValue;
        return isMultiple
            ? Array.isArray(value) && value.length > 0
            : value !== null;
    }
    get displayPlaceholder() {
        const placeholder = this.store.state.placeholder;
        const hasValue = this.hasValue;
        return !!placeholder && !hasValue;
    }
    get canBeCleared() {
        const allowClearSelection = this.store.state.allowClearSelection;
        const isDisabled = this.isDisabled;
        const hasValue = this.hasValue;
        return allowClearSelection && !isDisabled && hasValue;
    }
    get showClearAll() {
        if (!this.canBeCleared) {
            return false;
        }
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.internalValue;
        const hasOnlyOneValue = Array.isArray(value) && value.length === 1;
        /* Should not display the clear action if there is only one selected
         * item in multiple (as this item has already its remove icon) */
        return !isMultiple || !hasOnlyOneValue;
    }
    get clearedLabel() {
        const isMultiple = this.store.state.multiple;
        const labelKey = isMultiple ? 'clearSelections' : 'clearSelection';
        return this.store.labels[labelKey];
    }
    get singleSelectedItem() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const selected = this.selectedOptions;
        return !isMultiple && !!selected && selected.text;
    }
    get singleStyle() {
        const selected = this.selectedOptions;
        if (!this.store.state.multiple && selected) {
            return selected.style;
        }
        return;
    }
    get selecticId() {
        if (this.id) {
            return 'selectic-' + this.id;
        }
        return;
    }
    get isSelectionReversed() {
        return this.store.state.selectionIsExcluded;
    }
    get reverseSelectionLabel() {
        const labelKey = 'reverseSelection';
        return this.store.labels[labelKey];
    }
    get formatItem() {
        const formatSelection = this.store.state.formatSelection;
        if (formatSelection) {
            return formatSelection;
        }
        return (item) => item;
    }
    get selectedOptions() {
        const selection = this.store.state.selectedOptions;
        const formatItem = this.formatItem.bind(this);
        if (selection === null) {
            return null;
        }
        if (Array.isArray(selection)) {
            return selection.map(formatItem);
        }
        return formatItem(selection);
    }
    get showSelectedOptions() {
        if (!this.store.state.multiple) {
            return [];
        }
        const selectedOptions = this.selectedOptions;
        const nbHiddenItems = this.nbHiddenItems;
        if (nbHiddenItems) {
            return selectedOptions.slice(0, -nbHiddenItems);
        }
        return selectedOptions;
    }
    get moreSelectedNb() {
        const store = this.store;
        const nbHiddenItems = this.nbHiddenItems;
        if (!store.state.multiple || nbHiddenItems === 0) {
            return '';
        }
        const text = nbHiddenItems === 1 ? store.labels.moreSelectedItem
            : store.labels.moreSelectedItems;
        return text.replace(/%d/, nbHiddenItems.toString());
    }
    get moreSelectedTitle() {
        const nbHiddenItems = this.nbHiddenItems;
        if (!this.store.state.multiple) {
            return '';
        }
        const list = this.selectedOptions;
        return list.slice(-nbHiddenItems).map((item) => item.text).join('\n');
    }
    /* }}} */
    /* {{{ methods */
    toggleFocus(focused) {
        if (typeof focused === 'boolean') {
            this.store.commit('isOpen', focused);
        }
        else {
            this.store.commit('isOpen', !this.store.state.isOpen);
        }
    }
    selectItem(id) {
        this.store.selectItem(id, false);
    }
    clearSelection() {
        this.store.selectItem(null);
    }
    computeSize() {
        const state = this.store.state;
        const selectedOptions = this.selectedOptions;
        if (!state.multiple || state.selectionOverflow !== 'collapsed'
            || !selectedOptions.length) {
            this.nbHiddenItems = 0;
            return;
        }
        /* Check if there is enough space to display items like there are
         * currently shown */
        const el = this.$refs.selectedItems;
        const parentEl = el.parentElement;
        const parentPadding = parseInt(getComputedStyle(parentEl).getPropertyValue('padding-right'), 10);
        const clearEl = parentEl.querySelector('.selectic-input__clear-icon');
        const clearWidth = clearEl ? clearEl.offsetWidth : 0;
        const itemsWidth = parentEl.clientWidth - parentPadding - clearWidth;
        if (itemsWidth - el.offsetWidth > 0) {
            return;
        }
        /* Look for the first element which start outside bounds */
        const moreEl = el.querySelector('.more-items');
        const moreSize = moreEl && moreEl.offsetWidth || 0;
        const itemsSpace = itemsWidth - moreSize;
        const childrenEl = el.children;
        const childrenLength = childrenEl.length;
        if (moreEl && childrenLength === 1) {
            /* The only child element is the "more" element */
            return;
        }
        let idx = 0;
        while (idx < childrenLength
            && childrenEl[idx].offsetLeft < itemsSpace) {
            idx++;
        }
        /* Hide the previous element */
        idx--;
        this.nbHiddenItems = selectedOptions.length - idx;
    }
    /* }}} */
    /* {{{ watch */
    onInternalChange() {
        this.nbHiddenItems = 0;
    }
    /* }}} */
    /* {{{ life cycles methods */
    updated() {
        this.computeSize();
    }
    /* }}} */
    render() {
        const h = this.renderWrapper();
        return (h("div", { class: "has-feedback", on: {
                'click.prevent.stop': () => this.toggleFocus(),
            } },
            h("div", { id: this.selecticId, class: ['selectic-input form-control',
                    {
                        focused: this.store.state.isOpen,
                        disabled: this.store.state.disabled,
                    }] },
                h("div", { class: "selectic-input__selected-items", style: this.singleStyle, ref: "selectedItems" },
                    this.isSelectionReversed && (h("span", { class: "fa fa-strikethrough selectic-input__reverse-icon", title: this.reverseSelectionLabel })),
                    this.displayPlaceholder && (h("span", { class: "selectic-input__selected-items__placeholder" }, this.store.state.placeholder)),
                    this.singleSelectedItem,
                    this.showSelectedOptions.map((item) => (h("div", { class: "single-value", style: item.style, title: item.text, on: {
                            click: () => this.$emit('item:click', item.id),
                        } },
                        h("span", { class: "selectic-input__selected-items__value" }, item.text),
                        !this.isDisabled && (h("span", { class: "fa fa-times selectic-input__selected-items__icon", on: {
                                'click.prevent.stop': () => this.selectItem(item.id),
                            } }))))),
                    this.moreSelectedNb && (h("div", { class: "single-value more-items", title: this.moreSelectedTitle }, this.moreSelectedNb))),
                this.showClearAll && (h("span", { class: "fa fa-times selectic-input__clear-icon", title: this.clearedLabel, on: { 'click.prevent.stop': this.clearSelection } }))),
            h("div", { class: [
                    'selectic__icon-container',
                    'form-control-feedback',
                    { focused: this.store.state.isOpen }
                ], on: {
                    'click.prevent.stop': () => this.toggleFocus(),
                } },
                h("span", { class: "fa fa-caret-down selectic-icon" }))));
    }
};
__decorate$1([
    Prop()
], Selectic.prototype, "store", void 0);
__decorate$1([
    Prop({ default: '' })
], Selectic.prototype, "id", void 0);
__decorate$1([
    Watch('store.state.internalValue')
], Selectic.prototype, "onInternalChange", null);
Selectic = __decorate$1([
    Component
], Selectic);
var MainInput = Selectic;

/* File Purpose:
 * It manages all controls which can filter the data.
 */
var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FilterPanel = class FilterPanel extends Vue {
    constructor() {
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.closed = true;
    }
    /* }}} */
    /* {{{ computed */
    get searchPlaceholder() {
        return this.store.labels.searchPlaceholder;
    }
    get selectionIsExcluded() {
        return this.store.state.selectionIsExcluded;
    }
    get disableSelectAll() {
        const store = this.store;
        const state = store.state;
        const isMultiple = state.multiple;
        const hasItems = state.filteredOptions.length === 0;
        const canNotSelect = !!state.searchText && !store.hasAllItems;
        return !isMultiple || hasItems || canNotSelect;
    }
    get disableRevert() {
        const store = this.store;
        return !store.state.multiple || !store.hasFetchedAllItems;
    }
    get enableRevert() {
        const state = this.store.state;
        return state.multiple && state.allowRevert !== false;
    }
    get onKeyPressed() {
        return this.keypressed.bind(this);
    }
    /* }}} */
    /* {{{ methods */
    keypressed(evt) {
        const key = evt.key;
        /* handle only printable characters */
        if (key.length === 1) {
            const el = this.$refs.filterInput;
            if (el === evt.target) {
                return;
            }
            this.closed = false;
            el.value += key;
            this.store.commit('searchText', el.value);
            setTimeout(() => {
                el.focus();
            }, 0);
        }
    }
    onInput(evt) {
        const el = evt.currentTarget;
        this.store.commit('searchText', el.value);
    }
    onSelectAll() {
        this.store.toggleSelectAll();
    }
    onExclude() {
        this.store.commit('selectionIsExcluded', !this.selectionIsExcluded);
    }
    togglePanel() {
        this.closed = !this.closed;
    }
    getFocus() {
        if (!this.closed) {
            setTimeout(() => this.$refs.filterInput.focus(), 0);
        }
    }
    /* }}} */
    /* {{{ watch */
    onClosed() {
        this.getFocus();
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        this.closed = !this.store.state.searchText;
        document.addEventListener('keypress', this.onKeyPressed);
        this.getFocus();
    }
    destroyed() {
        document.removeEventListener('keypress', this.onKeyPressed);
    }
    /* }}} */
    render() {
        const h = this.renderWrapper();
        return (h("div", { class: "filter-panel" },
            h("div", { class: {
                    panelclosed: this.closed,
                    panelopened: !this.closed,
                } },
                h("div", { class: "filter-panel__input form-group has-feedback" },
                    h("input", { type: "text", class: "form-control filter-input", placeholder: this.searchPlaceholder, value: this.store.state.searchText, on: {
                            'input.stop.prevent': this.onInput,
                        }, ref: "filterInput" }),
                    h("span", { class: "fa fa-search selectic-search-scope\n                                     form-control-feedback" })),
                this.store.state.multiple && (h("div", { class: "toggle-selectic" },
                    h("label", { class: ['control-label', {
                                'selectic__label-disabled': this.disableSelectAll,
                            }] },
                        h("input", { type: "checkbox", checked: this.store.state.status.areAllSelected, disabled: this.disableSelectAll, on: {
                                change: this.onSelectAll,
                            } }),
                        this.store.labels.selectAll))),
                this.enableRevert && (h("div", { class: ['toggle-selectic', {
                            'selectic__label-disabled': this.disableRevert,
                        }] },
                    h("label", { class: "control-label" },
                        h("input", { type: "checkbox", checked: this.selectionIsExcluded, disabled: this.disableRevert, on: {
                                change: this.onExclude,
                            } }),
                        this.store.labels.excludeResult)))),
            h("div", { class: "curtain-handler", on: {
                    'click.prevent.stop': this.togglePanel,
                } },
                h("span", { class: "fa fa-search" }),
                h("span", { class: {
                        'fa': true,
                        'fa-caret-down': this.closed,
                        'fa-caret-up': !this.closed,
                    } }))));
    }
};
__decorate$2([
    Prop()
], FilterPanel.prototype, "store", void 0);
__decorate$2([
    Watch('closed')
], FilterPanel.prototype, "onClosed", null);
FilterPanel = __decorate$2([
    Component
], FilterPanel);
var Filter = FilterPanel;

/* File Purpose:
 * It displays each item in an efficient way (optimizes DOM consumption).
 * It handles interactions with these items.
 */
var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let List = class List extends Vue {
    constructor() {
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.itemHeight = 27;
        this.groupId = null;
        this.doNotScroll = false;
    }
    /* }}} */
    /* {{{ computed */
    get filteredOptions() {
        return this.store.state.filteredOptions;
    }
    get isMultiple() {
        return this.store.state.multiple;
    }
    get itemsMargin() {
        return this.store.marginSize;
    }
    get shortOptions() {
        const endIndex = this.endIndex;
        const startIndex = this.startIndex;
        const formatItem = this.formatItem.bind(this);
        const shortOptions = this.filteredOptions
            .slice(startIndex, endIndex)
            .map(formatItem);
        /* complete options with loading items */
        const missingItems = endIndex - startIndex - shortOptions.length;
        for (let idx = 0; idx < missingItems; idx++) {
            shortOptions.push({
                id: null,
                text: '',
                disabled: true,
                selected: false,
                icon: 'fa fa-spinner fa-spin',
                isGroup: false,
            });
        }
        return shortOptions;
    }
    get totalItems() {
        const total = this.store.state.totalFilteredOptions;
        return Number.isInteger(total) && total > 0 ? total : 0;
    }
    get endIndex() {
        return Math.min(this.store.state.offsetItem + this.itemsMargin, this.totalItems);
    }
    get startIndex() {
        const endIndex = this.endIndex;
        const idx = endIndex - this.store.itemsPerPage - 3 * this.itemsMargin;
        return Math.max(0, idx);
    }
    get leftItems() {
        const totalItems = this.totalItems;
        const leftItems = totalItems - this.endIndex;
        return Math.max(0, leftItems);
    }
    get topOffset() {
        return this.startIndex * this.itemHeight;
    }
    get bottomOffset() {
        return this.leftItems * this.itemHeight;
    }
    get formatItem() {
        const formatOption = this.store.state.formatOption;
        if (formatOption) {
            return formatOption;
        }
        return (item) => item;
    }
    get debounce() {
        let callId = 0;
        return (callback) => {
            clearTimeout(callId);
            callId = self.setTimeout(callback, 50);
        };
    }
    /* To detect support of ScrollIntoViewOptions */
    get supportScrollIntoViewOptions() {
        return typeof document.documentElement.style.scrollBehavior !== 'undefined';
    }
    /* }}} */
    /* {{{ methods */
    click(option) {
        if (option.disabled || option.isGroup) {
            return;
        }
        this.store.selectItem(option.id);
    }
    checkOffset() {
        const scrollTop = this.$refs.elList.scrollTop;
        const topIndex = Math.floor(scrollTop / this.itemHeight);
        const total = this.totalItems;
        const bottomIndex = Math.min(topIndex + this.store.itemsPerPage, total);
        this.debounce(() => this.store.commit('offsetItem', bottomIndex));
        this.computeGroupId(topIndex);
    }
    computeGroupId(topIndex) {
        const item = this.store.state.filteredOptions[topIndex - 1];
        if (!item) {
            this.groupId = null;
        }
        else if (item.isGroup) {
            this.groupId = item.id;
        }
        else {
            this.groupId = typeof item.group !== 'undefined' ? item.group : null;
        }
    }
    onMouseOver(idx) {
        if (!this.supportScrollIntoViewOptions) {
            this.doNotScroll = true;
        }
        this.store.commit('activeItemIdx', idx + this.startIndex);
    }
    /* }}} */
    /* {{{ watch */
    onIndexChange() {
        if (this.doNotScroll) {
            this.doNotScroll = false;
            return;
        }
        this.$nextTick(() => {
            const el = this.$el.querySelector('.selectic-item__active');
            if (el) {
                let scrollIntoViewOptions;
                if (this.supportScrollIntoViewOptions) {
                    scrollIntoViewOptions = {
                        block: 'nearest',
                        inline: 'nearest',
                    };
                }
                else {
                    /* fallback for Browsers which doesn't support smooth options
                     * `false` is equivalent to {
                     *     block: 'end',
                     *     inline: 'nearest',
                     * }
                     */
                    scrollIntoViewOptions = false;
                }
                el.scrollIntoView(scrollIntoViewOptions);
            }
        });
    }
    onOffsetChange() {
        this.checkOffset();
    }
    onFilteredOptionsChange() {
        this.checkOffset();
    }
    onGroupIdChange() {
        this.$emit('groupId', this.groupId);
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        this.checkOffset();
    }
    /* }}} */
    render() {
        const h = this.renderWrapper();
        return (h("ul", { on: {
                scroll: this.checkOffset,
            }, ref: "elList" },
            !!this.topOffset && (h("li", { class: "selectic-item", style: `height:${this.topOffset}px;` })),
            this.shortOptions.map((option, idx) => (h("li", { on: {
                    'click.prevent.stop': () => this.click(option),
                    'mouseover': () => this.onMouseOver(idx),
                }, class: ['selectic-item', option.className || '', {
                        'selected': option.selected,
                        'selectic-item__active': idx + this.startIndex === this.store.state.activeItemIdx,
                        'selectic-item__disabled': !!option.disabled,
                        'selectic-item__is-in-group': !!option.group,
                        'selectic-item__is-group': option.isGroup,
                    }], style: option.style, title: option.title, key: 'selectic-item-' + (idx + this.startIndex) },
                this.isMultiple && (h("span", { class: "fa fa-fw fa-check selectic-item_icon" })),
                option.icon && (h("span", { class: option.icon })),
                option.text))),
            !!this.bottomOffset && (h("li", { class: "selectic-item", style: `height:${this.bottomOffset}px;` }))));
    }
};
__decorate$3([
    Prop()
], List.prototype, "store", void 0);
__decorate$3([
    Watch('store.state.activeItemIdx')
], List.prototype, "onIndexChange", null);
__decorate$3([
    Watch('store.state.offsetItem')
], List.prototype, "onOffsetChange", null);
__decorate$3([
    Watch('filteredOptions')
], List.prototype, "onFilteredOptionsChange", null);
__decorate$3([
    Watch('groupId')
], List.prototype, "onGroupIdChange", null);
List = __decorate$3([
    Component
], List);
var List$1 = List;

/* File Purpose:
 * It manages the panel which is displayed when Selectic is open.
 * Content of inner elements are related to dedicated files.
 */
var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ExtendedList = class ExtendedList extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.topGroup = ' ';
    }
    /* }}} */
    /* {{{ computed */
    get searchingLabel() {
        return this.store.labels.searching;
    }
    get searching() {
        return this.store.state.status.searching;
    }
    get errorMessage() {
        return this.store.state.status.errorMessage;
    }
    get infoMessage() {
        if (this.searching) {
            return '';
        }
        const store = this.store;
        if (store.state.filteredOptions.length === 0) {
            if (store.state.searchText) {
                return store.labels.noResult;
            }
            return store.labels.noData;
        }
        return '';
    }
    get onKeyDown() {
        return (evt) => {
            const key = evt.key;
            if (key === 'Escape') {
                this.store.commit('isOpen', false);
            }
            else if (key === 'Enter') {
                const index = this.store.state.activeItemIdx;
                if (index !== -1) {
                    const item = this.store.state.filteredOptions[index];
                    if (!item.disabled && !item.isGroup) {
                        this.store.selectItem(item.id);
                    }
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
            else if (key === 'ArrowUp') {
                const index = this.store.state.activeItemIdx;
                if (index > 0) {
                    this.store.commit('activeItemIdx', index - 1);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
            else if (key === 'ArrowDown') {
                const index = this.store.state.activeItemIdx;
                const max = this.store.state.totalFilteredOptions - 1;
                if (index < max) {
                    this.store.commit('activeItemIdx', index + 1);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        };
    }
    /* }}} */
    /* {{{ methods */
    getGroup(id) {
        const group = this.store.state.groups.get(id);
        const groupName = group || ' ';
        this.topGroup = groupName;
    }
    /* }}} */
    /* {{{ Life cycles */
    mounted() {
        document.body.appendChild(this.$el);
        document.body.addEventListener('keydown', this.onKeyDown);
    }
    destroyed() {
        document.body.removeEventListener('keydown', this.onKeyDown);
        /* force the element to be removed from DOM */
        if (this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
    }
    /* }}} */
    render() {
        const h = this.renderWrapper();
        const store = this.store;
        const state = store.state;
        return (h("div", { style: `
                    top: ${this.offsetTop}px;
                    left: ${this.offsetLeft}px;
                    width: ${this.width}px;
                `, class: "selectic__extended-list" },
            !state.hideFilter && (h(Filter, { store: this.store })),
            state.groups.size > 0 && state.totalFilteredOptions > store.itemsPerPage && (h("span", { class: "selectic-item selectic-item--header selectic-item__is-group" }, this.topGroup)),
            h(List$1, { store: store, class: "selectic__extended-list__list-items", on: {
                    groupId: this.getGroup,
                } }),
            this.infoMessage && (h("div", { class: "selectic__message alert-info" }, this.infoMessage)),
            this.searching && (h("div", { class: "selectic__message" },
                h("span", { class: "fa fa-spinner fa-spin" }),
                this.searchingLabel)),
            this.errorMessage && (h("div", { class: "selectic__message alert-danger", on: { click: () => store.resetErrorMessage() } }, this.errorMessage))));
    }
};
__decorate$4([
    Prop()
], ExtendedList.prototype, "store", void 0);
__decorate$4([
    Prop({ default: 0 })
], ExtendedList.prototype, "offsetLeft", void 0);
__decorate$4([
    Prop({ default: 0 })
], ExtendedList.prototype, "offsetTop", void 0);
__decorate$4([
    Prop({ default: 300 })
], ExtendedList.prototype, "width", void 0);
ExtendedList = __decorate$4([
    Component
], ExtendedList);
var ExtendedList$1 = ExtendedList;

/* Component Purpose:
 * Selectic is a component to behave like <select> but can be built easily
 * from list of options (only id or more described items). It can also fetch
 * these items dynamically which allow to build very long list without loading
 * all data.
 */
var __decorate$5 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function changeTexts$1(texts) {
    changeTexts(texts);
}
let Selectic$1 = class Selectic extends Vue {
    constructor() {
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.offsetTop = 0;
        this.offsetLeft = 0;
        this.width = 0;
        this.store = {};
    }
    /* }}} */
    /* {{{ computed */
    get isFocused() {
        if (!this.store || !this.store.state) {
            return false;
        }
        return this.store.state.isOpen;
    }
    get scrollListener() {
        return this.computeOffset.bind(this, true);
    }
    get outsideListener() {
        return (evt) => {
            const target = evt.target;
            if (!this.$refs) {
                /* this component should have been destroyed */
                this.removeListeners();
                this.store.commit('isOpen', false);
                return;
            }
            if (!this.$refs.extendedList.$el.contains(target) && !this.$el.contains(target)) {
                this.store.commit('isOpen', false);
            }
        };
    }
    get windowResize() {
        return (_evt) => {
            this.computeWidth();
            this.computeOffset(true);
        };
    }
    get inputValue() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.internalValue;
        if (value === null) {
            return '';
        }
        if (isMultiple) {
            return value.join(', ');
        }
        else {
            return value;
        }
    }
    get selecticClass() {
        const state = this.store.state;
        return ['selectic', this.className, {
                disabled: state.disabled,
                'selectic--overflow-multiline': state.selectionOverflow === 'multiline',
                'selectic--overflow-collapsed': state.selectionOverflow === 'collapsed',
            }];
    }
    /* }}} */
    /* {{{ methods */
    /* {{{ public methods */
    /* Reset the inner cache (mainly for dynamic mode if context has changed) */
    clearCache(forceReset = false) {
        this.store.clearCache(forceReset);
    }
    /* Allow to change all text of the component */
    changeTexts(texts) {
        this.store.changeTexts(texts);
    }
    /* Return the current selection */
    getValue() {
        const value = this.store.state.internalValue;
        if (value === null && typeof this.params.emptyValue !== 'undefined') {
            return this.params.emptyValue;
        }
        return value;
    }
    /* Return the current selection in Item format */
    getSelectedItems() {
        const values = this.store.state.internalValue;
        if (values === null) {
            return {
                id: null,
                text: '',
            };
        }
        if (Array.isArray(values)) {
            return values.map((value) => this.store.getItem(value));
        }
        return this.store.getItem(values);
    }
    /* Check if there are Options available in the components */
    isEmpty() {
        const total = this.store.state.totalAllOptions;
        return total === 0;
    }
    /* }}} */
    /* {{{ private methods */
    computeWidth() {
        const el = this.$refs.mainInput.$el;
        this.width = el.offsetWidth;
    }
    computeOffset(doNotAddListener = false) {
        let el = this.$refs.mainInput.$el;
        let offsetLeft = el.offsetLeft;
        let offsetTop = el.offsetTop + el.offsetHeight;
        const elRootElement = document.body.parentElement;
        let isFixed = getComputedStyle(el).getPropertyValue('position') === 'fixed';
        el = el.offsetParent;
        while (el) {
            if (!doNotAddListener) {
                el.addEventListener('scroll', this.scrollListener);
                this._elementsListeners.push(el);
            }
            offsetLeft += el.offsetLeft - el.scrollLeft;
            offsetTop += el.offsetTop - el.scrollTop;
            isFixed = isFixed || getComputedStyle(el).getPropertyValue('position') === 'fixed';
            el = el.offsetParent;
        }
        /* Adjust offset for element inside fixed elements */
        if (isFixed) {
            offsetLeft += elRootElement.scrollLeft;
            offsetTop += elRootElement.scrollTop;
        }
        this.offsetLeft = offsetLeft;
        this.offsetTop = offsetTop + 1;
    }
    removeListeners() {
        this._elementsListeners.forEach((el) => {
            el.removeEventListener('scroll', this.scrollListener);
        });
        this._elementsListeners = [];
        document.body.removeEventListener('click', this.outsideListener, true);
        window.removeEventListener('resize', this.windowResize, false);
    }
    focusToggled() {
        const state = this.store.state;
        if (this.isFocused) {
            this.computeWidth();
            window.addEventListener('resize', this.windowResize, false);
            document.body.addEventListener('click', this.outsideListener, true);
            this.computeOffset();
        }
        else {
            this.removeListeners();
            if (state.status.hasChanged) {
                this.$emit('change', this.getValue(), state.selectionIsExcluded);
                this.store.resetChange();
            }
        }
    }
    compareValues(oldValue, newValue) {
        if (Array.isArray(oldValue)) {
            return Array.isArray(newValue)
                && oldValue.length === newValue.length
                && oldValue.every((val) => newValue.includes(val));
        }
        return oldValue === newValue;
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onValueChange() {
        const currentValue = this.store.value;
        const newValue = this.value;
        const areSimilar = this.compareValues(currentValue, newValue);
        if (!areSimilar) {
            this.store.value = this.value;
        }
    }
    onExcludedChange() {
        this.store.selectionIsExcluded = this.selectionIsExcluded;
    }
    onOptionsChange() {
        this.store.options = this.options;
    }
    onTextsChange() {
        const texts = this.texts;
        if (texts) {
            this.changeTexts(texts);
        }
    }
    onDisabledChange() {
        this.store.disabled = this.disabled;
    }
    onGroupsChanged() {
        this.store.changeGroups(this.groups);
    }
    onPlaceholderChanged() {
        this.store.commit('placeholder', this.placeholder);
    }
    onFocusChanged() {
        this.focusToggled();
    }
    onInternalValueChange() {
        const oldValue = this._oldValue;
        const value = this.getValue();
        const areSimilar = this.compareValues(oldValue, value);
        const canTrigger = oldValue !== undefined && !areSimilar;
        if (canTrigger) {
            const selectionIsExcluded = this.store.state.selectionIsExcluded;
            this.$emit('input', value, selectionIsExcluded);
            if (!this.isFocused) {
                this.$emit('change', value, selectionIsExcluded);
                this.store.resetChange();
            }
        }
        this._oldValue = Array.isArray(value) ? value.slice() : value;
    }
    /* }}} */
    /* {{{ methods */
    checkFocus() {
        /* Await that focused element becomes active */
        setTimeout(() => {
            const focusedEl = document.activeElement;
            const extendedList = this.$refs.extendedList;
            /* check if there is a focused element (if none the body is
             * selected) and if it is inside current Selectic */
            if (focusedEl === document.body
                || this.$el.contains(focusedEl)
                || (extendedList && extendedList.$el.contains(focusedEl))) {
                return;
            }
            this.store.commit('isOpen', false);
        }, 0);
    }
    /* }}} */
    /* {{{ Life cycle */
    created() {
        this._elementsListeners = [];
        this.store = new Store({ propsData: {
                options: this.options,
                value: this.value,
                selectionIsExcluded: this.selectionIsExcluded,
                disabled: this.disabled,
                texts: this.texts,
                groups: this.groups,
                params: {
                    multiple: this.multiple,
                    pageSize: this.params.pageSize || 100,
                    hideFilter: this.params.hideFilter !== undefined
                        ? this.params.hideFilter : 'auto',
                    allowRevert: this.params.allowRevert,
                    allowClearSelection: this.params.allowClearSelection || false,
                    autoSelect: this.params.autoSelect === undefined
                        ? !this.multiple && !this.params.fetchCallback
                        : this.params.autoSelect,
                    autoDisabled: typeof this.params.autoDisabled === 'boolean'
                        ? this.params.autoDisabled : true,
                    strictValue: this.params.strictValue || false,
                    selectionOverflow: this.params.selectionOverflow || 'collapsed',
                    placeholder: this.placeholder,
                    formatOption: this.params.formatOption,
                    formatSelection: this.params.formatSelection,
                },
                fetchCallback: this.params.fetchCallback,
                getItemsCallback: this.params.getItemsCallback,
            } });
    }
    mounted() {
        setTimeout(() => this.computeOffset(), 0);
    }
    beforeDestroy() {
        this.removeListeners();
    }
    /* }}} */
    render() {
        const h = this.renderWrapper();
        return (h("div", { class: this.selecticClass, title: this.title, "data-selectic": "true", on: {
                'click.prevent.stop': () => this.store.commit('isOpen', true),
            } },
            h("input", { type: "text", id: this.id, value: this.inputValue, class: "selectic__input-value", on: {
                    focus: () => this.store.commit('isOpen', true),
                    blur: this.checkFocus,
                } }),
            h(MainInput, { store: this.store, id: this.id, on: {
                    'item:click': (id) => this.$emit('item:click', id),
                }, ref: "mainInput" }),
            this.isFocused && (h(ExtendedList$1, { store: this.store, offsetTop: this.offsetTop, offsetLeft: this.offsetLeft, width: this.width, ref: "extendedList" }))));
    }
};
__decorate$5([
    Prop()
], Selectic$1.prototype, "value", void 0);
__decorate$5([
    Prop({ default: false })
], Selectic$1.prototype, "selectionIsExcluded", void 0);
__decorate$5([
    Prop({ default: () => [] })
], Selectic$1.prototype, "options", void 0);
__decorate$5([
    Prop({ default: () => [] })
], Selectic$1.prototype, "groups", void 0);
__decorate$5([
    Prop({ default: false })
], Selectic$1.prototype, "multiple", void 0);
__decorate$5([
    Prop({ default: false })
], Selectic$1.prototype, "disabled", void 0);
__decorate$5([
    Prop({ default: '' })
], Selectic$1.prototype, "placeholder", void 0);
__decorate$5([
    Prop({ default: '' })
], Selectic$1.prototype, "id", void 0);
__decorate$5([
    Prop({ default: '' })
], Selectic$1.prototype, "className", void 0);
__decorate$5([
    Prop()
], Selectic$1.prototype, "title", void 0);
__decorate$5([
    Prop()
], Selectic$1.prototype, "texts", void 0);
__decorate$5([
    Prop({ default: () => ({
            allowClearSelection: false,
            strictValue: false,
            selectionOverflow: 'collapsed',
        }) })
], Selectic$1.prototype, "params", void 0);
__decorate$5([
    Watch('value')
], Selectic$1.prototype, "onValueChange", null);
__decorate$5([
    Watch('selectionIsExcluded')
], Selectic$1.prototype, "onExcludedChange", null);
__decorate$5([
    Watch('options')
], Selectic$1.prototype, "onOptionsChange", null);
__decorate$5([
    Watch('texts')
], Selectic$1.prototype, "onTextsChange", null);
__decorate$5([
    Watch('disabled')
], Selectic$1.prototype, "onDisabledChange", null);
__decorate$5([
    Watch('groups')
], Selectic$1.prototype, "onGroupsChanged", null);
__decorate$5([
    Watch('placeholder')
], Selectic$1.prototype, "onPlaceholderChanged", null);
__decorate$5([
    Watch('isFocused')
], Selectic$1.prototype, "onFocusChanged", null);
__decorate$5([
    Watch('store.state.internalValue')
], Selectic$1.prototype, "onInternalValueChange", null);
Selectic$1 = __decorate$5([
    Component
], Selectic$1);
var Selectic$2 = Selectic$1;

export default Selectic$2;
export { changeTexts$1 as changeTexts };
