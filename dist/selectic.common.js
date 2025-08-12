'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vtyx = require('vtyx');
var vue = require('vue');

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

var css_248z = "/* {{{ Variables */\n\n:root {\n    --selectic-font-size: 14px;\n    --selectic-cursor-disabled: not-allowed;\n\n    /* The main element */\n    --selectic-color: #555555;\n    --selectic-bg: #ffffff;\n\n    /* The main element (when disabled) */\n    --selectic-color-disabled: #787878;\n    --selectic-bg-disabled: #eeeeee;\n\n    /* The list */\n    --selectic-panel-bg: #f0f0f0;\n    --selectic-separator-bordercolor: #cccccc;\n    /* --selectic-item-color: var(--selectic-color); /* Can be set in any CSS configuration */\n\n    /* The current selected item */\n    --selectic-selected-item-color: #428bca;\n\n    /* When mouse is over items or by selecting with key arrows */\n    --selectic-active-item-color: #ffffff;\n    --selectic-active-item-bg: #66afe9;\n\n    /* Selected values in main element */\n    --selectic-value-bg: #f0f0f0;\n    /* --selectic-more-items-bg: var(--selectic-info-bg); /* can be set in any CSS configuration */\n    /* --selectic-more-items-color: var(--selectic-info-color); /* can be set in any CSS configuration */\n    --selectic-more-items-bg-disabled: #cccccc;\n\n    /* Information message */\n    --selectic-info-bg: #5bc0de;\n    --selectic-info-color: #ffffff;\n\n    /* Error message */\n    --selectic-error-bg: #b72c29;\n    --selectic-error-color: #ffffff;\n\n    /* XXX: Currently it is important to keep this size for a correct scroll\n     * height estimation */\n    --selectic-input-height: 30px;\n}\n\n/* }}} */\n/* {{{ Bootstrap equivalent style */\n\n.selectic .form-control {\n    display: block;\n    width: 100%;\n    height: calc(var(--selectic-input-height) - 2px);\n    font-size: var(--selectic-font-size);\n    line-height: 1.42857143;\n    color: var(--selectic-color);\n    background-color: var(--selectic-bg);\n    background-image: none;\n    border: 1px solid var(--selectic-separator-bordercolor); /* should use a better variable */\n    border-radius: 4px;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n    transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n}\n\n.selectic .has-feedback {\n    position: relative;\n}\n\n.selectic .has-feedback .form-control {\n    padding-right: calc(var(--selectic-input-height) + 4px);\n}\n\n.selectic .form-control-feedback.fa,\n.selectic .form-control-feedback {\n    position: absolute;\n    top: 0;\n    right: 0;\n    z-index: 2;\n    display: block;\n    width: calc(var(--selectic-input-height) + 4px);\n    height: calc(var(--selectic-input-height) + 4px);\n    line-height: var(--selectic-input-height);\n    text-align: center;\n    pointer-events: none;\n}\n\n.selectic .alert-info {\n    background-color: var(--selectic-info-bg);\n    color: var(--selectic-info-color);\n}\n\n.selectic .alert-danger {\n    background-color: var(--selectic-error-bg);\n    color: var(--selectic-error-color);\n}\n\n/* }}} */\n\n.selectic * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.selectic.form-control {\n    display: inline-block;\n    padding: 0;\n    cursor: pointer;\n    border: unset;\n}\n\n.has-feedback .selectic__icon-container.form-control-feedback {\n    right: 0;\n}\n\n/* The input which contains the selected value\n * XXX: This input should stay hidden behind other elements, but is \"visible\"\n * (in term of DOM point of view) in order to get and to trigger the `focus`\n * DOM event. */\n.selectic__input-value {\n    position: fixed;\n    opacity: 0;\n    z-index: -1000;\n    top: -100px;\n}\n\n/* XXX: .form-control has been added to this selector to improve priority and\n * override some rules of the original .form-control */\n.selectic-input.form-control {\n    display: inline-flex;\n    justify-content: space-between;\n    overflow: hidden;\n    width: 100%;\n    min-height: var(--selectic-input-height);\n    padding-top: 0;\n    padding-bottom: 0;\n    padding-left: 5px;\n    line-height: calc(var(--selectic-input-height) - 4px);\n    color: var(--selectic-color);\n}\n\n.selectic-input__reverse-icon {\n    align-self: center;\n    margin-right: 3px;\n    cursor: default;\n}\n\n.selectic-input__clear-icon {\n    align-self: center;\n    margin-left: 3px;\n    cursor: pointer;\n}\n\n.selectic-input__clear-icon:hover {\n    color: var(--selectic-selected-item-color);\n}\n\n.selectic-input.focused {\n    border-bottom-left-radius: 0px;\n    border-bottom-right-radius: 0px;\n}\n\n.selectic-input.disabled {\n    cursor: var(--selectic-cursor-disabled);\n    background-color: var(--selectic-bg-disabled);\n}\n\n.selectic-input.disabled .more-items {\n\tbackground-color: var(--selectic-more-items-bg-disabled);\n}\n\n.selectic-input__selected-items {\n    display: inline-flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    white-space: nowrap;\n}\n\n.selectic-input__selected-items__placeholder {\n    font-style: italic;\n    opacity: 0.7;\n    white-space: nowrap;\n}\n\n.selectic-icon {\n    color: var(--selectic-color);\n    text-align: center;\n    vertical-align: middle;\n}\n\n.selectic__extended-list {\n    position: fixed;\n    top: var(--top-position, 0);\n    z-index: 2000;\n    height: auto;\n    max-height: var(--availableSpace);\n    background-color: var(--selectic-bg, #ffffff);\n    box-shadow: 2px 5px 12px 0px #888888;\n    border-radius: 0 0 4px 4px;\n    padding: 0;\n    width: var(--list-width, 200px);\n    min-width: 200px;\n    display: grid;\n    grid-template-rows: minmax(0, max-content) 1fr;\n}\n\n.selectic__extended-list.selectic-position-top {\n    box-shadow: 2px -3px 12px 0px #888888;\n}\n\n.selectic__extended-list__list-container{\n    overflow: auto;\n}\n\n.selectic__extended-list__list-items {\n    max-height: calc(var(--selectic-input-height) * 10);\n    min-width: max-content;\n    padding-left: 0;\n}\n\n.selectic-item {\n    display: block;\n    position: relative;\n    box-sizing: border-box;\n    padding: 2px 8px;\n    color: var(--selectic-item-color, var(--selectic-color));\n    min-height: calc(var(--selectic-input-height) - 3px);\n    list-style-type: none;\n    white-space: nowrap;\n    cursor: pointer;\n}\n\n.selectic-item_text {\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.selectic-item:not(.selected) .selectic-item_icon {\n    opacity: 0;\n}\n\n.selectic-item_text {\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.selectic-item__active {\n    background-color: var(--selectic-active-item-bg);\n    color: var(--selectic-active-item-color);\n}\n\n.selectic-item__active:not(.selected) .selectic-item_icon {\n    opacity: 0.2;\n}\n\n.selectic-item__active:not(.selected) .single-select_icon {\n    opacity: 0;\n}\n\n.selectic-item__active.selectic-item__disabled:not(.selected) .selectic-item_icon {\n    opacity: 0;\n}\n\n.selectic-item__disabled {\n    color: var(--selectic-color-disabled);\n    background-color: var(--selectic-bg-disabled);\n}\n\n.selectic-item__is-in-group {\n    padding-left: 2em;\n}\n\n.selectic-item__is-group {\n    font-weight: bold;\n    cursor: default;\n}\n\n.selectic-item__is-group.selectable {\n    cursor: pointer;\n}\n\n.selectic-item.selected {\n    color: var(--selectic-selected-item-color);\n}\n\n.selectic-search-scope {\n    color: #e0e0e0;\n    left: auto;\n    right: 10px;\n}\n\n.selectic .form-control-feedback.fa.selectic-search-scope {\n    width: calc(var(--selectic-input-height) * 0.75);\n    height: calc(var(--selectic-input-height) * 0.75);\n    line-height: calc(var(--selectic-input-height) * 0.75);\n}\n\n.selectic__message {\n    text-align: center;\n    padding: 3px;\n}\n\n.selectic .filter-panel {\n    padding: 3px;\n    margin-left: 0px;\n    margin-right: 0px;\n    background-color: var(--selectic-panel-bg);\n    border-bottom: 1px solid var(--selectic-separator-bordercolor);\n}\n\n.selectic .panelclosed {\n    max-height: 0px;\n    transition: max-height 0.3s ease-out;\n    overflow: hidden;\n}\n\n.panelopened {\n    max-height: 200px;\n    transition: max-height 0.3s ease-in;\n    overflow: hidden;\n}\n\n.selectic .filter-panel__input {\n    padding-left: 0px;\n    padding-right: 0px;\n    padding-bottom: 10px;\n    margin-bottom: 0px;\n}\n\n.selectic .filter-input {\n    height: calc(var(--selectic-input-height) * 0.75);\n}\n\n.selectic .checkbox-filter {\n    padding: 5px;\n    text-align: center;\n}\n\n.selectic .curtain-handler {\n    text-align: center;\n}\n\n.selectic .toggle-selectic {\n    margin: 5px;\n    padding-left: 0px;\n    padding-right: 0px;\n}\n\n.selectic .toggle-boolean-select-all-toggle {\n    display: inline;\n    margin-right: 15px;\n}\n\n.selectic .toggle-boolean-excluding-toggle {\n    display: inline;\n    margin-right: 15px;\n}\n\n.selectic .single-value {\n    display: grid;\n    grid-template: \"value icon\" 1fr / max-content max-content;\n\n    padding: 2px;\n    padding-left: 5px;\n    margin-left: 0;\n    margin-right: 5px;\n    /* margin top/bottom are mainly to create a gutter in multilines */\n    margin-top: 2px;\n    margin-bottom: 2px;\n\n    border-radius: 3px;\n    background-color: var(--selectic-value-bg);\n    max-height: calc(var(--selectic-input-height) - 10px);\n    max-width: 100%;\n    min-width: 30px;\n\n    overflow: hidden;\n    white-space: nowrap;\n    line-height: initial;\n    vertical-align: middle;\n}\n\n.selectic .more-items {\n    display: inline-block;\n\n    padding-left: 5px;\n    padding-right: 5px;\n    border-radius: 10px;\n\n    background-color: var(--selectic-more-items-bg, var(--selectic-info-bg));\n    color: var(--selectic-more-items-color, var(--selectic-info-color));\n    cursor: help;\n}\n\n.selectic-input__selected-items__value {\n    grid-area: value;\n    align-self: center;\n    justify-self: normal;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    white-space: nowrap;\n}\n\n.selectic-input__selected-items__icon {\n    grid-area: icon;\n    align-self: center;\n    justify-self: center;\n    margin-left: 5px;\n}\n\n.selectic-input__selected-items__icon:hover {\n    color: var(--selectic-selected-item-color);\n}\n\n.selectic__label-disabled {\n    opacity: 0.5;\n    transition: opacity 400ms;\n}\n\n/* XXX: override padding of bootstrap input-sm.\n * This padding introduce a line shift. */\n.selectic.input-sm {\n    padding: 0;\n}\n\n/* {{{ overflow multiline */\n\n.selectic--overflow-multiline,\n.selectic--overflow-multiline.form-control,\n.selectic--overflow-multiline .form-control {\n    height: unset;\n}\n\n.selectic--overflow-multiline .selectic-input {\n    overflow: unset;\n}\n\n.selectic--overflow-multiline .selectic-input__selected-items {\n    flex-wrap: wrap;\n}\n\n/* {{{ icons */\n\n@keyframes selectic-animation-spin {\n    0% {\n        transform: rotate(0deg);\n    }\n    100% {\n        transform: rotate(359deg);\n    }\n}\n\n.selectic__icon {\n    height: 1em;\n    fill: currentColor;\n}\n\n.selectic-spin {\n    animation: selectic-animation-spin 2s infinite linear;\n}\n\n/* }}} */\n";
styleInject(css_248z);

