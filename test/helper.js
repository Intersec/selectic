const _ = require('./tools.js');

const sleep = _.sleep;

function getInitialState(replacedAttributes) {
    return _.deepExtend({
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
        totalAllOptions: 0,
        totalDynOptions: 0,
        totalFilteredOptions: Infinity,

        status: {
            areAllSelected: false,
            automaticChange: false,
            automaticClose: false,
            errorMessage: '',
            hasChanged: false,
            searching: false,
        },
    }, replacedAttributes);
}

function getOptions(size, prefix, offset, groupName) {
    var options = [];
    var index, obj;

    offset = offset || 0;
    prefix = prefix || 'text';

    for (index = offset; index < offset + size; index++) {
        obj = {
            id: index,
            text: prefix + index,
        };

        if (groupName) {
            obj.group = typeof groupName === 'function' ? groupName(index) : groupName;
        }

        options.push(obj);
    }

    return options;
}

function getGroups(nbGroups) {
    var groups = [];
    var i;

    for (i = 0; i < nbGroups; i++) {
        var id = i + 1;
        groups.push({
            id: 'group' + id,
            text: 'group id ' + id,
        });
    }

    return groups;
}

function buildFetchCb({
    total = 20,
    searchTotal = 10,
    searchCb,
    addPrefix = false,
    group = [],
    command,
    spy = {},
}) {
    resetCall(spy, true);
    if (command) {
        command.resolve = () => {};
        command.reject = () => {};
        command.promise = () => {};
        command.fetch = () => {};
        command.usage = 0;
    }

    return (search, offset, limit) => {
        spy.nbCall++;
        spy.calls.push([search, offset, limit]);

        const prefix = addPrefix ? search + (limit ? 'alpha' : 'beta') : '';

        const fetchPromise = new Promise(function (resolve, reject) {
            if (search) {
                if (typeof searchTotal === 'number') {
                    total = searchTotal;
                }
                if (typeof searchCb === 'function') {
                    return resolve(searchCb(search, offset, limit, total));
                }
            }
            const nb = Math.min(limit, total - offset);
            const groupName = group.length ? (index) => {
                let name = undefined;

                group.every((g) => {
                    if (index >= g.offset) {
                        name = g.name;
                        return true;
                    }
                });

                return name;
            } : undefined;

            function resolveFetch() {
                let result = {
                    total,
                    result: getOptions(nb, prefix, offset, groupName),
                };

                if (command && command.interceptResult) {
                    result = command.interceptResult(result);
                }

                resolve(result);
            }

            if (command) {
                command.resolve = resolve;
                command.reject = reject;
                command.fetch = resolveFetch;
            } else {
                resolveFetch();
            }
        });

        if (command) {
            command.promise = fetchPromise;
            command.usage++;
        }
        spy.promise = fetchPromise;

        return fetchPromise;
    };
}

function buildGetItemsCb({ someIds, command, spy = {} }) {
    resetCall(spy, true);

    return (ids) => {
        spy.nbCall++;
        spy.calls.push([ids]);

        const getItemPromise = new Promise(function (resolve, reject) {
            const resolveGetItem = function (hasFound = true) {
                const rslt = ids.map(function (id) {
                    const hasId = hasFound && (someIds ? someIds.includes(id) : true);

                    if (hasId) {
                        return {
                            id: id,
                            text: 'some text ' + id,
                            data: 'data' + id,
                        };
                    }
                    return;
                });

                resolve(rslt);
            };

            if (command) {
                command.resolve = resolve;
                command.reject = reject;
                command.found = resolveGetItem;
            } else {
                resolveGetItem(true);
            }
        });

        if (command) {
            command.promise = getItemPromise;
        }
        spy.promise = getItemPromise;

        return getItemPromise;
    };
}

function toHaveBeenCalled(spy) {
    return spy.nbCall > 0;
}

function toHaveBeenCalledWith(spy, argumentsValue, debug = false) {
    const argtValues = JSON.stringify(argumentsValue);

    if (debug) {
        console.log('toHaveBeenCalledWith', argtValues, '→', JSON.stringify(spy.calls));
    }

    return Array.isArray(spy.calls) && spy.calls.some((call) => {
        return JSON.stringify(call) === argtValues;
    });
}

function resetCall(spy, keepValue = false) {
    if (!keepValue || !spy.nbCall) {
        spy.nbCall = 0;
    }

    if (!keepValue || !spy.calls) {
        spy.calls = [];
    }
}

/* parameter sets in store */
const DEBOUNCE_REQUEST = 250;

module.exports = {
    sleep,
    getInitialState,
    getOptions,
    getGroups,
    buildFetchCb,
    buildGetItemsCb,
    toHaveBeenCalled,
    toHaveBeenCalledWith,
    resetCall,
    DEBOUNCE_REQUEST,
};
