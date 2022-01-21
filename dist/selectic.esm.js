import { Prop, Watch, Component, Vue, h, Emit } from 'vtyx';
import { reactive, computed, unref, watch } from 'vue';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/* {{{ Variables */\n\n:root {\n    --selectic-font-size: 14px;\n    --selectic-cursor-disabled: not-allowed;\n\n    /* The main element */\n    --selectic-color: #555555;\n    --selectic-bg: #ffffff;\n\n    /* The main element (when disabled) */\n    --selectic-color-disabled: #787878;\n    --selectic-bg-disabled: #eeeeee;\n\n    /* The list */\n    --selectic-panel-bg: #f0f0f0;\n    --selectic-separator-bordercolor: #cccccc;\n    /* --selectic-item-color: var(--selectic-color); /* Can be set in any CSS configuration */\n\n    /* The current selected item */\n    --selectic-selected-item-color: #428bca;\n\n    /* When mouse is over items or by selecting with key arrows */\n    --selectic-active-item-color: #ffffff;\n    --selectic-active-item-bg: #66afe9;\n\n    /* Selected values in main element */\n    --selectic-value-bg: #f0f0f0;\n    /* --selectic-more-items-bg: var(--selectic-info-bg); /* can be set in any CSS configuration */\n    /* --selectic-more-items-color: var(--selectic-info-color); /* can be set in any CSS configuration */\n    --selectic-more-items-bg-disabled: #cccccc;\n\n    /* Information message */\n    --selectic-info-bg: #5bc0de;\n    --selectic-info-color: #ffffff;\n\n    /* Error message */\n    --selectic-error-bg: #b72c29;\n    --selectic-error-color: #ffffff;\n\n    /* XXX: Currently it is important to keep this size for a correct scroll\n     * height estimation */\n    --selectic-input-height: 30px;\n}\n\n/* }}} */\n/* {{{ Bootstrap equivalent style */\n\n.selectic .form-control {\n    display: block;\n    width: 100%;\n    height: calc(var(--selectic-input-height) - 2px);\n    font-size: var(--selectic-font-size);\n    line-height: 1.42857143;\n    color: var(--selectic-color);\n    background-color: var(--selectic-bg);\n    background-image: none;\n    border: 1px solid var(--selectic-separator-bordercolor); /* should use a better variable */\n    border-radius: 4px;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n    transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n}\n.selectic .has-feedback {\n    position: relative;\n}\n.selectic .has-feedback .form-control {\n    padding-right: calc(var(--selectic-input-height) + 4px);\n}\n\n.selectic .form-control-feedback.fa,\n.selectic .form-control-feedback {\n    position: absolute;\n    top: 0;\n    right: 0;\n    z-index: 2;\n    display: block;\n    width: calc(var(--selectic-input-height) + 4px);\n    height: calc(var(--selectic-input-height) + 4px);\n    line-height: var(--selectic-input-height);\n    text-align: center;\n    pointer-events: none;\n}\n\n.selectic .alert-info {\n    background-color: var(--selectic-info-bg);\n    color: var(--selectic-info-color);\n}\n\n.selectic .alert-danger {\n    background-color: var(--selectic-error-bg);\n    color: var(--selectic-error-color);\n}\n\n/* }}} */\n\n.selectic * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.selectic.form-control {\n    display: inline-block;\n    padding: 0;\n    cursor: pointer;\n    border: unset;\n}\n\n.has-feedback .selectic__icon-container.form-control-feedback {\n    right: 0;\n}\n\n/* The input which contains the selected value\n * XXX: This input should stay hidden behind other elements, but is \"visible\"\n * (in term of DOM point of view) in order to get and to trigger the `focus`\n * DOM event. */\n.selectic__input-value {\n    position: fixed;\n    opacity: 0;\n    z-index: -1000;\n    top: -100px;\n}\n\n/* XXX: .form-control has been added to this selector to improve priority and\n * override some rules of the original .form-control */\n.selectic-input.form-control {\n    display: inline-flex;\n    justify-content: space-between;\n    overflow: hidden;\n    width: 100%;\n    min-height: var(--selectic-input-height);\n    padding-top: 0;\n    padding-bottom: 0;\n    padding-left: 5px;\n    line-height: calc(var(--selectic-input-height) - 4px);\n    color: var(--selectic-color);\n}\n\n.selectic-input__reverse-icon {\n    align-self: center;\n    margin-right: 3px;\n    cursor: default;\n}\n.selectic-input__clear-icon {\n    align-self: center;\n    margin-left: 3px;\n    cursor: pointer;\n}\n.selectic-input__clear-icon:hover {\n    color: var(--selectic-selected-item-color);\n}\n\n.selectic-input.focused {\n    border-bottom-left-radius: 0px;\n    border-bottom-right-radius: 0px;\n}\n\n.selectic-input.disabled {\n    cursor: var(--selectic-cursor-disabled);\n    background-color: var(--selectic-bg-disabled);\n}\n.selectic-input.disabled .more-items {\n\tbackground-color: var(--selectic-more-items-bg-disabled);\n}\n\n.selectic-input__selected-items {\n    display: inline-flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    white-space: nowrap;\n}\n\n.selectic-input__selected-items__placeholder {\n    font-style: italic;\n    opacity: 0.7;\n    white-space: nowrap;\n}\n\n.selectic-icon {\n    color: var(--selectic-color);\n    text-align: center;\n    vertical-align: middle;\n}\n\n.selectic__extended-list {\n    position: fixed;\n    z-index: 2000;\n    height: auto;\n    background-color: var(--selectic-bg, #ffffff);\n    box-shadow: 2px 5px 12px 0px #888888;\n    border-radius: 0 0 4px 4px;\n    padding: 0;\n    min-width: 200px;\n}\n.selectic__extended-list__list-items {\n    max-height: calc(var(--selectic-input-height) * 10);\n    overflow: auto;\n    padding-left: 0;\n}\n\n.selectic-item {\n    display: block;\n    position: relative;\n    box-sizing: border-box;\n    padding: 2px 8px;\n    color: var(--selectic-item-color, var(--selectic-color));\n    min-height: calc(var(--selectic-input-height) - 3px);\n    list-style-type: none;\n    white-space: nowrap;\n    cursor: pointer;\n}\n\n.selectic-item_text {\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.selectic-item:not(.selected) .selectic-item_icon {\n    opacity: 0;\n}\n\n.selectic-item_text {\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.selectic-item__active {\n    background-color: var(--selectic-active-item-bg);\n    color: var(--selectic-active-item-color);\n}\n.selectic-item__active:not(.selected) .selectic-item_icon {\n    opacity: 0.2;\n}\n\n.selectic-item__disabled {\n    color: var(--selectic-color-disabled);\n    background-color: var(--selectic-bg-disabled);\n}\n\n.selectic-item__is-in-group {\n    padding-left: 2em;\n}\n\n.selectic-item__is-group {\n    font-weight: bold;\n    cursor: default;\n}\n\n.selectic-item.selected {\n    color: var(--selectic-selected-item-color);\n}\n.selectic-search-scope {\n    color: #e0e0e0;\n    left: auto;\n    right: 10px;\n}\n\n.selectic__message {\n    text-align: center;\n    padding: 3px;\n}\n\n.selectic .filter-panel {\n    padding: 3px;\n    margin-left: 0px;\n    margin-right: 0px;\n    background-color: var(--selectic-panel-bg);\n    border-bottom: 1px solid var(--selectic-separator-bordercolor);\n}\n\n.selectic .panelclosed {\n    max-height: 0px;\n    transition: max-height 0.3s ease-out;\n    overflow: hidden;\n}\n\n.panelopened {\n    max-height: 200px;\n    transition: max-height 0.3s ease-in;\n    overflow: hidden;\n}\n\n.selectic .filter-panel__input {\n    padding-left: 0px;\n    padding-right: 0px;\n    padding-bottom: 10px;\n    margin-bottom: 0px;\n}\n.selectic .filter-input {\n    height: calc(var(--selectic-input-height) * 0.75);\n}\n\n.selectic .checkbox-filter {\n    padding: 5px;\n    text-align: center;\n}\n\n.selectic .curtain-handler {\n    text-align: center;\n}\n\n.selectic .toggle-selectic {\n    margin: 5px;\n    padding-left: 0px;\n    padding-right: 0px;\n}\n\n.selectic .toggle-boolean-select-all-toggle {\n    display: inline;\n    margin-right: 15px;\n}\n\n.selectic .toggle-boolean-excluding-toggle {\n    display: inline;\n    margin-right: 15px;\n}\n\n.selectic .single-value {\n    display: grid;\n    grid-template: \"value icon\" 1fr / max-content max-content;\n\n    padding: 2px;\n    padding-left: 5px;\n    margin-left: 0;\n    margin-right: 5px;\n    /* margin top/bottom are mainly to create a gutter in multilines */\n    margin-top: 2px;\n    margin-bottom: 2px;\n\n    border-radius: 3px;\n    background-color: var(--selectic-value-bg);\n    max-height: calc(var(--selectic-input-height) - 10px);\n    max-width: 100%;\n    min-width: 30px;\n\n    overflow: hidden;\n    white-space: nowrap;\n    line-height: initial;\n    vertical-align: middle;\n}\n\n.selectic .more-items {\n    display: inline-block;\n\n    padding-left: 5px;\n    padding-right: 5px;\n    border-radius: 10px;\n\n    background-color: var(--selectic-more-items-bg, var(--selectic-info-bg));\n    color: var(--selectic-more-items-color, var(--selectic-info-color));\n    cursor: help;\n}\n.selectic-input__selected-items__value {\n    grid-area: value;\n    align-self: center;\n    justify-self: normal;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    white-space: nowrap;\n}\n\n.selectic-input__selected-items__icon {\n    grid-area: icon;\n    align-self: center;\n    justify-self: center;\n    margin-left: 5px;\n}\n.selectic-input__selected-items__icon:hover {\n    color: var(--selectic-selected-item-color);\n}\n\n.selectic__label-disabled {\n    opacity: 0.5;\n    transition: opacity 400ms;\n}\n\n/* XXX: override padding of bootstrap input-sm.\n * This padding introduce a line shift. */\n.selectic.input-sm {\n    padding: 0;\n}\n\n/* {{{ overflow multiline */\n\n.selectic--overflow-multiline,\n.selectic--overflow-multiline.form-control,\n.selectic--overflow-multiline .form-control {\n    height: unset;\n}\n\n.selectic--overflow-multiline .selectic-input {\n    overflow: unset;\n}\n\n.selectic--overflow-multiline .selectic-input__selected-items {\n    flex-wrap: wrap;\n}\n\n/* }}} */\n";
styleInject(css_248z);

/**
 * Clone the object and its inner properties.
 * @param obj The object to be clone.
 * @param refs internal reference to object to avoid cyclic references
 * @returns a copy of obj
 */
function deepClone(obj, refs = new WeakMap()) {
    /* For circular references */
    if (refs.has(obj)) {
        return refs.get(obj);
    }
    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            const ref = [];
            refs.set(obj, ref);
            obj.forEach((val, idx) => {
                ref[idx] = deepClone(val, refs);
            });
            return ref;
        }
        if (obj instanceof RegExp) {
            const ref = new RegExp(obj.source, obj.flags);
            refs.set(obj, ref);
            return ref;
        }
        /* This should be an object */
        const ref = {};
        refs.set(obj, ref);
        for (const [key, val] of Object.entries(obj)) {
            ref[key] = deepClone(val, refs);
        }
        return ref;
    }
    /* This should be a primitive */
    return obj;
}
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
/** Does the same as Object.assign but does not replace if value is undefined */
function assignObject(obj, ...sourceObjects) {
    const result = obj;
    for (const source of sourceObjects) {
        for (const key of Object.keys(source)) {
            const value = source[key];
            if (value === undefined) {
                continue;
            }
            result[key] = value;
        }
    }
    return result;
}