/**
 * Clone the object and its inner properties.
 * @param obj The object to be clone.
 * @param attributes list of attributes to not clone.
 * @param refs internal reference to object to avoid cyclic references
 * @returns a copy of obj
 */
function deepClone(origObject, ignoreAttributes = [], refs = new WeakMap()) {
    const obj = vue.unref(origObject);
    /* For circular references */
    if (refs.has(obj)) {
        return refs.get(obj);
    }
    if (typeof obj === 'object') {
        if (obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            const ref = [];
            refs.set(obj, ref);
            obj.forEach((val, idx) => {
                ref[idx] = deepClone(val, ignoreAttributes, refs);
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
            if (ignoreAttributes.includes(key)) {
                ref[key] = val;
                continue;
            }
            ref[key] = deepClone(val, ignoreAttributes, refs);
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
            const typedKey = key;
            const value = source[typedKey];
            if (value === undefined) {
                continue;
            }
            result[typedKey] = value;
        }
    }
    return result;
}
/**
 * Ckeck whether a value is primitive.
 * @returns true if val is primitive and false otherwise.
 */
function isPrimitive(val) {
    /* The value null is treated explicitly because in JavaScript
     * `typeof null === 'object'` is evaluated to `true`.
     */
    return val === null || (typeof val !== 'object' && typeof val !== 'function');
}
/**
 * Performs a deep comparison between two objects to determine if they
 * should be considered equal.
 *
 * @param objA object to compare to objB.
 * @param objB object to compare to objA.
 * @param attributes list of attributes to not compare.
 * @param refs internal reference to object to avoid cyclic references
 * @returns true if objA should be considered equal to objB.
 */
function isDeepEqual(objA, objB, ignoreAttributes = [], refs = new WeakMap()) {
    objA = vue.unref(objA);
    objB = vue.unref(objB);
    /* For primitive types */
    if (isPrimitive(objA)) {
        return isPrimitive(objB) && Object.is(objA, objB);
    }
    /* For functions (follow the behavior of _.isEqual and compare functions
     * by reference). */
    if (typeof objA === 'function') {
        return typeof objB === 'function' && objA === objB;
    }
    /* For circular references */
    if (refs.has(objA)) {
        return refs.get(objA) === objB;
    }
    refs.set(objA, objB);
    /* For objects */
    if (typeof objA === 'object') {
        if (typeof objB !== 'object') {
            return false;
        }
        /* For arrays */
        if (Array.isArray(objA)) {
            return Array.isArray(objB) &&
                objA.length === objB.length &&
                !objA.some((val, idx) => !isDeepEqual(val, objB[idx], ignoreAttributes, refs));
        }
        /* For RegExp */
        if (objA instanceof RegExp) {
            return objB instanceof RegExp &&
                objA.source === objB.source &&
                objA.flags === objB.flags;
        }
        /* For Date */
        if (objA instanceof Date) {
            return objB instanceof Date && objA.getTime() === objB.getTime();
        }
        /* This should be an object */
        const aRec = objA;
        const bRec = objB;
        const aKeys = Object.keys(aRec).filter((key) => !ignoreAttributes.includes(key));
        const bKeys = Object.keys(bRec).filter((key) => !ignoreAttributes.includes(key));
        const differentKeyFound = aKeys.some((key) => {
            return !bKeys.includes(key) ||
                !isDeepEqual(aRec[key], bRec[key], ignoreAttributes, refs);
        });
        return aKeys.length === bKeys.length && !differentKeyFound;
    }
    return true;
}
let displayLog = false;
function debug(fName, step, ...args) {
    if (!displayLog) {
        return;
    }
    console.log('--%s-- [%s]', fName, step, ...args);
}
/** Enable logs for debugging */
debug.enable = (display) => {
    displayLog = display;
};

/* File Purpose:
 * It keeps and computes all states at a single place.
 * Every inner components of Selectic should communicate with this file to
 * change or to get states.
 */
/* For debugging */
debug.enable(false);
/* }}} */
/* {{{ Static */
function changeTexts$1(texts) {
    messages = Object.assign(messages, texts);
}
function changeIcons$1(newIcons, newFamilyIcon) {
    icons = Object.assign(icons, newIcons);
    if (newFamilyIcon) {
        defaultFamilyIcon = newFamilyIcon;
    }
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
    wrongQueryResult: 'Query did not return all results.',
};
let defaultFamilyIcon = 'selectic';
let icons = {};
let closePreviousSelectic;
/**
 * Time to wait before considering there is no other requests.
 * This time is await only if there is already a requested request.
 */
const DEBOUNCE_REQUEST = 250;
/* }}} */
let uid = 0;
class SelecticStore {
    constructor(props = {}) {
        /* Do not need reactivity */
        this.requestId = 0;
        this.requestSearchId = 0; /* Used for search request */
        this.isRequesting = false;
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
            icons: null,
            iconFamily: null,
            params: {},
            fetchCallback: null,
            getItemsCallback: null,
            keepOpenWithOtherSelectic: false,
        };
        const propsVal = assignObject(defaultProps, props);
        this.props = vue.reactive(propsVal);
        /* }}} */
        /* {{{ data */
        this.state = vue.reactive({
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
        this.data = vue.reactive({
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
        this.marginSize = vue.computed(() => {
            return this.state.pageSize / 2;
        });
        this.isPartial = vue.computed(() => {
            const state = this.state;
            let isPartial = typeof this.props.fetchCallback === 'function';
            if (isPartial &&
                state.optionBehaviorOperation === 'force' &&
                this.data.activeOrder !== 'D') {
                isPartial = false;
            }
            return isPartial;
        });
        this.hasAllItems = vue.computed(() => {
            const state = this.state;
            const nbItems = state.totalFilteredOptions + state.groups.size;
            return this.state.filteredOptions.length >= nbItems;
        });
        this.hasFetchedAllItems = vue.computed(() => {
            const isPartial = vue.unref(this.isPartial);
            if (!isPartial) {
                return true;
            }
            const state = this.state;
            return state.dynOptions.length === state.totalDynOptions;
        });
        this.listOptions = vue.computed(() => {
            return this.getListOptions();
        });
        this.elementOptions = vue.computed(() => {
            return this.getElementOptions();
        });
        this.allowGroupSelection = vue.computed(() => {
            return this.state.multiple && !this.isPartial.value && !this.state.disableGroupSelection;
        });
        /* }}} */
        /* {{{ watch */
        vue.watch(() => [this.props.options, this.props.childOptions], () => {
            this.data.cacheItem.clear();
            this.setAutomaticClose();
            this.commit('isOpen', false);
            this.clearDisplay();
            this.buildAllOptions(true);
            this.buildSelectedOptions();
        }, { deep: true });
        vue.watch(() => [this.listOptions, this.elementOptions], () => {
            /* TODO: transform allOptions as a computed properties and this
             * watcher become useless */
            this.buildAllOptions(true);
        }, { deep: true });
        vue.watch(() => this.props.value, () => {
            var _a;
            const value = (_a = this.props.value) !== null && _a !== void 0 ? _a : null;
            this.commit('internalValue', value);
        }, { deep: true });
        vue.watch(() => this.props.selectionIsExcluded, () => {
            this.commit('selectionIsExcluded', this.props.selectionIsExcluded);
        });
        vue.watch(() => this.props.disabled, () => {
            this.commit('disabled', this.props.disabled);
        });
        vue.watch(() => this.state.filteredOptions, () => {
            let areAllSelected = false;
            const hasAllItems = vue.unref(this.hasAllItems);
            if (hasAllItems) {
                const selectionIsExcluded = +this.state.selectionIsExcluded;
                /* eslint-disable-next-line no-bitwise */
                areAllSelected = this.state.filteredOptions.every((item) => !!(+item.selected ^ selectionIsExcluded));
            }
            this.state.status.areAllSelected = areAllSelected;
        }, { deep: true });
        vue.watch(() => this.state.internalValue, () => {
            this.buildSelectedOptions();
            /* If there is only one item, and the previous selected value was
             * different, then if we change it to the only available item we
             * should disable Selectic (user has no more choice).
             * This is why it is needed to check autoDisabled here. */
            this.checkAutoDisabled();
        }, { deep: true });
        vue.watch(() => this.state.allOptions, () => {
            this.checkAutoSelect();
            this.checkAutoDisabled();
        }, { deep: true });
        vue.watch(() => this.state.totalAllOptions, () => {
            this.checkHideFilter();
        });
        /* }}} */
        this.closeSelectic = () => {
            this.setAutomaticClose();
            this.commit('isOpen', false);
        };
        const value = deepClone(this.props.value);
        /* set initial value for non reactive attribute */
        this.cacheRequest = new Map();
        const stateParam = deepClone(this.props.params, ['data']);
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
    commit(name, value) {
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
        debug('commit', '(done)', name);
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
    selectGroup(id, itemsSelected) {
        const state = this.state;
        if (!vue.unref(this.allowGroupSelection)) {
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
    selectItem(id, selected, keepOpen = false) {
        const state = this.state;
        let hasChanged = false;
        const item = state.allOptions.find((opt) => opt.id === id);
        /* Check that item is not disabled */
        if (item === null || item === void 0 ? void 0 : item.disabled) {
            return hasChanged;
        }
        if (state.strictValue && !this.hasValue(id)) {
            /* reject invalid values */
            return hasChanged;
        }
        if (state.multiple) {
            /* multiple = true */
            const internalValue = state.internalValue;
            const isAlreadySelected = internalValue.includes(id);
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
                }, []);
                state.internalValue = newSelection;
                hasChanged = internalValue.length > newSelection.length;
            }
            else if (selected && !isAlreadySelected) {
                let addItem = true;
                if (item === null || item === void 0 ? void 0 : item.exclusive) {
                    const hasDisabledSelected = selectedOptions.some((opt) => {
                        return opt.disabled;
                    });
                    if (hasDisabledSelected) {
                        /* do not remove disabled item from selection */
                        addItem = false;
                    }
                    else {
                        /* clear the current selection because the item is exclusive */
                        internalValue.splice(0, Infinity);
                    }
                }
                else if (internalValue.length === 1) {
                    const selectedId = internalValue[0];
                    const selectedItem = state.allOptions.find((opt) => opt.id === selectedId);
                    if (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.exclusive) {
                        if (selectedItem.disabled) {
                            /* If selected item is disabled and exclusive do not change the selection */
                            addItem = false;
                        }
                        else {
                            /* clear the current selection because the old item was exclusive */
                            internalValue.pop();
                        }
                    }
                }
                if (addItem) {
                    internalValue.push(id);
                    hasChanged = true;
                }
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
                    return hasChanged;
                }
                const oldOption = state.selectedOptions;
                if (oldOption === null || oldOption === void 0 ? void 0 : oldOption.disabled) {
                    /* old selection is disabled so do not unselect it */
                    return hasChanged;
                }
                id = null;
            }
            else if (id === oldValue) {
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
    toggleSelectAll() {
        if (!this.state.multiple) {
            return;
        }
        const hasAllItems = vue.unref(this.hasAllItems);
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
        debug('clearCache', 'start', forceReset);
        const isPartial = vue.unref(this.isPartial);
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
    changeIcons(icons, family) {
        if (icons) {
            this.data.icons = Object.assign({}, this.data.icons, icons);
        }
        if (typeof family === 'string') {
            this.data.iconFamily = family;
        }
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
            vue.unref(this.listOptions).find(findId) ||
            vue.unref(this.elementOptions).find(findId);
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
        const isPartial = vue.unref(this.isPartial);
        if (isMultiple) {
            const hasFetchedAllItems = vue.unref(this.hasFetchedAllItems);
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
    /** Reset the display cache in order to rebuild it */
    clearDisplay() {
        debug('clearDisplay', 'start');
        this.state.filteredOptions = [];
        this.state.totalFilteredOptions = Infinity;
    }
    /** rebuild the state filteredOptions to normalize their values */
    updateFilteredOptions() {
        if (!this.data.doNotUpdate) {
            this.state.filteredOptions = this.buildItems(this.state.filteredOptions);
            this.buildSelectedOptions();
            this.updateGroupSelection();
        }
    }
    addGroups(groups) {
        groups.forEach((group) => {
            this.state.groups.set(group.id, group.text);
        });
    }
    /** This method is for the computed property listOptions */
    getListOptions() {
        const options = deepClone(this.props.options, ['data']);
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
    /** This method is for the computed property elementOptions */
    getElementOptions() {
        const options = deepClone(this.props.childOptions, ['data']);
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
    /** Generate the list of all options by combining the 3 option lists */
    buildAllOptions(keepFetched = false, stopFetch = false) {
        debug('buildAllOptions', 'start', 'keepFetched', keepFetched, 'stopFetch', stopFetch);
        const allOptions = [];
        let listOptions = [];
        let elementOptions = [];
        const optionBehaviorOrder = this.state.optionBehaviorOrder;
        let length = Infinity;
        const isPartial = vue.unref(this.isPartial);
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
        listOptions = vue.unref(this.listOptions);
        elementOptions = vue.unref(this.elementOptions);
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
        if (!stopFetch) {
            this.buildFilteredOptions().then(() => {
                /* XXX: To recompute for strict mode and auto-select */
                this.assertCorrectValue();
            });
        }
        else {
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
    async buildFilteredOptions() {
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
        const hasAllItems = vue.unref(this.hasAllItems);
        debug('buildFilteredOptions', 'start', 'hasAllItems:', hasAllItems, 'allOptions', allOptions.length, 'search:', search, 'filteredOptionsLength:', filteredOptionsLength);
        if (hasAllItems) {
            /* Everything has already been fetched and stored in filteredOptions */
            return;
        }
        const hasFetchedAllItems = vue.unref(this.hasFetchedAllItems);
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
        const marginSize = vue.unref(this.marginSize);
        const endIndex = offsetItem + marginSize;
        debug('buildFilteredOptions', 'partial options', 'offsetItem:', offsetItem, 'marginSize:', marginSize, 'filteredOptionsLength', filteredOptionsLength);
        if (endIndex <= filteredOptionsLength) {
            return;
        }
        if (!search && endIndex <= allOptionsLength) {
            this.setFilteredOptions(this.buildGroupItems(allOptions), false, totalAllOptions + state.groups.size);
            const isPartial = vue.unref(this.isPartial);
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
    async fetchRequest(fetchCallback, search, offset, limit) {
        const searchRqId = ++this.requestSearchId;
        if (!search) {
            ++this.requestId;
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
        return Object.assign(Object.assign({}, response), { 
            /* this is to fulfill the cache */
            deprecated: deprecated });
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
        const marginSize = vue.unref(this.marginSize);
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
            const { total: rTotal, result, deprecated } = response;
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
                    if (!vue.unref(this.hasFetchedAllItems)) {
                        /* Display error if all items are not fetch
                         * We can have the case where old value and result
                         * are the same but total is correct when the
                         * total is 0 */
                        errorMessage = labels.wrongQueryResult;
                    }
                    setTimeout(() => {
                        debug('fetchData', 'before buildAllOptions (stopped)', 'offsetItem:', this.state.offsetItem, 'allOptions:', this.state.allOptions.length);
                        this.buildAllOptions(true, true);
                    }, 0);
                }
                else {
                    setTimeout(() => {
                        debug('fetchData', 'before buildAllOptions', 'offsetItem:', this.state.offsetItem, 'allOptions:', this.state.allOptions.length);
                        this.buildAllOptions(true);
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
            }
            else {
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
        }
        catch (e) {
            state.status.errorMessage = e.message;
            debug('fetchData', 'error', e.message);
            if (!search) {
                state.totalDynOptions = 0;
                this.buildAllOptions(true, true);
            }
        }
        this.state.status.searching = false;
        debug('fetchData', 'end');
    }
    filterOptions(options, search) {
        debug('filterOptions', 'start', 'options:', options.length, 'search:', search);
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
        debug('addStaticFilteredOptions', 'start', 'fromDynamic:', fromDynamic, 'optionBehaviorOperation:', this.state.optionBehaviorOperation);
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
                    options = this.filterOptions(vue.unref(this.listOptions), search);
                    break;
                case 'E':
                    options = this.filterOptions(vue.unref(this.elementOptions), search);
                    break;
            }
            this.setFilteredOptions(options, true);
        }
        debug('addStaticFilteredOptions', 'end');
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
        debug('buildGroupItems', 'start', 'options:', options.length, 'previousGroupId:', previousGroupId);
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
        debug('buildGroupItems', 'end', list.length);
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
        const isPartial = vue.unref(this.isPartial);
        const doNotCheck = isPartial || this.props.disabled || !state.autoDisabled;
        const hasFetchedAllItems = vue.unref(this.hasFetchedAllItems);
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
        const hasOnlyValidValue = hasValue && !hasDisabledSelected && (Array.isArray(value) ? value.every((val) => this.hasValue(val)) :
            this.hasValue(value));
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
        const isPartial = vue.unref(this.isPartial);
        if (state.multiple || isPartial) {
            state.hideFilter = false;
        }
        else {
            state.hideFilter = state.totalAllOptions <= this.data.itemsPerPage;
        }
    }
    /** update group item, to mark them as selected if needed */
    updateGroupSelection() {
        const state = this.state;
        if (!vue.unref(this.allowGroupSelection)) {
            return;
        }
        const filteredOptions = state.filteredOptions;
        const groupIdx = new Map();
        const groupAllSelected = new Map();
        const groupNbItem = new Map();
        filteredOptions.forEach((option, idx) => {
            const groupId = option.group;
            if (option.isGroup) {
                const id = option.id;
                groupIdx.set(id, idx);
                groupAllSelected.set(id, true);
            }
            else if (groupId !== undefined) {
                if (option.disabled || option.exclusive) {
                    return;
                }
                groupNbItem.set(groupId, (groupNbItem.get(groupId) || 0) + 1);
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
    setFilteredOptions(options, add = false, length = 0) {
        debug('setFilteredOptions', 'start', 'options:', options.length, 'add', add, 'length', length);
        if (!add) {
            this.state.filteredOptions = options;
            this.state.totalFilteredOptions = length || options.length;
        }
        else {
            this.state.filteredOptions.push(...options);
            this.state.totalFilteredOptions += length || options.length;
        }
        this.updateGroupSelection();
    }
}

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$e = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconCaretDown = class IconCaretDown extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M7,10L12,15L17,10H7Z" })));
    }
};
IconCaretDown = __decorate$e([
    vtyx.Component
], IconCaretDown);
var IconCaretDown$1 = IconCaretDown;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$d = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconCaretUp = class IconCaretUp extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M7,15L12,10L17,15H7Z" })));
    }
};
IconCaretUp = __decorate$d([
    vtyx.Component
], IconCaretUp);
var IconCaretUp$1 = IconCaretUp;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$c = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconCheck = class IconCheck extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" })));
    }
};
IconCheck = __decorate$c([
    vtyx.Component
], IconCheck);
var IconCheck$1 = IconCheck;

var __decorate$b = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconDot = class IconDot extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("circle", { cx: "8", cy: "16", r: "3.5" })));
    }
};
IconDot = __decorate$b([
    vtyx.Component
], IconDot);
var IconDot$1 = IconDot;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$a = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconQuestion = class IconQuestion extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z" })));
    }
};
IconQuestion = __decorate$a([
    vtyx.Component
], IconQuestion);
var IconQuestion$1 = IconQuestion;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$9 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconSearch = class IconSearch extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" })));
    }
};
IconSearch = __decorate$9([
    vtyx.Component
], IconSearch);
var IconSearch$1 = IconSearch;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$8 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconSpinner = class IconSpinner extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" })));
    }
};
IconSpinner = __decorate$8([
    vtyx.Component
], IconSpinner);
var IconSpinner$1 = IconSpinner;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$7 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconStrikeThrough = class IconStrikeThrough extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M7.2 9.8C6 7.5 7.7 4.8 10.1 4.3C13.2 3.3 17.7 4.7 17.6 8.5H14.6C14.6 8.2 14.5 7.9 14.5 7.7C14.3 7.1 13.9 6.8 13.3 6.6C12.5 6.3 11.2 6.4 10.5 6.9C9 8.2 10.4 9.5 12 10H7.4C7.3 9.9 7.3 9.8 7.2 9.8M21 13V11H3V13H12.6C12.8 13.1 13 13.1 13.2 13.2C13.8 13.5 14.3 13.7 14.5 14.3C14.6 14.7 14.7 15.2 14.5 15.6C14.3 16.1 13.9 16.3 13.4 16.5C11.6 17 9.4 16.3 9.5 14.1H6.5C6.4 16.7 8.6 18.5 11 18.8C14.8 19.6 19.3 17.2 17.3 12.9L21 13Z" })));
    }
};
IconStrikeThrough = __decorate$7([
    vtyx.Component
], IconStrikeThrough);
var IconStrikeThrough$1 = IconStrikeThrough;

/* This icon is from <https://github.com/Templarian/MaterialDesign>,
 * distributed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0) license
 */
var __decorate$6 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let IconTimes = class IconTimes extends vtyx.Vue {
    render() {
        return (vtyx.h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
            vtyx.h("path", { d: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" })));
    }
};
IconTimes = __decorate$6([
    vtyx.Component
], IconTimes);
var IconTimes$1 = IconTimes;

/* File Purpose:
 * Display the wanted icon.
 */
var __decorate$5 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let Icon = class Icon extends vtyx.Vue {
    /* }}} */
    /* {{{ computed */
    get rawIconValue() {
        const key = this.icon;
        const icon = this.store.data.icons[key];
        if (icon === undefined) {
            return key;
        }
        return icon;
    }
    get family() {
        const iconValue = this.rawIconValue;
        if (iconValue.startsWith('selectic:')) {
            return 'selectic';
        }
        if (iconValue.startsWith('raw:')) {
            return 'raw';
        }
        return this.store.data.iconFamily;
    }
    get iconValue() {
        const key = this.rawIconValue;
        if (key.includes(':')) {
            /* This is to retrieve value from string such as
             * 'selectic:spinner:spin' (and get only 'spinner') */
            const value = key.split(':');
            return value[1];
        }
        return key;
    }
    get vueIcon() {
        switch (this.icon) {
            case 'caret-down':
                return IconCaretDown$1;
            case 'caret-up':
                return IconCaretUp$1;
            case 'check':
                return IconCheck$1;
            case 'dot':
                return IconDot$1;
            case 'search':
                return IconSearch$1;
            case 'spinner':
                return IconSpinner$1;
            case 'strikethrough':
                return IconStrikeThrough$1;
            case 'times':
                return IconTimes$1;
            case 'question':
            default:
                return IconQuestion$1;
        }
    }
    get spinClass() {
        var _a;
        let value = this.store.data.icons.spin;
        if (typeof value === 'string') {
            if (value.startsWith('selectic:')) {
                return 'selectic-spin';
            }
            if (value.includes(':')) {
                value = (_a = value.split(':')[1]) !== null && _a !== void 0 ? _a : 'spin';
            }
        }
        else {
            value = 'spin';
        }
        const family = this.family;
        let prefix = '';
        switch (family) {
            case 'font-awesome-4':
                prefix = 'fa-';
                break;
            case 'font-awesome-5':
                prefix = 'fa-';
                break;
            case 'font-awesome-6':
                prefix = 'fa-';
                break;
            case '':
            case 'selectic':
                prefix = 'selectic-';
                break;
            case 'raw':
                prefix = '';
                break;
            default:
                prefix = 'selectic-';
        }
        return `${prefix}${value}`;
    }
    get spinActive() {
        return this.spin || this.rawIconValue.endsWith(':spin');
    }
    /* }}} */
    renderInnerIcon() {
        const component = this.vueIcon;
        return vtyx.h(component, {
            class: {
                'selectic__icon': true,
                [this.spinClass]: this.spinActive,
            },
            title: this.title,
        });
    }
    renderSpanIcon(prefix) {
        const classSpin = this.spinActive && this.spinClass || '';
        return (vtyx.h("span", { class: `${prefix}${this.iconValue} ${classSpin}`, title: this.title }));
    }
    render() {
        const family = this.family;
        switch (family) {
            case '':
            case 'selectic':
                return this.renderInnerIcon();
            case 'font-awesome-4':
                return this.renderSpanIcon('fa fa-fw fa-');
            case 'font-awesome-5':
                return this.renderSpanIcon('fas fa-fw fa-');
            case 'font-awesome-4':
                return this.renderSpanIcon('fa-solid fa-fw fa-');
            case 'raw':
                return this.renderSpanIcon('');
            default:
                if (family.startsWith('prefix:')) {
                    return this.renderSpanIcon(family.slice(7));
                }
                return this.renderInnerIcon();
        }
    }
};
__decorate$5([
    vtyx.Prop()
], Icon.prototype, "store", void 0);
__decorate$5([
    vtyx.Prop()
], Icon.prototype, "icon", void 0);
__decorate$5([
    vtyx.Prop()
], Icon.prototype, "spin", void 0);
__decorate$5([
    vtyx.Prop()
], Icon.prototype, "title", void 0);
Icon = __decorate$5([
    vtyx.Component
], Icon);
var Icon$1 = Icon;

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
let MainInput = class MainInput extends vtyx.Vue {
    constructor() {
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.nbHiddenItems = 0;
        /* reactivity non needed */
        this.domObserver = null;
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
    get disabledList() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        const value = state.selectedOptions;
        if (!isMultiple || !value) {
            return [];
        }
        const disabledValues = value.filter((option) => {
            return option.disabled;
        });
        return disabledValues;
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
        const nbSelection = (Array.isArray(value) && value.length) || 0;
        const hasOnlyOneValue = nbSelection === 1;
        const hasOnlyDisabled = nbSelection <= this.disabledList.length;
        /* Should not display the clear action if there is only one selected
         * item in multiple (as this item has already its remove icon) */
        return !isMultiple || !hasOnlyOneValue || !hasOnlyDisabled;
    }
    get clearedLabel() {
        const isMultiple = this.store.state.multiple;
        const labelKey = isMultiple ? 'clearSelections' : 'clearSelection';
        return this.store.data.labels[labelKey];
    }
    get singleSelectedItem() {
        const state = this.store.state;
        const isMultiple = state.multiple;
        if (isMultiple) {
            return;
        }
        return this.selectedOptions;
    }
    get singleSelectedItemText() {
        const item = this.singleSelectedItem;
        return (item === null || item === void 0 ? void 0 : item.text) || '';
    }
    get singleSelectedItemTitle() {
        const item = this.singleSelectedItem;
        return (item === null || item === void 0 ? void 0 : item.title) || (item === null || item === void 0 ? void 0 : item.text) || '';
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
        if (!el) {
            return;
        }
        const parentEl = el.parentElement;
        if (!document.contains(parentEl)) {
            /* The element is currently not in DOM */
            this.createObserver(parentEl);
            return;
        }
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
    closeObserver() {
        const observer = this.domObserver;
        if (observer) {
            observer.disconnect();
        }
        this.domObserver = null;
    }
    createObserver(el) {
        this.closeObserver();
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (const elMutated of Array.from(mutation.addedNodes)) {
                        /* Check that element has been added to DOM */
                        if (elMutated.contains(el)) {
                            this.closeObserver();
                            this.computeSize();
                            return;
                        }
                    }
                }
            }
        });
        const config = { childList: true, subtree: true };
        observer.observe(document, config);
        this.domObserver = observer;
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
    beforeUnmount() {
        this.closeObserver();
    }
    /* }}} */
    render() {
        return (vtyx.h("div", { class: "selectic-container has-feedback", on: {
                'click.prevent.stop': () => this.toggleFocus(),
            } },
            vtyx.h("div", { id: this.selecticId, class: ['selectic-input form-control',
                    {
                        focused: this.store.state.isOpen,
                        disabled: this.store.state.disabled,
                    }] },
                this.hasValue && !this.store.state.multiple && (vtyx.h("span", { class: "selectic-item_text", style: this.singleStyle, title: this.singleSelectedItemTitle }, this.singleSelectedItemText)),
                this.displayPlaceholder && (vtyx.h("span", { class: [
                        'selectic-input__selected-items__placeholder',
                        'selectic-item_text',
                    ], title: this.store.state.placeholder }, this.store.state.placeholder)),
                this.store.state.multiple && (vtyx.h("div", { class: "selectic-input__selected-items", ref: "selectedItems" },
                    this.isSelectionReversed && (vtyx.h(Icon$1, { icon: "strikethrough", store: this.store, class: "selectic-input__reverse-icon", title: this.reverseSelectionLabel })),
                    this.showSelectedOptions.map((item) => (vtyx.h("div", { class: "single-value", style: item.style, title: item.title || item.text, on: {
                            click: () => this.$emit('item:click', item.id),
                        } },
                        vtyx.h("span", { class: "selectic-input__selected-items__value" }, item.text),
                        !this.isDisabled && !item.disabled && (vtyx.h(Icon$1, { icon: "times", class: "selectic-input__selected-items__icon", store: this.store, on: {
                                'click.prevent.stop': () => this.selectItem(item.id),
                            } }))))),
                    this.moreSelectedNb && (vtyx.h("div", { class: "single-value more-items", title: this.moreSelectedTitle }, this.moreSelectedNb)))),
                this.showClearAll && (vtyx.h(Icon$1, { icon: "times", class: "selectic-input__clear-icon", title: this.clearedLabel, store: this.store, on: { 'click.prevent.stop': this.clearSelection } }))),
            vtyx.h("div", { class: [
                    'selectic__icon-container',
                    'form-control-feedback',
                    { focused: this.store.state.isOpen }
                ], on: {
                    'click.prevent.stop': () => this.toggleFocus(),
                } },
                vtyx.h(Icon$1, { icon: "caret-down", class: "selectic-icon", store: this.store }))));
    }
};
__decorate$4([
    vtyx.Prop()
], MainInput.prototype, "store", void 0);
__decorate$4([
    vtyx.Prop({ default: '' })
], MainInput.prototype, "id", void 0);
__decorate$4([
    vtyx.Watch('store.state.internalValue', { deep: true })
], MainInput.prototype, "onInternalChange", null);
MainInput = __decorate$4([
    vtyx.Component
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
let FilterPanel = class FilterPanel extends vtyx.Vue {
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
    /* {{{ select all */
    get hasNotAllItems() {
        return !vue.unref(this.store.hasAllItems);
    }
    get disabledPartialData() {
        const state = this.store.state;
        const autoDisplay = state.forceSelectAll === 'auto';
        return this.hasNotAllItems && !this.enableRevert && autoDisplay;
    }
    get disableSelectAll() {
        const store = this.store;
        const state = store.state;
        const isMultiple = state.multiple;
        const hasNoItems = state.filteredOptions.length === 0;
        const canNotSelect = this.hasNotAllItems && !!state.searchText;
        const partialDataDsbld = this.disabledPartialData;
        return !isMultiple || hasNoItems || canNotSelect || partialDataDsbld;
    }
    get titleSelectAll() {
        if (this.disableSelectAll && this.disabledPartialData) {
            return this.store.data.labels.cannotSelectAllRevertItems;
        }
        return '';
    }
    /* }}} */
    get disableRevert() {
        const store = this.store;
        return !store.state.multiple || !vue.unref(store.hasFetchedAllItems);
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
        return (vtyx.h("div", { class: "filter-panel" },
            vtyx.h("div", { class: {
                    panelclosed: this.closed,
                    panelopened: !this.closed,
                } },
                vtyx.h("div", { class: "filter-panel__input form-group has-feedback" },
                    vtyx.h("input", { type: "text", class: "form-control filter-input", placeholder: this.searchPlaceholder, value: state.searchText, on: {
                            'input.stop.prevent': this.onInput,
                        }, ref: "filterInput" }),
                    vtyx.h(Icon$1, { icon: "search", store: this.store, class: "selectic-search-scope form-control-feedback" })),
                state.multiple && (vtyx.h("div", { class: "toggle-selectic" },
                    vtyx.h("label", { class: ['control-label', {
                                'selectic__label-disabled': this.disableSelectAll,
                            }] },
                        vtyx.h("input", { type: "checkbox", checked: state.status.areAllSelected, disabled: this.disableSelectAll, title: this.titleSelectAll, on: {
                                change: this.onSelectAll,
                            } }),
                        labels.selectAll))),
                this.enableRevert && (vtyx.h("div", { class: ['toggle-selectic', {
                            'selectic__label-disabled': this.disableRevert,
                        }] },
                    vtyx.h("label", { class: "control-label" },
                        vtyx.h("input", { type: "checkbox", checked: this.selectionIsExcluded, disabled: this.disableRevert, on: {
                                change: this.onExclude,
                            } }),
                        labels.excludeResult)))),
            !state.keepFilterOpen && (vtyx.h("div", { class: "curtain-handler", on: {
                    'click.prevent.stop': this.togglePanel,
                } },
                vtyx.h(Icon$1, { icon: "search", store: this.store }),
                vtyx.h(Icon$1, { icon: this.closed ? 'caret-down' : 'caret-up', store: this.store })))));
    }
};
__decorate$3([
    vtyx.Prop()
], FilterPanel.prototype, "store", void 0);
__decorate$3([
    vtyx.Watch('closed')
], FilterPanel.prototype, "onClosed", null);
FilterPanel = __decorate$3([
    vtyx.Component
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
let List = class List extends vtyx.Vue {
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
        return vue.unref(this.store.marginSize);
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
                icon: 'current:spinner:spin',
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
        if (option.disabled) {
            return;
        }
        if (option.isGroup) {
            this.store.selectGroup(option.id, !option.selected);
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
    onFilteredOptionsChange(oldVal, newVal) {
        if (!isDeepEqual(oldVal, newVal)) {
            this.checkOffset();
        }
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
        return (vtyx.h("div", { class: "selectic__extended-list__list-container", on: {
                scroll: this.checkOffset,
            }, ref: "elList" },
            vtyx.h("ul", { class: "selectic__extended-list__list-items" },
                !!this.topOffset && (vtyx.h("li", { class: "selectic-item", style: `height:${this.topOffset}px;` })),
                this.shortOptions.map((option, idx) => (vtyx.h("li", { on: {
                        'click.prevent.stop': () => this.click(option),
                        'mouseover': () => this.onMouseOver(idx),
                    }, class: ['selectic-item', option.className || '', {
                            'selected': option.selected,
                            'selectable': vue.unref(this.store.allowGroupSelection) && option.isGroup && !option.disabled,
                            'selectic-item__active': idx + this.startIndex === this.store.state.activeItemIdx,
                            'selectic-item__disabled': !!option.disabled,
                            'selectic-item__exclusive': !!option.exclusive,
                            'selectic-item__is-in-group': !!option.group,
                            'selectic-item__is-group': option.isGroup,
                        }], style: option.style, title: option.title, key: 'selectic-item-' + (idx + this.startIndex) },
                    this.isMultiple && (vtyx.h(Icon$1, { icon: "check", store: this.store, class: "selectic-item_icon" })),
                    !this.isMultiple && (vtyx.h(Icon$1, { icon: "dot", store: this.store, class: "selectic-item_icon single-select_icon" })),
                    option.icon && (option.icon.includes(':')
                        ? vtyx.h(Icon$1, { icon: option.icon, store: this.store })
                        : vtyx.h(Icon$1, { icon: `raw:${option.icon}`, store: this.store })),
                    option.text))),
                !!this.bottomOffset && (vtyx.h("li", { class: "selectic-item", style: `height:${this.bottomOffset}px;` })))));
    }
};
__decorate$2([
    vtyx.Prop()
], List.prototype, "store", void 0);
__decorate$2([
    vtyx.Watch('store.state.activeItemIdx')
], List.prototype, "onIndexChange", null);
__decorate$2([
    vtyx.Watch('store.state.offsetItem')
], List.prototype, "onOffsetChange", null);
__decorate$2([
    vtyx.Watch('filteredOptions', { deep: true })
], List.prototype, "onFilteredOptionsChange", null);
__decorate$2([
    vtyx.Watch('groupId')
], List.prototype, "onGroupIdChange", null);
List = __decorate$2([
    vtyx.Component
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
/* list estimation height
 * 30px × 10 + 20px (for panel header)
 */
const DEFAULT_LIST_HEIGHT = 320;
let ExtendedList = class ExtendedList extends vtyx.Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.topGroupName = ' ';
        this.topGroupId = null;
        this.listHeight = 0;
        this.listWidth = 200;
        this.availableSpace = 0;
    }
    /* }}} */
    /* {{{ computed */
    /** check if the height of the box has been completely estimated. */
    get isFullyEstimated() {
        const listHeight = this.listHeight;
        const availableSpace = this.availableSpace;
        return listHeight !== 0 && listHeight < availableSpace;
    }
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
    get bestPosition() {
        const windowHeight = window.innerHeight;
        const isFullyEstimated = this.isFullyEstimated;
        /* XXX: The max() is because if listHeight is greater than default,
         * it means that the value is more accurate than the default. */
        const listHeight = isFullyEstimated ? this.listHeight
            : Math.max(DEFAULT_LIST_HEIGHT, this.listHeight);
        const inputTop = this.elementTop;
        const inputBottom = this.elementBottom;
        const availableTop = inputTop;
        const availableBottom = windowHeight - inputBottom;
        if (listHeight < availableBottom) {
            return 'bottom';
        }
        if (listHeight < availableTop) {
            return 'top';
        }
        /* There are not enough space neither at bottom nor at top */
        return availableBottom < availableTop ? 'top' : 'bottom';
    }
    get position() {
        const listPosition = this.store.state.listPosition;
        if (listPosition === 'auto') {
            return this.bestPosition;
        }
        return listPosition;
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
        const listPosition = this.position;
        const horizontalStyle = this.horizontalStyle;
        const width = this.width;
        if (listPosition === 'top') {
            const transform = horizontalStyle.includes('transform')
                ? 'transform: translateX(-100%) translateY(-100%);'
                : 'transform: translateY(-100%);';
            const elementTop = this.elementTop;
            const availableSpace = this.elementTop;
            this.availableSpace = availableSpace;
            return `
                --top-position: ${elementTop}px;
                ${horizontalStyle}
                --list-width: ${width}px;
                ${transform};
                --availableSpace: ${availableSpace}px;
            `;
        }
        const elementBottom = this.elementBottom;
        const availableSpace = window.innerHeight - elementBottom;
        this.availableSpace = availableSpace;
        return `
            --top-position: ${elementBottom}px;
            ${horizontalStyle}
            --list-width: ${width}px;
            --availableSpace: ${availableSpace}px;
        `;
    }
    get topGroup() {
        const topGroupId = this.topGroupId;
        if (!topGroupId) {
            return undefined;
        }
        const group = this.store.state.filteredOptions.find((option) => {
            return option.id === topGroupId;
        });
        return group;
    }
    get topGroupSelected() {
        const group = this.topGroup;
        return !!(group === null || group === void 0 ? void 0 : group.selected);
    }
    get topGroupDisabled() {
        const group = this.topGroup;
        return !!(group === null || group === void 0 ? void 0 : group.disabled);
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
        this.topGroupName = groupName;
        this.topGroupId = id;
    }
    computeListSize() {
        const box = this.$el.getBoundingClientRect();
        this.listHeight = box.height;
        this.listWidth = box.width;
    }
    clickHeaderGroup() {
        this.store.selectGroup(this.topGroupId, !this.topGroupSelected);
    }
    onKeyDown(evt) {
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
        return (vtyx.h("div", { style: this.positionStyle, class: [
                'selectic selectic__extended-list',
                `selectic-position-${this.position}`,
            ] },
            !state.hideFilter && (vtyx.h(Filter, { store: this.store })),
            isGroup && (vtyx.h("span", { class: [
                    'selectic-item selectic-item--header selectic-item__is-group',
                    {
                        selected: this.topGroupSelected,
                        selectable: vue.unref(this.store.allowGroupSelection) && !this.topGroupDisabled,
                        disabled: this.topGroupDisabled,
                    },
                ], on: {
                    click: () => this.clickHeaderGroup(),
                } },
                this.topGroupSelected && (vtyx.h(Icon$1, { icon: "check", store: this.store, class: "selectic-item_icon" })),
                this.topGroupName)),
            vtyx.h(List$1, { store: store, on: {
                    groupId: this.getGroup,
                } }),
            this.infoMessage && (vtyx.h("div", { class: "selectic__message alert-info" }, this.infoMessage)),
            this.searching && (vtyx.h("div", { class: "selectic__message" },
                vtyx.h(Icon$1, { icon: "spinner", store: this.store, spin: true }),
                this.searchingLabel)),
            this.errorMessage && (vtyx.h("div", { class: "selectic__message alert-danger", on: { click: () => store.resetErrorMessage() } }, this.errorMessage))));
    }
};
__decorate$1([
    vtyx.Prop()
], ExtendedList.prototype, "store", void 0);
__decorate$1([
    vtyx.Prop({ default: 0 })
], ExtendedList.prototype, "elementLeft", void 0);
__decorate$1([
    vtyx.Prop({ default: 0 })
], ExtendedList.prototype, "elementRight", void 0);
__decorate$1([
    vtyx.Prop({ default: 0 })
], ExtendedList.prototype, "elementTop", void 0);
__decorate$1([
    vtyx.Prop({ default: 0 })
], ExtendedList.prototype, "elementBottom", void 0);
__decorate$1([
    vtyx.Prop({ default: 300 })
], ExtendedList.prototype, "width", void 0);
__decorate$1([
    vtyx.Watch('store.state.filteredOptions', { deep: true })
], ExtendedList.prototype, "onFilteredOptionsChange", null);
__decorate$1([
    vtyx.Watch('store.state.hideFilter')
], ExtendedList.prototype, "onHideFilterChange", null);
ExtendedList = __decorate$1([
    vtyx.Component
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
function changeIcons(icons, iconFamily) {
    changeIcons$1(icons, iconFamily);
}
let Selectic = class Selectic extends vtyx.Vue {
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
            const extendedListEl = extendedList === null || extendedList === void 0 ? void 0 : extendedList.$el;
            if (!extendedListEl) {
                /* this component is not focused anymore */
                if (!keepOpenWithOtherSelectic) {
                    this.removeListeners();
                    this.store.commit('isOpen', false);
                }
                return;
            }
            const target = evt.target;
            if (!extendedListEl.contains(target) && !this.$el.contains(target)) {
                if (keepOpenWithOtherSelectic) {
                    let classSelector = '.selectic';
                    if (typeof keepOpenWithOtherSelectic === 'string') {
                        classSelector += keepOpenWithOtherSelectic;
                    }
                    const parentIsSelectic = target === null || target === void 0 ? void 0 : target.closest(classSelector);
                    if (parentIsSelectic) {
                        /* Do not close current Selectic */
                        return;
                    }
                }
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
        const value = vue.unref(this.value);
        return value !== null && value !== undefined;
    }
    get defaultValue() {
        var _a;
        return (_a = this.params.emptyValue) !== null && _a !== void 0 ? _a : null;
    }
    /* }}} */
    /* {{{ methods */
    /* {{{ public methods */
    /** Reset the inner cache (mainly for dynamic mode if context has changed) */
    clearCache(forceReset = false) {
        this.store.clearCache(forceReset);
    }
    /** Allow to change all text of the component */
    changeTexts(texts) {
        this.store.changeTexts(texts);
    }
    /** Allow to change all icons of the component */
    changeIcons(icons, iconFamily) {
        this.store.changeIcons(icons, iconFamily);
    }
    /** Return the current selection */
    getValue() {
        const value = this.store.state.internalValue;
        if (value === null && typeof this.params.emptyValue !== 'undefined') {
            return this.params.emptyValue;
        }
        return value;
    }
    /** Return the current selection in Item format */
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
    /** Check if there are Options available in the components */
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
        var _a;
        const mainInput = (_a = this.$refs) === null || _a === void 0 ? void 0 : _a.mainInput;
        const mainEl = mainInput === null || mainInput === void 0 ? void 0 : mainInput.$el;
        if (!mainEl) {
            /* This method has been called too soon (before render function)
             * or too late (after unmount) */
            return;
        }
        this.width = mainEl.offsetWidth;
    }
    computeOffset(doNotAddListener = false) {
        var _a;
        const mainInput = (_a = this.$refs) === null || _a === void 0 ? void 0 : _a.mainInput;
        const mainEl = mainInput === null || mainInput === void 0 ? void 0 : mainInput.$el;
        if (!mainEl) {
            /* This method has been called too soon (before render function)
             * or too late (after unmount) */
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
                this.emit('change', this.getValue(), state.selectionIsExcluded);
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
        this.store.props.options = deepClone(this.options, ['data']);
    }
    onTextsChange() {
        const texts = this.texts;
        if (texts) {
            this.changeTexts(texts);
        }
    }
    onIconsChange() {
        const icons = this.icons;
        const iconFamily = this.iconFamily;
        this.changeIcons(icons !== null && icons !== void 0 ? icons : {}, iconFamily);
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
            var _a;
            const focusedEl = document.activeElement;
            const extendedList = (_a = this.$refs) === null || _a === void 0 ? void 0 : _a.extendedList;
            /* check if there is a focused element (if none the body is
             * selected) and if it is inside current Selectic */
            if (focusedEl === document.body
                || this.$el.contains(focusedEl)
                || (extendedList === null || extendedList === void 0 ? void 0 : extendedList.$el.contains(focusedEl))) {
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
            options: deepClone(this.options, ['data']),
            value: deepClone(this.value),
            selectionIsExcluded: this.selectionIsExcluded,
            disabled: this.disabled,
            texts: this.texts,
            icons: this.icons,
            iconFamily: this.iconFamily,
            groups: deepClone(this.groups),
            keepOpenWithOtherSelectic: !!this.params.keepOpenWithOtherSelectic,
            params: {
                multiple: ((_a = this.multiple) !== null && _a !== void 0 ? _a : false) !== false,
                pageSize: this.params.pageSize || 100,
                hideFilter: (_b = this.params.hideFilter) !== null && _b !== void 0 ? _b : 'auto',
                allowRevert: this.params.allowRevert, /* it can be undefined */
                forceSelectAll: this.params.forceSelectAll || 'auto',
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
                optionBehavior: this.params.optionBehavior, /* it can be undefined */
                isOpen: ((_c = this.open) !== null && _c !== void 0 ? _c : false) !== false,
                disableGroupSelection: this.params.disableGroupSelection,
            },
            fetchCallback: this.params.fetchCallback,
            getItemsCallback: this.params.getItemsCallback,
        });
        if (typeof this._getMethods === 'function') {
            this._getMethods({
                clearCache: this.clearCache.bind(this),
                changeTexts: this.changeTexts.bind(this),
                changeIcons: this.changeIcons.bind(this),
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
        return (vtyx.h("div", { class: this.selecticClass, title: this.title, "data-selectic": "true", on: {
                'click.prevent.stop': () => store.commit('isOpen', true),
            } },
            vtyx.h("input", { type: "text", id: id, value: this.inputValue, class: "selectic__input-value", on: {
                    focus: () => store.commit('isOpen', true),
                    blur: this.checkFocus,
                } }),
            vtyx.h(MainInput$1, { store: store, id: id, on: {
                    'item:click': (id) => this.emit('item:click', id),
                }, ref: "mainInput" }),
            this.isFocused && (vtyx.h(ExtendedList$1, { class: this.className, store: store, elementBottom: this.elementBottom, elementTop: this.elementTop, elementLeft: this.elementLeft, elementRight: this.elementRight, width: this.width, ref: "extendedList" }))));
    }
};
__decorate([
    vtyx.Prop()
], Selectic.prototype, "value", void 0);
__decorate([
    vtyx.Prop({ default: false })
], Selectic.prototype, "selectionIsExcluded", void 0);
__decorate([
    vtyx.Prop({ default: () => [] })
], Selectic.prototype, "options", void 0);
__decorate([
    vtyx.Prop({ default: () => [] })
], Selectic.prototype, "groups", void 0);
__decorate([
    vtyx.Prop({ default: false })
], Selectic.prototype, "multiple", void 0);
__decorate([
    vtyx.Prop({ default: false })
], Selectic.prototype, "disabled", void 0);
__decorate([
    vtyx.Prop({ default: '' })
], Selectic.prototype, "placeholder", void 0);
__decorate([
    vtyx.Prop({ default: '' })
], Selectic.prototype, "id", void 0);
__decorate([
    vtyx.Prop({ default: '' })
], Selectic.prototype, "className", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "title", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "texts", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "icons", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "iconFamily", void 0);
__decorate([
    vtyx.Prop({ default: false })
], Selectic.prototype, "noCache", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "open", void 0);
__decorate([
    vtyx.Prop({ default: () => ({
            allowClearSelection: false,
            strictValue: false,
            selectionOverflow: 'collapsed',
        }) })
], Selectic.prototype, "params", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "_on", void 0);
__decorate([
    vtyx.Prop()
], Selectic.prototype, "_getMethods", void 0);
__decorate([
    vtyx.Watch('value', { deep: true })
], Selectic.prototype, "onValueChange", null);
__decorate([
    vtyx.Watch('selectionIsExcluded')
], Selectic.prototype, "onExcludedChange", null);
__decorate([
    vtyx.Watch('options', { deep: true })
], Selectic.prototype, "onOptionsChange", null);
__decorate([
    vtyx.Watch('texts', { deep: true })
], Selectic.prototype, "onTextsChange", null);
__decorate([
    vtyx.Watch('iconFamily'),
    vtyx.Watch('icons', { deep: true })
], Selectic.prototype, "onIconsChange", null);
__decorate([
    vtyx.Watch('disabled')
], Selectic.prototype, "onDisabledChange", null);
__decorate([
    vtyx.Watch('groups', { deep: true })
], Selectic.prototype, "onGroupsChanged", null);
__decorate([
    vtyx.Watch('placeholder')
], Selectic.prototype, "onPlaceholderChanged", null);
__decorate([
    vtyx.Watch('open')
], Selectic.prototype, "onOpenChanged", null);
__decorate([
    vtyx.Watch('isFocused')
], Selectic.prototype, "onFocusChanged", null);
__decorate([
    vtyx.Watch('store.state.internalValue', { deep: true })
], Selectic.prototype, "onInternalValueChange", null);
__decorate([
    vtyx.Emits(['input', 'change', 'open', 'focus', 'close', 'blur', 'item:click'])
], Selectic.prototype, "render", null);
Selectic = __decorate([
    vtyx.Component
], Selectic);
var Selectic$1 = Selectic;

exports.changeIcons = changeIcons;
exports.changeTexts = changeTexts;
exports["default"] = Selectic$1;