/* File Purpose:
 * It keeps and computes all states at a single place.
 * Every inner components of Selectic should communicate with this file to
 * change or to get states.
 */
/* }}} */
/* {{{ Static */
function changeTexts$1(texts) {
    messages = Object.assign(messages, texts);
}
/* }}} */
let messages = {
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
let closePreviousSelectic;
/* }}} */
let uid = 0;
class SelecticStore {
    constructor(props = {}) {
        /* Do not need reactivity */
        this.requestId = 0;
        this._uid = ++uid;
        /* {{{ Props */
        const defaultProps = {
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
        const propsVal = assignObject(defaultProps, props);
        this.props = reactive(propsVal);
        /* }}} */
        /* {{{ data */
        this.state = reactive({
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
            let isPartial = typeof this.props.fetchCallback === 'function';
            if (isPartial &&
                state.optionBehaviorOperation === 'force' &&
                this.data.activeOrder !== 'D') {
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
            var _a;
            const value = (_a = this.props.value) !== null && _a !== void 0 ? _a : null;
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
                areAllSelected = this.state.filteredOptions.every((item) => !!(+item.selected ^ selectionIsExcluded));
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
        };
        const value = this.props.value;
        /* set initial value for non reactive attribute */
        this.cacheRequest = new Map();
        const stateParam = Object.assign({}, this.props.params);
        if (stateParam.optionBehavior) {
            this.buildOptionBehavior(stateParam.optionBehavior, stateParam);
            delete stateParam.optionBehavior;
        }
        if (stateParam.hideFilter === 'auto') {
            delete stateParam.hideFilter;
        }
        else if (stateParam.hideFilter === 'open') {
            this.state.keepFilterOpen = true;
            delete stateParam.hideFilter;
        }
        /* Update state */
        assignObject(this.state, stateParam);
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
                if (value) {
                    this.buildFilteredOptions();
                }
                else {
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
    setAutomaticChange() {
        this.state.status.automaticChange = true;
        setTimeout(() => this.state.status.automaticChange = false, 0);
    }
    setAutomaticClose() {
        this.state.status.automaticClose = true;
        setTimeout(() => this.state.status.automaticClose = false, 0);
    }
    getItem(id) {
        let item;
        if (this.hasItemInStore(id)) {
            item = this.data.cacheItem.get(id);
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
        const getItemsCallback = this.props.getItemsCallback;
        if (itemsToFetch.length && typeof getItemsCallback === 'function') {
            const cacheRequest = this.cacheRequest;
            const requestId = itemsToFetch.toString();
            let promise;
            if (cacheRequest.has(requestId)) {
                promise = cacheRequest.get(requestId);
            }
            else {
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
    selectItem(id, selected, keepOpen = false) {
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
    toggleSelectAll() {
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
        this.data.doNotUpdate = true;
        this.state.filteredOptions.forEach((item) => this.selectItem(item.id, selectAll));
        this.data.doNotUpdate = false;
        this.updateFilteredOptions();
    }
    resetChange() {
        this.state.status.hasChanged = false;
    }
    resetErrorMessage() {
        this.state.status.errorMessage = '';
    }
    clearCache(forceReset = false) {
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
        this.data.labels = Object.assign({}, this.data.labels, texts);
    }
    /* }}} */
    /* {{{ private methods */
    hasValue(id) {
        if (id === null) {
            return true;
        }
        return !!this.getValue(id);
    }
    getValue(id) {
        function findId(option) {
            return option.id === id;
        }
        return this.state.filteredOptions.find(findId) ||
            this.state.dynOptions.find(findId) ||
            unref(this.listOptions).find(findId) ||
            unref(this.elementOptions).find(findId);
    }
    convertTypeValue(oldValue) {
        const state = this.state;
        const isMultiple = state.multiple;
        let newValue = oldValue;
        if (isMultiple) {
            if (!Array.isArray(oldValue)) {
                newValue = oldValue === null ? [] : [oldValue];
            }
        }
        else {
            if (Array.isArray(oldValue)) {
                const value = oldValue[0];
                newValue = typeof value === 'undefined' ? null : value;
            }
        }
        return newValue;
    }
    assertValueType() {
        const state = this.state;
        const internalValue = state.internalValue;
        const newValue = this.convertTypeValue(internalValue);
        if (newValue !== internalValue) {
            this.setAutomaticChange();
            state.internalValue = newValue;
        }
    }
    assertCorrectValue(applyStrict = false) {
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
            state.selectionIsExcluded = false;
        }
        if (checkStrict) {
            let isDifferent = false;
            let filteredValue;
            if (isMultiple) {
                filteredValue = newValue
                    .filter((value) => this.hasItemInStore(value));
                isDifferent = filteredValue.length !== newValue.length;
                if (isDifferent && isPartial && !applyStrict) {
                    this.getItems(newValue)
                        .then(() => this.assertCorrectValue(true));
                    return;
                }
            }
            else if (newValue !== null && !this.hasItemInStore(newValue)) {
                filteredValue = null;
                isDifferent = true;
                if (isPartial && !applyStrict) {
                    this.getItems([newValue])
                        .then(() => this.assertCorrectValue(true));
                    return;
                }
            }
            if (isDifferent) {
                this.setAutomaticChange();
                newValue = filteredValue;
            }
        }
        state.internalValue = newValue;
        if (state.autoSelect && newValue === null) {
            this.checkAutoSelect();
        }
    }
    updateFilteredOptions() {
        if (!this.data.doNotUpdate) {
            this.state.filteredOptions = this.buildItems(this.state.filteredOptions);
            this.buildSelectedOptions();
        }
    }
    addGroups(groups) {
        groups.forEach((group) => {
            this.state.groups.set(group.id, group.text);
        });
    }
    /* This method is for the computed property listOptions */
    getListOptions() {
        const options = this.props.options;
        const listOptions = [];
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
                const groupId = option.id;
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
    getElementOptions() {
        const options = this.props.childOptions;
        const childOptions = [];
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
                const groupId = option.id;
                state.groups.set(groupId, option.text);
                const sOpts = subOptions.map((subOpt) => {
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
    buildAllOptions(keepFetched = false) {
        const allOptions = [];
        let listOptions = [];
        let elementOptions = [];
        const optionBehaviorOrder = this.state.optionBehaviorOrder;
        let length = Infinity;
        const isPartial = unref(this.isPartial);
        const arrayFromOrder = (orderValue) => {
            switch (orderValue) {
                case 'O': return listOptions;
                case 'D': return this.state.dynOptions;
                case 'E': return elementOptions;
            }
            return [];
        };
        const lengthFromOrder = (orderValue) => {
            switch (orderValue) {
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
            }
            else {
                this.state.totalDynOptions = 0;
            }
        }
        listOptions = unref(this.listOptions);
        elementOptions = unref(this.elementOptions);
        if (this.state.optionBehaviorOperation === 'force') {
            const orderValue = optionBehaviorOrder.find((value) => lengthFromOrder(value) > 0);
            allOptions.push(...arrayFromOrder(orderValue));
            length = lengthFromOrder(orderValue);
            this.data.activeOrder = orderValue;
            this.data.dynOffset = 0;
        }
        else {
            /* sort */
            let offset = 0;
            for (const orderValue of optionBehaviorOrder) {
                const list = arrayFromOrder(orderValue);
                const lngth = lengthFromOrder(orderValue);
                if (orderValue === 'D') {
                    this.data.dynOffset = offset;
                }
                else {
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
        }
        else {
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
    async buildFilteredOptions() {
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
    async buildSelectedOptions() {
        const internalValue = this.state.internalValue;
        const state = this.state;
        if (state.multiple) {
            /* display partial information about selected items */
            state.selectedOptions = this.buildSelectedItems(internalValue);
            const items = await this.getItems(internalValue).catch(() => []);
            if (internalValue !== state.internalValue) {
                /* Values have been deprecated */
                return;
            }
            if (items.length !== internalValue.length) {
                if (!state.strictValue) {
                    const updatedItems = state.selectedOptions.map((option) => {
                        const foundItem = items.find((item) => item.id === option.id);
                        return foundItem || option;
                    });
                    state.selectedOptions = updatedItems;
                }
                else {
                    const itemIds = items.map((item) => item.id);
                    this.setAutomaticChange();
                    this.commit('internalValue', itemIds);
                }
                return;
            }
            /* display full information about selected items */
            state.selectedOptions = items;
        }
        else if (internalValue === null) {
            state.selectedOptions = null;
        }
        else {
            /* display partial information about selected items */
            state.selectedOptions = this.buildSelectedItems([internalValue])[0];
            const items = await this.getItems([internalValue]).catch(() => []);
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
    async fetchData() {
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
            const { total: rTotal, result } = await fetchCallback(search, offset, limit);
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
            }
            else {
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
        }
        catch (e) {
            state.status.errorMessage = e.message;
            if (!search) {
                state.totalDynOptions = 0;
                this.buildAllOptions(true);
            }
        }
        this.state.status.searching = false;
    }
    filterOptions(options, search) {
        if (!search) {
            return this.buildGroupItems(options);
        }
        /* Filter options on what is search for */
        const rgx = convertToRegExp(search, 'i');
        return this.buildGroupItems(options.filter((option) => rgx.test(option.text)));
    }
    addStaticFilteredOptions(fromDynamic = false) {
        const search = this.state.searchText;
        let continueLoop = fromDynamic;
        if (this.state.optionBehaviorOperation !== 'sort') {
            return;
        }
        for (const order of this.state.optionBehaviorOrder) {
            let options = [];
            if (order === 'D') {
                if (!continueLoop) {
                    return;
                }
                continueLoop = false;
                continue;
            }
            else if (continueLoop) {
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
    buildSelectedItems(ids) {
        return this.buildItems(ids.map((id) => {
            const cacheItem = this.data.cacheItem;
            const item = cacheItem.get(id);
            return item || {
                id,
                text: String(id),
            };
        }));
    }
    hasItemInStore(id) {
        const cacheItem = this.data.cacheItem;
        let item = cacheItem.get(id);
        if (!item) {
            item = this.getValue(id);
            if (item) {
                cacheItem.set(item.id, item);
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
                /* eslint-disable-next-line no-bitwise */
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
    buildOptionBehavior(optionBehavior, state) {
        let [operation, order] = optionBehavior.split('-');
        let isValid = true;
        let orderArray;
        isValid = isValid && ['sort', 'force'].includes(operation);
        isValid = isValid && /^[ODE]+$/.test(order);
        if (!isValid) {
            const labels = this.data.labels;
            this.state.status.errorMessage = labels.unknownPropertyValue.replace(/%s/, 'optionBehavior');
            operation = 'sort';
            orderArray = ['O', 'D', 'E'];
        }
        else {
            order += 'ODE';
            orderArray = order.split('');
            /* Keep only one letter for each of them */
            orderArray = Array.from(new Set(orderArray));
        }
        state.optionBehaviorOperation = operation;
        state.optionBehaviorOrder = orderArray;
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
                this.checkAutoDisabled();
                return;
            }
        }
    }
    checkAutoDisabled() {
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
        const hasValidValue = hasValue && (Array.isArray(value) ? value.every((val) => this.hasValue(val)) :
            this.hasValue(value));
        const isEmpty = nb === 0;
        const hasOnlyOneOption = nb === 1 && hasValidValue && !state.allowClearSelection;
        if (hasOnlyOneOption || isEmpty) {
            if (state.isOpen) {
                this.setAutomaticClose();
                this.commit('isOpen', false);
            }
            this.commit('disabled', true);
        }
        else {
            this.commit('disabled', false);
        }
    }
    checkHideFilter() {
        const params = this.props.params;
        if (params && params.hideFilter !== 'auto') {
            return;
        }
        const state = this.state;
        const isPartial = unref(this.isPartial);
        if (state.multiple || isPartial) {
            state.hideFilter = false;
        }
        else {
            state.hideFilter = state.totalAllOptions <= this.data.itemsPerPage;
        }
    }
}

/* File Purpose:
 * It displays the core element which is always visible (where selection is
 * displayed) and handles all interaction with it.
 */
var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let MainInput = class MainInput extends Vue {
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
        return this.store.data.labels[labelKey];
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
        return this.store.data.labels[labelKey];
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
        const labels = store.data.labels;
        const text = nbHiddenItems === 1 ? labels.moreSelectedItem
            : labels.moreSelectedItems;
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
        if (itemsSpace <= 0) {
            /* Element is not visible in DOM */
            this.nbHiddenItems = selectedOptions.length;
            return;
        }
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
        return (h("div", { class: "has-feedback", on: {
                'click.prevent.stop': () => this.toggleFocus(),
            } },
            h("div", { id: this.selecticId, class: ['selectic-input form-control',
                    {
                        focused: this.store.state.isOpen,
                        disabled: this.store.state.disabled,
                    }] },
                this.hasValue && !this.store.state.multiple && (h("span", { class: "selectic-item_text", style: this.singleStyle, title: this.singleSelectedItem || '' }, this.singleSelectedItem)),
                this.displayPlaceholder && (h("span", { class: [
                        'selectic-input__selected-items__placeholder',
                        'selectic-item_text',
                    ], title: this.store.state.placeholder }, this.store.state.placeholder)),
                this.store.state.multiple && (h("div", { class: "selectic-input__selected-items", ref: "selectedItems" },
                    this.isSelectionReversed && (h("span", { class: "fa fa-strikethrough selectic-input__reverse-icon", title: this.reverseSelectionLabel })),
                    this.showSelectedOptions.map((item) => (h("div", { class: "single-value", style: item.style, title: item.text, on: {
                            click: () => this.$emit('item:click', item.id),
                        } },
                        h("span", { class: "selectic-input__selected-items__value" }, item.text),
                        !this.isDisabled && (h("span", { class: "fa fa-times selectic-input__selected-items__icon", on: {
                                'click.prevent.stop': () => this.selectItem(item.id),
                            } }))))),
                    this.moreSelectedNb && (h("div", { class: "single-value more-items", title: this.moreSelectedTitle }, this.moreSelectedNb)))),
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
__decorate$4([
    Prop()
], MainInput.prototype, "store", void 0);
__decorate$4([
    Prop({ default: '' })
], MainInput.prototype, "id", void 0);
__decorate$4([
    Watch('store.state.internalValue', { deep: true })
], MainInput.prototype, "onInternalChange", null);
MainInput = __decorate$4([
    Component
], MainInput);
var MainInput$1 = MainInput;

/* File Purpose:
 * It manages all controls which can filter the data.
 */
var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
        return this.store.data.labels.searchPlaceholder;
    }
    get selectionIsExcluded() {
        return this.store.state.selectionIsExcluded;
    }
    get disableSelectAll() {
        const store = this.store;
        const state = store.state;
        const isMultiple = state.multiple;
        const hasItems = state.filteredOptions.length === 0;
        const canNotSelect = !!state.searchText && !unref(store.hasAllItems);
        return !isMultiple || hasItems || canNotSelect;
    }
    get disableRevert() {
        const store = this.store;
        return !store.state.multiple || !unref(store.hasFetchedAllItems);
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
            if (el) {
                el.value += key;
                this.store.commit('searchText', el.value);
            }
            this.getFocus();
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
        if (this.store.state.keepFilterOpen === true) {
            this.closed = false;
            return;
        }
        this.closed = !this.closed;
    }
    getFocus() {
        const el = this.$refs.filterInput;
        if (!this.closed && el) {
            setTimeout(() => el.focus(), 0);
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
        const state = this.store.state;
        this.closed = !state.keepFilterOpen && !state.searchText;
        document.addEventListener('keypress', this.onKeyPressed);
        this.getFocus();
    }
    unmounted() {
        document.removeEventListener('keypress', this.onKeyPressed);
    }
    /* }}} */
    render() {
        const store = this.store;
        const state = store.state;
        const labels = store.data.labels;
        return (h("div", { class: "filter-panel" },
            h("div", { class: {
                    panelclosed: this.closed,
                    panelopened: !this.closed,
                } },
                h("div", { class: "filter-panel__input form-group has-feedback" },
                    h("input", { type: "text", class: "form-control filter-input", placeholder: this.searchPlaceholder, value: state.searchText, on: {
                            'input.stop.prevent': this.onInput,
                        }, ref: "filterInput" }),
                    h("span", { class: "fa fa-search selectic-search-scope\n                                     form-control-feedback" })),
                state.multiple && (h("div", { class: "toggle-selectic" },
                    h("label", { class: ['control-label', {
                                'selectic__label-disabled': this.disableSelectAll,
                            }] },
                        h("input", { type: "checkbox", checked: state.status.areAllSelected, disabled: this.disableSelectAll, on: {
                                change: this.onSelectAll,
                            } }),
                        labels.selectAll))),
                this.enableRevert && (h("div", { class: ['toggle-selectic', {
                            'selectic__label-disabled': this.disableRevert,
                        }] },
                    h("label", { class: "control-label" },
                        h("input", { type: "checkbox", checked: this.selectionIsExcluded, disabled: this.disableRevert, on: {
                                change: this.onExclude,
                            } }),
                        labels.excludeResult)))),
            !state.keepFilterOpen && (h("div", { class: "curtain-handler", on: {
                    'click.prevent.stop': this.togglePanel,
                } },
                h("span", { class: "fa fa-search" }),
                h("span", { class: {
                        'fa': true,
                        'fa-caret-down': this.closed,
                        'fa-caret-up': !this.closed,
                    } })))));
    }
};
__decorate$3([
    Prop()
], FilterPanel.prototype, "store", void 0);
__decorate$3([
    Watch('closed')
], FilterPanel.prototype, "onClosed", null);
FilterPanel = __decorate$3([
    Component
], FilterPanel);
var Filter = FilterPanel;

/* File Purpose:
 * It displays each item in an efficient way (optimizes DOM consumption).
 * It handles interactions with these items.
 */
var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
        /* XXX: I don't really know when we should use value or not... */
        return unref(this.store.marginSize);
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
        const idx = endIndex - this.store.data.itemsPerPage - 3 * this.itemsMargin;
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
        const itemsPerPage = this.store.data.itemsPerPage;
        const bottomIndex = Math.min(topIndex + itemsPerPage, total);
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
__decorate$2([
    Prop()
], List.prototype, "store", void 0);
__decorate$2([
    Watch('store.state.activeItemIdx')
], List.prototype, "onIndexChange", null);
__decorate$2([
    Watch('store.state.offsetItem')
], List.prototype, "onOffsetChange", null);
__decorate$2([
    Watch('filteredOptions', { deep: true })
], List.prototype, "onFilteredOptionsChange", null);
__decorate$2([
    Watch('groupId')
], List.prototype, "onGroupIdChange", null);
List = __decorate$2([
    Component
], List);
var List$1 = List;

/* File Purpose:
 * It manages the panel which is displayed when Selectic is open.
 * Content of inner elements are related to dedicated files.
 */
var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
        this.listHeight = 120;
        this.listWidth = 200;
    }
    /* }}} */
    /* {{{ computed */
    get searchingLabel() {
        return this.store.data.labels.searching;
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
                return store.data.labels.noResult;
            }
            return store.data.labels.noData;
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
    get bestPosition() {
        const windowHeight = window.innerHeight;
        const listHeight = this.listHeight;
        const inputTop = this.elementTop;
        const inputBottom = this.elementBottom;
        if (inputBottom + listHeight <= windowHeight) {
            return 'bottom';
        }
        if (listHeight < inputTop) {
            return 'top';
        }
        /* There are not enough space neither at bottom nor at top */
        return (windowHeight - inputBottom) < inputTop ? 'top' : 'bottom';
    }
    get horizontalStyle() {
        const windowWidth = window.innerWidth;
        const listWidth = this.listWidth;
        const inputLeft = this.elementLeft;
        const inputRight = this.elementRight;
        /* Check if list can extend on right */
        if (inputLeft + listWidth <= windowWidth) {
            return `left: ${inputLeft}px;`;
        }
        /* Check if list can extend on left */
        if (listWidth < inputRight) {
            return `left: ${inputRight}px; transform: translateX(-100%);`;
        }
        /* There are not enough space neither at left nor at right.
         * So do not extend the list. */
        return `left: ${inputLeft}px; min-width: unset;`;
    }
    get positionStyle() {
        let listPosition = this.store.state.listPosition;
        const horizontalStyle = this.horizontalStyle;
        if (listPosition === 'auto') {
            listPosition = this.bestPosition;
        }
        if (listPosition === 'top') {
            const transform = horizontalStyle.includes('transform')
                ? 'transform: translateX(-100%) translateY(-100%);'
                : 'transform: translateY(-100%);';
            return `
                top: ${this.elementTop}px;
                ${horizontalStyle}
                width: ${this.width}px;
                ${transform}
            `;
        }
        return `
            top: ${this.elementBottom}px;
            ${horizontalStyle}
            width: ${this.width}px;
        `;
    }
    /* }}} */
    /* {{{ watch */
    onFilteredOptionsChange() {
        this.$nextTick(this.computeListSize);
    }
    onHideFilterChange() {
        this.$nextTick(this.computeListSize);
    }
    /* }}} */
    /* {{{ methods */
    getGroup(id) {
        const group = this.store.state.groups.get(id);
        const groupName = group || ' ';
        this.topGroup = groupName;
    }
    computeListSize() {
        const box = this.$el.getBoundingClientRect();
        this.listHeight = box.height;
        this.listWidth = box.width;
    }
    /* }}} */
    /* {{{ Life cycles */
    mounted() {
        document.body.appendChild(this.$el);
        document.body.addEventListener('keydown', this.onKeyDown);
        this.computeListSize();
    }
    unmounted() {
        document.body.removeEventListener('keydown', this.onKeyDown);
        /* force the element to be removed from DOM */
        if (this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
    }
    /* }}} */
    render() {
        const store = this.store;
        const state = store.state;
        const isGroup = state.groups.size > 0 &&
            state.totalFilteredOptions > store.data.itemsPerPage;
        return (h("div", { style: this.positionStyle, class: "selectic selectic__extended-list" },
            !state.hideFilter && (h(Filter, { store: this.store })),
            isGroup && (h("span", { class: "selectic-item selectic-item--header selectic-item__is-group" }, this.topGroup)),
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
__decorate$1([
    Prop()
], ExtendedList.prototype, "store", void 0);
__decorate$1([
    Prop({ default: 0 })
], ExtendedList.prototype, "elementLeft", void 0);
__decorate$1([
    Prop({ default: 0 })
], ExtendedList.prototype, "elementRight", void 0);
__decorate$1([
    Prop({ default: 0 })
], ExtendedList.prototype, "elementTop", void 0);
__decorate$1([
    Prop({ default: 0 })
], ExtendedList.prototype, "elementBottom", void 0);
__decorate$1([
    Prop({ default: 300 })
], ExtendedList.prototype, "width", void 0);
__decorate$1([
    Watch('store.state.filteredOptions', { deep: true })
], ExtendedList.prototype, "onFilteredOptionsChange", null);
__decorate$1([
    Watch('store.state.hideFilter')
], ExtendedList.prototype, "onHideFilterChange", null);
ExtendedList = __decorate$1([
    Component
], ExtendedList);
var ExtendedList$1 = ExtendedList;

/* Component Purpose:
 * Selectic is a component to behave like <select> but can be built easily
 * from list of options (only id or more described items). It can also fetch
 * these items dynamically which allow to build very long list without loading
 * all data.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function changeTexts(texts) {
    changeTexts$1(texts);
}
let Selectic = class Selectic extends Vue {
    constructor() {
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.elementBottom = 0;
        this.elementTop = 0;
        this.elementLeft = 0;
        this.elementRight = 0;
        this.width = 0;
        this.hasBeenRendered = false;
        this.store = {};
    }
    /* }}} */
    /* {{{ computed */
    get isFocused() {
        if (!this.hasBeenRendered) {
            return false;
        }
        return !!this.store.state.isOpen;
    }
    get scrollListener() {
        return this.computeOffset.bind(this, true);
    }
    get outsideListener() {
        return (evt) => {
            if (!this.$refs) {
                /* this component should have been destroyed */
                this.removeListeners();
                this.store.commit('isOpen', false);
                return;
            }
            const store = this.store;
            const keepOpenWithOtherSelectic = this.params.keepOpenWithOtherSelectic;
            const extendedList = this.$refs.extendedList;
            if (!extendedList) {
                /* this component is not focused anymore */
                if (!keepOpenWithOtherSelectic) {
                    this.removeListeners();
                    this.store.commit('isOpen', false);
                }
                return;
            }
            const target = evt.target;
            if (!extendedList.$el.contains(target) && !this.$el.contains(target)) {
                store.commit('isOpen', false);
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
    get hasGivenValue() {
        const value = this.value;
        return value !== null && value !== undefined;
    }
    get defaultValue() {
        var _a;
        return (_a = this.params.emptyValue) !== null && _a !== void 0 ? _a : null;
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
    toggleOpen(open) {
        if (typeof open === 'undefined') {
            open = !this.store.state.isOpen;
        }
        this.store.commit('isOpen', open);
        return this.store.state.isOpen;
    }
    /* }}} */
    /* {{{ private methods */
    computeWidth() {
        const el = this.$refs.mainInput.$el;
        this.width = el.offsetWidth;
    }
    computeOffset(doNotAddListener = false) {
        const mainInput = this.$refs.mainInput;
        const mainEl = mainInput === null || mainInput === void 0 ? void 0 : mainInput.$el;
        if (!mainEl) {
            /* This method has been called too soon (before render function) */
            return;
        }
        const _elementsListeners = this._elementsListeners;
        /* add listeners */
        if (!doNotAddListener) {
            let el = mainEl;
            while (el) {
                el.addEventListener('scroll', this.scrollListener, { passive: true });
                _elementsListeners.push(el);
                el = el.parentElement;
            }
            /* Listening to window allows to listen to html/body scroll events for some browser (like Chrome) */
            window.addEventListener('scroll', this.scrollListener, { passive: true });
            _elementsListeners.push(window);
        }
        const box = mainEl.getBoundingClientRect();
        const elementBottom = box.bottom;
        const elementTop = box.top;
        const elementLeft = box.left;
        const elementRight = box.right;
        this.elementLeft = elementLeft;
        this.elementRight = elementRight;
        this.elementBottom = elementBottom;
        this.elementTop = elementTop;
    }
    removeListeners() {
        this._elementsListeners.forEach((el) => {
            el.removeEventListener('scroll', this.scrollListener, { passive: true });
        });
        this._elementsListeners = [];
        document.removeEventListener('click', this.outsideListener, true);
        window.removeEventListener('resize', this.windowResize, false);
    }
    focusToggled() {
        const store = this.store;
        const state = store.state;
        if (this.isFocused) {
            if (this.noCache) {
                store.clearCache();
            }
            this.computeWidth();
            window.addEventListener('resize', this.windowResize, false);
            document.addEventListener('click', this.outsideListener, true);
            this.computeOffset();
            this.emit('open');
        }
        else {
            this.removeListeners();
            if (state.status.hasChanged) {
                this.$emit('change', this.getValue(), state.selectionIsExcluded, this);
                this.store.resetChange();
            }
            this.emit('close');
        }
    }
    compareValues(oldValue, newValue) {
        if (Array.isArray(oldValue)) {
            return Array.isArray(newValue)
                && oldValue.length === newValue.length
                && oldValue.every((val) => newValue.includes(val));
        }
        if (oldValue === undefined && newValue === this.defaultValue) {
            return true;
        }
        return oldValue === newValue;
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onValueChange() {
        var _a;
        const currentValue = this.store.state.internalValue;
        const newValue = (_a = this.value) !== null && _a !== void 0 ? _a : null;
        const areSimilar = this.compareValues(currentValue, newValue);
        if (!areSimilar) {
            this.store.commit('internalValue', newValue);
        }
    }
    onExcludedChange() {
        this.store.props.selectionIsExcluded = this.selectionIsExcluded;
    }
    onOptionsChange() {
        this.store.props.options = deepClone(this.options);
    }
    onTextsChange() {
        const texts = this.texts;
        if (texts) {
            this.changeTexts(texts);
        }
    }
    onDisabledChange() {
        this.store.props.disabled = this.disabled;
    }
    onGroupsChanged() {
        this.store.changeGroups(this.groups);
    }
    onPlaceholderChanged() {
        this.store.commit('placeholder', this.placeholder);
    }
    onOpenChanged() {
        var _a;
        this.store.commit('isOpen', (_a = this.open) !== null && _a !== void 0 ? _a : false);
    }
    onFocusChanged() {
        this.focusToggled();
    }
    onInternalValueChange() {
        const oldValue = this._oldValue;
        const value = this.getValue();
        const areSimilar = this.compareValues(oldValue, value);
        /* should not trigger when initializing internalValue, but should do
         * if it changes the initial value */
        const canTrigger = (oldValue !== undefined || !this.hasGivenValue) && !areSimilar;
        if (canTrigger) {
            const selectionIsExcluded = this.store.state.selectionIsExcluded;
            this.emit('input', value, selectionIsExcluded);
            if (!this.isFocused) {
                this.emit('change', value, selectionIsExcluded);
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
    _emit(event, ...args) {
        this.$emit(event, ...args);
        if (typeof this._on === 'function') {
            this._on(event, ...args);
        }
    }
    emit(event, value, isExcluded) {
        const automatic = this.store.state.status.automaticChange;
        const options = {
            instance: this,
            eventType: event,
            automatic,
        };
        switch (event) {
            case 'input':
            case 'change':
                const changeOptions = Object.assign({
                    isExcluded: isExcluded,
                }, options);
                this._emit(event, value, changeOptions);
                break;
            case 'open':
            case 'focus':
                this._emit('open', options);
                this._emit('focus', options);
                break;
            case 'close':
            case 'blur':
                this._emit('close', options);
                this._emit('blur', options);
                break;
            case 'item:click':
                this._emit(event, value, options);
                break;
        }
    }
    // private extractFromNode(node: Vue.VNode, text = ''): OptionValue {
    //     function styleToString(staticStyle?: {[key: string]: string}): string | undefined {
    //         if (!staticStyle) {
    //             return;
    //         }
    //         let styles = [];
    //         for (const [key, value] of Object.entries(staticStyle)) {
    //             styles.push(`${key}: ${value}`);
    //         }
    //         return styles.join(';');
    //     }
    //     const domProps = node.data?.domProps;
    //     const attrs = node.data?.attrs;
    //     const id = domProps?.value ?? attrs?.value ?? attrs?.id ?? text;
    //     const className = node.data?.staticClass;
    //     const style = styleToString(node.data?.staticStyle);
    //     const optVal: OptionValue = {
    //         id,
    //         text,
    //         className,
    //         style,
    //     };
    //     if (attrs) {
    //         for (const [key, val] of Object.entries(attrs)) {
    //             switch(key) {
    //                 case 'title':
    //                     optVal.title = val;
    //                     break;
    //                 case 'disabled':
    //                     if (val === false) {
    //                         optVal.disabled = false;
    //                     } else {
    //                         optVal.disabled = true;
    //                     }
    //                     break;
    //                 case 'group':
    //                     optVal.group = val;
    //                     break;
    //                 case 'icon':
    //                     optVal.icon = val;
    //                     break;
    //                 case 'data':
    //                     optVal.data = val;
    //                     break;
    //                 default:
    //                     if (key.startsWith('data')) {
    //                         if (typeof optVal.data !== 'object') {
    //                             optVal.data = {};
    //                         }
    //                         optVal.data[key.slice(5)] = val;
    //                     }
    //             }
    //         }
    //     }
    //     return optVal;
    // }
    // private extractOptionFromNode(node: Vue.VNode): OptionValue {
    //     const children = node.children;
    //     const text = (children && children[0].text || '').trim();
    //     return this.extractFromNode(node, text);
    // }
    // private extractOptgroupFromNode(node: Vue.VNode): OptionValue {
    //     const attrs = node.data?.attrs;
    //     const children = node.children || [];
    //     const text = attrs?.label || '';
    //     const options: OptionValue[] = [];
    //     for (const child of children) {
    //         if (child.tag === 'option') {
    //             options.push(this.extractOptionFromNode(child));
    //         }
    //     }
    //     const opt = this.extractFromNode(node, text);
    //     opt.options = options;
    //     return opt;
    // }
    /* }}} */
    /* {{{ Life cycle */
    created() {
        var _a, _b, _c;
        this._elementsListeners = [];
        this.store = new SelecticStore({
            options: this.options,
            value: this.value,
            selectionIsExcluded: this.selectionIsExcluded,
            disabled: this.disabled,
            texts: this.texts,
            groups: this.groups,
            keepOpenWithOtherSelectic: !!this.params.keepOpenWithOtherSelectic,
            params: {
                multiple: ((_a = this.multiple) !== null && _a !== void 0 ? _a : false) !== false,
                pageSize: this.params.pageSize || 100,
                hideFilter: (_b = this.params.hideFilter) !== null && _b !== void 0 ? _b : 'auto',
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
                listPosition: this.params.listPosition || 'auto',
                optionBehavior: this.params.optionBehavior,
                isOpen: ((_c = this.open) !== null && _c !== void 0 ? _c : false) !== false,
            },
            fetchCallback: this.params.fetchCallback,
            getItemsCallback: this.params.getItemsCallback,
        });
        if (typeof this._getMethods === 'function') {
            this._getMethods({
                clearCache: this.clearCache.bind(this),
                changeTexts: this.changeTexts.bind(this),
                getValue: this.getValue.bind(this),
                getSelectedItems: this.getSelectedItems.bind(this),
                isEmpty: this.isEmpty.bind(this),
                toggleOpen: this.toggleOpen.bind(this),
            });
        }
    }
    mounted() {
        setTimeout(() => {
            this.hasBeenRendered = true;
            this.computeOffset();
        }, 100);
    }
    beforeUpdate() {
        // const elements = this.$slots.default;
        // if (!elements) {
        //     this.store.childOptions = [];
        //     return;
        // }
        // const options = [];
        // for (const node of elements) {
        //     if (node.tag === 'option') {
        //         const prop = this.extractOptionFromNode(node);
        //         options.push(prop);
        //     } else
        //     if (node.tag === 'optgroup') {
        //         const prop = this.extractOptgroupFromNode(node);
        //         options.push(prop);
        //     }
        // }
        // this.store.childOptions = options;
    }
    beforeUnmount() {
        this.removeListeners();
    }
    /* }}} */
    render() {
        const id = this.id || undefined;
        const store = this.store;
        if (!store.state) {
            return; /* component is not ready yet */
        }
        return (h("div", { class: this.selecticClass, title: this.title, "data-selectic": "true", on: {
                'click.prevent.stop': () => store.commit('isOpen', true),
            } },
            h("input", { type: "text", id: id, value: this.inputValue, class: "selectic__input-value", on: {
                    focus: () => store.commit('isOpen', true),
                    blur: this.checkFocus,
                } }),
            h(MainInput$1, { store: store, id: id, on: {
                    'item:click': (id) => this.emit('item:click', id),
                }, ref: "mainInput" }),
            this.isFocused && (h(ExtendedList$1, { class: this.className, store: store, elementBottom: this.elementBottom, elementTop: this.elementTop, elementLeft: this.elementLeft, elementRight: this.elementRight, width: this.width, ref: "extendedList" }))));
    }
};
__decorate([
    Prop()
], Selectic.prototype, "value", void 0);
__decorate([
    Prop({ default: false })
], Selectic.prototype, "selectionIsExcluded", void 0);
__decorate([
    Prop({ default: () => [] })
], Selectic.prototype, "options", void 0);
__decorate([
    Prop({ default: () => [] })
], Selectic.prototype, "groups", void 0);
__decorate([
    Prop({ default: false })
], Selectic.prototype, "multiple", void 0);
__decorate([
    Prop({ default: false })
], Selectic.prototype, "disabled", void 0);
__decorate([
    Prop({ default: '' })
], Selectic.prototype, "placeholder", void 0);
__decorate([
    Prop({ default: '' })
], Selectic.prototype, "id", void 0);
__decorate([
    Prop({ default: '' })
], Selectic.prototype, "className", void 0);
__decorate([
    Prop()
], Selectic.prototype, "title", void 0);
__decorate([
    Prop()
], Selectic.prototype, "texts", void 0);
__decorate([
    Prop({ default: false })
], Selectic.prototype, "noCache", void 0);
__decorate([
    Prop()
], Selectic.prototype, "open", void 0);
__decorate([
    Prop({ default: () => ({
            allowClearSelection: false,
            strictValue: false,
            selectionOverflow: 'collapsed',
        }) })
], Selectic.prototype, "params", void 0);
__decorate([
    Prop()
], Selectic.prototype, "_on", void 0);
__decorate([
    Prop()
], Selectic.prototype, "_getMethods", void 0);
__decorate([
    Watch('value', { deep: true })
], Selectic.prototype, "onValueChange", null);
__decorate([
    Watch('selectionIsExcluded')
], Selectic.prototype, "onExcludedChange", null);
__decorate([
    Watch('options', { deep: true })
], Selectic.prototype, "onOptionsChange", null);
__decorate([
    Watch('texts', { deep: true })
], Selectic.prototype, "onTextsChange", null);
__decorate([
    Watch('disabled')
], Selectic.prototype, "onDisabledChange", null);
__decorate([
    Watch('groups', { deep: true })
], Selectic.prototype, "onGroupsChanged", null);
__decorate([
    Watch('placeholder')
], Selectic.prototype, "onPlaceholderChanged", null);
__decorate([
    Watch('open')
], Selectic.prototype, "onOpenChanged", null);
__decorate([
    Watch('isFocused')
], Selectic.prototype, "onFocusChanged", null);
__decorate([
    Watch('store.state.internalValue', { deep: true })
], Selectic.prototype, "onInternalValueChange", null);
__decorate([
    Emit('input'),
    Emit('change'),
    Emit('open'),
    Emit('focus'),
    Emit('close'),
    Emit('blur'),
    Emit('item:click')
], Selectic.prototype, "render", null);
Selectic = __decorate([
    Component
], Selectic);
var Selectic$1 = Selectic;

export { changeTexts, Selectic$1 as default };
