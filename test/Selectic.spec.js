/**************************************************************************/
/*                                                                        */
/*  Copyright (C) INTERSEC SA                                             */
/*                                                                        */
/*  Should you receive a copy of this source code, you must check you     */
/*  have a proper, written authorization of INTERSEC to hold it. If you   */
/*  don't have such an authorization, you must DELETE all source code     */
/*  files in your possession, and inform INTERSEC of the fact you obtain  */
/*  these files. Should you not comply to these terms, you can be         */
/*  prosecuted in the extent permitted by applicable law.                 */
/*                                                                        */
/**************************************************************************/

define(function(require) {
    'use strict';

    var _ = require('_').default;
    var StoreFile = require('../src/Store');
    var Store = StoreFile.default;

    /* {{{ Internal helper */

    /* Create a promise from setTimeout */
    function sleep(ms) {
       return new Promise(function (resolve){
           setTimeout(resolve, ms);
        });
    }

    function getInitialState(replacedAttributes) {
        return _.deepExtend({
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
            totalAllOptions: 0,
            totalFilteredOptions: Infinity,
            offsetItem: 0,
            activeItemIdx: -1,
            pageSize: 100,
            groups: new Map(),
            status: {
                searching: false,
                errorMessage: '',
                areAllSelected: false,
                hasChanged: false,
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
                obj.group = groupName;
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

    function buildFetchCb({total = 20}) {
        return function(search, offset, limit) {
            var fetchPromise = new Promise(function(success) {
                const nb = Math.min(limit, total - offset);
                success({
                    total,
                    result: getOptions(nb, '', offset),
                });
            });
            return fetchPromise;
        };
    }

    /* }}} */
    /* {{{ Store */

    describe('Selectic Store', function() {
        describe('created()', function() {
            it('should create a Vue component with state', function() {
                var store = new Store();

                expect(store).toBeDefined();
                expect(store.state).toEqual(getInitialState());
            });

            it('should handle initial properties', function() {
                var store = new Store({propsData: {params: {
                    multiple: true,
                    pageSize: 10,
                    hideFilter: true,
                    allowClearSelection: true,
                    groups: getGroups(2),
                    autoSelect: false,
                }}});

                expect(store.state).toEqual(getInitialState({
                    multiple: true,
                    hideFilter: true,
                    allowClearSelection: true,
                    pageSize: 10,
                    internalValue: [],
                    selectedOptions: [],
                    groups: [{
                        id: 'group1',
                        text: 'group id 1',
                    }, {
                        id: 'group2',
                        text: 'group id 2',
                    }],
                    autoSelect: false,
                }));
            });

            describe('should handle options', function() {
                it('given short list', function() {
                    var propOptions = getOptions(5);
                    var store = new Store({propsData: {options: propOptions}});
                    store.commit('isOpen', true);

                    var firstOption = store.state.filteredOptions[0];

                    expect(store.state.allOptions.length).toBe(5);
                    expect(store.state.totalAllOptions).toBe(5);
                    expect(store.state.filteredOptions.length).toBe(5);
                    expect(store.state.totalFilteredOptions).toBe(5);
                    expect(firstOption).toEqual({
                        id: 0,
                        text: 'text0',
                        disabled: false,
                        selected: false,
                        isGroup: false,
                    });
                    expect(store.state.status.errorMessage).toBe('');
                });

                it('given long list', function() {
                    var propOptions = getOptions(15000);
                    var store = new Store({propsData: {options: propOptions}});
                    store.commit('isOpen', true);

                    var firstOption = store.state.filteredOptions[0];

                    expect(store.state.allOptions.length).toBe(15000);
                    expect(store.state.totalAllOptions).toBe(15000);
                    expect(store.state.filteredOptions.length).toBe(15000);
                    expect(store.state.totalFilteredOptions).toBe(15000);
                    expect(firstOption).toEqual({
                        id: 0,
                        text: 'text0',
                        disabled: false,
                        selected: false,
                        isGroup: false,
                    });
                    expect(store.state.status.errorMessage).toBe('');
                });

                it('given string list', function() {
                    var propOptions = ['alpha', 'bravo', 'charlie', 'delta'];
                    var store = new Store({propsData: {options: propOptions}});
                    store.commit('isOpen', true);

                    var firstOption = store.state.filteredOptions[0];

                    expect(store.state.allOptions.length).toBe(4);
                    expect(store.state.totalAllOptions).toBe(4);
                    expect(store.state.filteredOptions.length).toBe(4);
                    expect(store.state.totalFilteredOptions).toBe(4);
                    expect(firstOption).toEqual({
                        id: 'alpha',
                        text: 'alpha',
                        disabled: false,
                        selected: false,
                        isGroup: false,
                    });
                    expect(store.state.status.errorMessage).toBe('');
                });

                it('given a disabled option', function() {
                    var propOptions = getOptions(5);
                    propOptions[0].disabled = true;
                    var store = new Store({propsData: {options: propOptions}});
                    store.commit('isOpen', true);

                    var firstOption = store.state.filteredOptions[0];

                    expect(firstOption).toEqual({
                        id: 0,
                        text: 'text0',
                        disabled: true,
                        selected: false,
                        isGroup: false,
                    });
                    expect(store.state.status.errorMessage).toBe('');
                });

                it('given a group option', function() {
                    var propOptions1 = getOptions(5, '', 0, 'group1');
                    var propOptions2 = getOptions(5, '', 5, 'group2');
                    var propOptions = propOptions1.concat(propOptions2);

                    var store = new Store({propsData: {options: propOptions}});
                    store.commit('isOpen', true);

                    var firstOption = store.state.filteredOptions[0];
                    var secondOption = store.state.filteredOptions[1];

                    expect(store.state.allOptions.length).toBe(10);
                    expect(store.state.totalAllOptions).toBe(10);
                    expect(store.state.filteredOptions.length).toBe(12);
                    expect(store.state.totalFilteredOptions).toBe(12);
                    expect(store.state.groups.size).toBe(2);

                    expect(firstOption).toEqual({
                        id: 'group1',
                        text: 'group1',
                        disabled: false,
                        selected: false,
                        isGroup: true,
                    });
                    expect(secondOption).toEqual({
                        id: 0,
                        text: 'text0',
                        disabled: false,
                        selected: false,
                        group: 'group1',
                        isGroup: false,
                    });
                    expect(store.state.status.errorMessage).toBe('');
                });

                it('given an inner group option', function() {
                    var propOptions1 = getOptions(5);
                    var propOptions2 = getOptions(5, '', 5);
                    var propOptions = [{
                        id: 'group1',
                        text: 'group1',
                        options: propOptions1,
                    }, {
                        id: 'group2',
                        text: 'group2',
                        options: propOptions2,
                    }];

                    var store = new Store({propsData: {options: propOptions}});
                    store.commit('isOpen', true);

                    var firstOption = store.state.filteredOptions[0];
                    var secondOption = store.state.filteredOptions[1];

                    expect(store.state.allOptions.length).toBe(10);
                    expect(store.state.totalAllOptions).toBe(10);
                    expect(store.state.filteredOptions.length).toBe(12);
                    expect(store.state.totalFilteredOptions).toBe(12);

                    expect(firstOption).toEqual({
                        id: 'group1',
                        text: 'group1',
                        disabled: false,
                        selected: false,
                        isGroup: true,
                    });
                    expect(secondOption).toEqual({
                        id: 0,
                        text: 'text0',
                        disabled: false,
                        selected: false,
                        group: 'group1',
                        isGroup: false,
                    });
                    expect(store.state.status.errorMessage).toBe('');
                });
            });

            describe('should handle "value"', function() {
                it('given single value', function() {
                    var store = new Store({propsData: {
                        options: getOptions(5),
                        params: {
                            multiple: false,
                        },
                        value: 3,
                    }});

                    expect(store.state.internalValue).toBe(3);
                });

                it('given multiple value', function() {
                    var store = new Store({propsData: {
                        options: getOptions(5),
                        params: {
                            multiple: true,
                        },
                        value: [3, 2],
                    }});

                    expect(store.state.internalValue).toEqual([3, 2]);
                });

                it('given unknown value', function() {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        params: {
                            multiple: false,
                        },
                        value: 42,
                    }});

                    expect(store.state.internalValue).toBe(42);
                });
            });

            describe('with a fetchCallback', function() {
                it('should handle initial properties', function() {
                    this.fetchCallback = function() {};
                    spyOn(this, 'fetchCallback');

                    var store = new Store({propsData: {fetchCallback: this.fetchCallback}});

                    expect(this.fetchCallback).not.toHaveBeenCalled();
                    expect(store.state.allOptions.length).toBe(0);
                    expect(store.state.totalAllOptions).toBe(Infinity);
                    expect(store.state.filteredOptions.length).toBe(0);
                });

                it('should handle "value"', function() {
                    var store = new Store({propsData: {
                        fetchCallback: function() {},
                        value: [189, 45, 'hello'],
                        params: {
                            multiple: true,
                        }
                    }});

                    expect(store.state.internalValue).toEqual([189, 45, 'hello']);
                });
            });

            describe('with selectionIsExcluded attribute', function() {
                it('should set the selectionIsExcluded state', function() {
                    var store = new Store({propsData: {
                        fetchCallback: buildFetchCb({total: 5}),
                        value: [1],
                        selectionIsExcluded: true,
                        params: {
                            multiple: true,
                        },
                    }});

                    expect(store.state.internalValue).toEqual([1]);
                    expect(store.state.selectionIsExcluded).toBe(true);
                });

                it('should not applied for single value', function() {
                    var store = new Store({propsData: {
                        options: getOptions(5),
                        value: 1,
                        selectionIsExcluded: true,
                        params: {
                            multiple: false,
                        },
                    }});

                    expect(store.state.internalValue).toEqual(1);
                    expect(store.state.selectionIsExcluded).toBe(false);
                });
            });

            it('should set the disabled state', function() {
                var store = new Store({propsData: {
                    options: getOptions(3),
                    disabled: true,
                }});

                expect(store.state.disabled).toBe(true);
            });

            describe('with autoSelect attribute', function() {
                it('should select the first option', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: true,
                        },
                        options: getOptions(2),
                    }});

                    expect(store.state.internalValue).toBe(null);
                    await sleep(0);
                    expect(store.state.internalValue).toBe(0);
                    done();
                });

                it('should select the only available option', async function(done) {
                    var options = getOptions(5);
                    options[0].disabled = true;
                    options[1].disabled = true;
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: true,
                        },
                        options: options,
                    }});

                    expect(store.state.internalValue).toBe(null);
                    await sleep(0);
                    expect(store.state.internalValue).toBe(2);
                    done();
                });

                it('should select the only option', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: true,
                        },
                        options: getOptions(1),
                    }});

                    expect(store.state.internalValue).toBe(null);
                    await sleep(0);
                    expect(store.state.internalValue).toBe(0);
                    done();
                });

                it('should not select option when it can be removed', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: true,
                            allowClearSelection: true,
                        },
                        options: getOptions(1),
                    }});

                    expect(store.state.internalValue).toBe(null);
                    await sleep(0);
                    expect(store.state.internalValue).toBe(null);
                    done();
                });

                it('should not select the only option when false', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: false,
                            allowClearSelection: false,
                        },
                        options: getOptions(1),
                    }});

                    expect(store.state.internalValue).toBe(null);
                    await sleep(0);
                    expect(store.state.internalValue).toBe(null);
                    done();
                });

                it('should not select the only available option when false', async function(done) {
                    var options = getOptions(3);
                    options[0].disabled = true;
                    options[2].disabled = true;
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: false,
                            allowClearSelection: false,
                        },
                        options: options,
                    }});

                    expect(store.state.internalValue).toBe(null);
                    await sleep(0);
                    expect(store.state.internalValue).toBe(null);
                    done();
                });

                it('should not select option in multiple', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            autoSelect: true,
                            multiple: true,
                        },
                        options: getOptions(1),
                    }});

                    await sleep(0);
                    expect(store.state.internalValue).toEqual([]);
                    done();
                });
            });

            describe('with autoDisabled attribute', function() {
                it('should disable empty select', async function(done) {
                    var store = new Store({propsData: {
                        options: [],
                        disabled: false,
                        params: {
                            autoDisabled: true,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(true);
                    expect(store.state.internalValue).toBe(null);

                    done();
                });

                it('should disable select with only one option', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        disabled: false,
                        params: {
                            autoDisabled: true,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(true);
                    expect(store.state.internalValue).toBe(0);

                    done();
                });

                it('should not disable select with several options', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(2),
                        disabled: false,
                        params: {
                            autoDisabled: true,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(0);

                    done();
                });

                it('should not disable select when it is possible to remove selection', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        disabled: false,
                        value: 0,
                        params: {
                            autoDisabled: true,
                            allowClearSelection: true,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(0);

                    done();
                });

                it('should not disable select without autoDisabled', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        disabled: false,
                        params: {
                            autoDisabled: false,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(0);

                    done();
                });

                it('should not disable select without autoSelect', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        disabled: false,
                        params: {
                            autoDisabled: true,
                            autoSelect: false,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(null);

                    done();
                });

                it('should disable select without autoSelect which have a selected value', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        disabled: false,
                        value: 0,
                        params: {
                            autoDisabled: true,
                            autoSelect: false,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(true);
                    expect(store.state.internalValue).toBe(0);

                    done();
                });

                it('should not disable select when allowClearSelection', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1),
                        disabled: false,
                        params: {
                            allowClearSelection: true,
                            autoDisabled: true,
                            autoSelect: true,
                        },
                    }});

                    await sleep(0);

                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(null);

                    done();
                });

                it('should not disable select in dynamic mode', async function(done) {
                    var store = new Store({propsData: {
                        fetchCallback: buildFetchCb({total: 1}),
                        disabled: false,
                        params: {
                            autoDisabled: true,
                        },
                    }});

                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(null);

                    /* Load data */
                    store.commit('isOpen', true);
                    await sleep(0);
                    store.commit('isOpen', false);
                    await sleep(0);

                    /* assert Selectic is not disbaled */
                    expect(store.state.disabled).toBe(false);
                    expect(store.state.internalValue).toBe(null);

                    done();
                });
            });

            describe('with strictValue attribute', function() {
                it('should not keep single selection', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            strictValue: true,
                            autoSelect: false,
                        },
                        options: getOptions(2),
                        value: 'hello',
                    }});

                    await sleep(0);
                    expect(store.state.internalValue).toBe(null);
                    done();
                });

                it('should not keep invalid values in multiple selection', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            multiple: true,
                            strictValue: true,
                        },
                        options: getOptions(5),
                        value: [2, 'hello', 1, true],
                    }});

                    await sleep(0);
                    expect(store.state.internalValue).toEqual([2, 1]);
                    done();
                });

                it('should keep single incoherent selection when disabled', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            strictValue: false,
                            autoSelect: false,
                        },
                        options: getOptions(2),
                        value: 'hello',
                    }});

                    await sleep(0);
                    expect(store.state.internalValue).toBe('hello');
                    done();
                });

                it('should keep incoherent values in multiple selection when disabled', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            multiple: true,
                            strictValue: false,
                        },
                        options: getOptions(5),
                        value: [2, 'hello', 1, true],
                    }});

                    await sleep(0);
                    expect(store.state.internalValue).toEqual([2, 'hello', 1, true]);
                    done();
                });
            });

            describe('with hideFilter attribute', function() {

                describe('having value "auto"', function() {
                    it('should hide filter with few options', async function(done) {
                        var store = new Store({propsData: {
                            options: getOptions(3),
                            params: {
                                hideFilter: 'auto',
                            },
                        }});

                        await sleep(0);

                        expect(store.state.hideFilter).toBe(true);
                        done();
                    });

                    it('should show filter with many options', async function(done) {
                        var store = new Store({propsData: {
                            options: getOptions(11),
                            params: {
                                hideFilter: 'auto',
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);
                        done();
                    });

                    it('should show filter with multiple', async function(done) {
                        var store = new Store({propsData: {
                            options: getOptions(3),
                            params: {
                                hideFilter: 'auto',
                                multiple: true,
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);
                        done();
                    });

                    it('should show filter with dynamic options', async function(done) {
                        var store = new Store({propsData: {
                            fetchCallback: buildFetchCb({total: 5}),
                            params: {
                                hideFilter: 'auto',
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);

                        /* Assert it doesn't change after fetching data */
                        store.commit('isOpen', true);
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);

                        store.commit('isOpen', false);
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);
                        done();
                    });
                });

                describe('having value "false"', function() {
                    it('should show filter with few options', async function(done) {
                        var store = new Store({propsData: {
                            options: getOptions(3),
                            params: {
                                hideFilter: false,
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);
                        done();
                    });

                    it('should show filter with dynamic options', async function(done) {
                        var store = new Store({propsData: {
                            fetchCallback: buildFetchCb({total: 5}),
                            params: {
                                hideFilter: false,
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);

                        /* Assert it doesn't change after fetching data */
                        store.commit('isOpen', true);
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);

                        store.commit('isOpen', false);
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(false);
                        done();
                    });
                });

                describe('having value "true"', function() {
                    it('should hide filter with many options', async function(done) {
                        var store = new Store({propsData: {
                            options: getOptions(11),
                            params: {
                                hideFilter: true,
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(true);
                        done();
                    });

                    it('should hide filter with multiple', async function(done) {
                        var store = new Store({propsData: {
                            options: getOptions(3),
                            params: {
                                hideFilter: true,
                                multiple: true,
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(true);
                        done();
                    });

                    it('should hide filter with dynamic options', async function(done) {
                        var store = new Store({propsData: {
                            fetchCallback: buildFetchCb({total: 15}),
                            params: {
                                hideFilter: true,
                            },
                        }});
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(true);

                        /* Assert it doesn't change after fetching data */
                        store.commit('isOpen', true);
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(true);

                        store.commit('isOpen', false);
                        await sleep(0);

                        expect(store.state.hideFilter).toBe(true);
                        done();
                    });
                });
            });
        });

        describe('commit()', function() {
            it('should change state', function() {
                var store = new Store();

                store.commit('searchText', 'hello');
                store.commit('offsetItem', 10);
                store.commit('activeItemIdx', 5);
                store.commit('pageSize', 201);
                store.commit('hideFilter', true);
                store.commit('allowClearSelection', true);

                expect(store.state).toEqual(getInitialState({
                    searchText: 'hello',
                    offsetItem: 10,
                    activeItemIdx: 5,
                    pageSize: 201,
                    hideFilter: true,
                    allowClearSelection: true,
                }));

                store.commit('searchText', 'hello2');
                expect(store.state.searchText).toBe('hello2');
                /* display should be reset */
                expect(store.state.offsetItem).toBe(0);
                expect(store.state.activeItemIdx).toBe(-1);
            });

            describe('when open the select list', function() {
                beforeEach(function() {
                    var jTest = this;
                    jTest.fetchCallback = function(search, offsetItem, pageSize) {
                        var prefix = offsetItem ? 'alpha' : 'beta';
                        var promise = new Promise(function(resolve) {
                            jTest.resolveFetch = function() {
                                var list = getOptions(Math.min(pageSize, 300), prefix);
                                resolve({
                                    total: 300,
                                    result: list,
                                });
                            };
                        });
                        jTest.fetchPromise = promise;

                        return promise;
                    };

                    spyOn(jTest, 'fetchCallback').and.callThrough();
                });

                it('should fetch data', function(done) {
                    var jTest = this;
                    var store = new Store({propsData: {
                        fetchCallback: jTest.fetchCallback,
                    }});

                    expect(jTest.fetchCallback).not.toHaveBeenCalled();
                    store.commit('isOpen', true);

                    expect(jTest.fetchCallback).toHaveBeenCalledWith('', 0, 100);
                    expect(store.state.status.searching).toBe(true);
                    jTest.fetchCallback.calls.reset();
                    jTest.resolveFetch();
                    jTest.fetchPromise.then(function() {
                        _.defer(afterInitialFetch);
                    });

                    function afterInitialFetch() {
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.allOptions.length).toBe(100);
                        expect(store.state.totalAllOptions).toBe(300);
                        expect(store.state.filteredOptions.length).toBe(100);
                        expect(store.state.totalFilteredOptions).toBe(300);

                        store.commit('offsetItem', 100);
                        store.$nextTick(afterChangingOffset);
                    }

                    function afterChangingOffset() {
                        expect(jTest.fetchCallback).toHaveBeenCalledWith('', 100, 100);
                        expect(store.state.status.searching).toBe(true);
                        jTest.fetchCallback.calls.reset();
                        jTest.resolveFetch();
                        jTest.fetchPromise.then(function() {
                            _.defer(receiveReponse);
                        });
                    }

                    function receiveReponse() {
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.allOptions.length).toBe(200);
                        expect(store.state.totalAllOptions).toBe(300);
                        expect(store.state.filteredOptions.length).toBe(200);
                        expect(store.state.totalFilteredOptions).toBe(300);

                        store.commit('offsetItem', 50);
                        store.$nextTick(afterInnerOffset);
                    }

                    function afterInnerOffset() {
                        expect(jTest.fetchCallback).not.toHaveBeenCalled();
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.allOptions.length).toBe(200);
                        expect(store.state.totalAllOptions).toBe(300);
                        expect(store.state.filteredOptions.length).toBe(200);
                        expect(store.state.totalFilteredOptions).toBe(300);

                        done();
                    }
                });

                it('should not fetch more data', function(done) {
                    var jTest = this;
                    var store = new Store({propsData: {
                        fetchCallback: jTest.fetchCallback,
                        params: {
                            pageSize: 500,
                        },
                    }});

                    expect(jTest.fetchCallback).not.toHaveBeenCalled();
                    store.commit('isOpen', true);

                    expect(jTest.fetchCallback).toHaveBeenCalledWith('', 0, 500);
                    expect(store.state.status.searching).toBe(true);
                    jTest.fetchCallback.calls.reset();
                    jTest.resolveFetch();
                    jTest.fetchPromise.then(function() {
                        _.defer(afterInitialFetch);
                    });

                    function afterInitialFetch() {
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.allOptions.length).toBe(300);
                        expect(store.state.totalAllOptions).toBe(300);
                        expect(store.state.filteredOptions.length).toBe(300);
                        expect(store.state.totalFilteredOptions).toBe(300);

                        store.commit('isOpen', false);
                        store.commit('isOpen', true);
                        store.$nextTick(afterReopen);
                    }

                    function afterReopen() {
                        expect(jTest.fetchCallback).not.toHaveBeenCalled();
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.isOpen).toBe(true);

                        store.commit('offsetItem', 1000);
                        store.$nextTick(afterMaxOffset);
                    }

                    function afterMaxOffset() {
                        expect(jTest.fetchCallback).not.toHaveBeenCalled();

                        done();
                    }
                });
            });

            describe('should filter on text search', function() {
                describe('given static options', function() {
                    beforeEach(function() {
                        var propOptions = getOptions(20);
                        this.store = new Store({propsData: {options: propOptions}});
                        this.store.commit('isOpen', true);
                    });

                    it('with some items found', function() {
                        var store = this.store;
                        store.commit('searchText', '1');
                        var firstOption = store.state.filteredOptions[0];

                        expect(store.state.allOptions.length).toBe(20);
                        expect(store.state.totalAllOptions).toBe(20);
                        expect(store.state.filteredOptions.length).toBe(11);
                        expect(store.state.totalFilteredOptions).toBe(11);
                        expect(firstOption).toEqual({
                            id: 1,
                            text: 'text1',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        });
                        expect(store.state.status.errorMessage).toBe('');
                    });

                    it('with no items found', function() {
                        var store = this.store;
                        store.commit('searchText', 'coucou');

                        expect(store.state.allOptions.length).toBe(20);
                        expect(store.state.totalAllOptions).toBe(20);
                        expect(store.state.filteredOptions.length).toBe(0);
                        expect(store.state.totalFilteredOptions).toBe(0);
                        expect(store.state.status.errorMessage).toBe('');
                    });

                    it('with wildcard in text', function() {
                        var store = this.store;
                        store.commit('searchText', 'te*4');
                        var firstOption = store.state.filteredOptions[0];

                        expect(store.state.filteredOptions.length).toBe(2);
                        expect(store.state.totalFilteredOptions).toBe(2);
                        expect(firstOption).toEqual({
                            id: 4,
                            text: 'text4',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        });
                        expect(store.state.status.errorMessage).toBe('');
                    });
                });

                describe('given dynamic options', function() {
                    beforeEach(function() {
                        var jTest = this;
                        jTest.fetchTotal = 300;
                        jTest.fetchCallback = function(search, offsetItem, pageSize) {
                            var prefix = search + (offsetItem ? 'alpha' : 'beta');
                            var promise = new Promise(function(resolve) {
                                jTest.resolveFetch = function() {
                                    var total = jTest.fetchTotal;
                                    var list = getOptions(Math.min(pageSize, total), prefix);
                                    resolve({
                                        total: total,
                                        result: list,
                                    });
                                };
                            });
                            jTest.fetchPromise = promise;

                            return promise;
                        };

                        spyOn(jTest, 'fetchCallback').and.callThrough();

                        jTest.store = new Store({propsData: {
                            fetchCallback: jTest.fetchCallback,
                        }});
                        jTest.store.commit('isOpen', true);
                        jTest.resolveFetch();
                        jTest.fetchCallback.calls.reset();
                        jTest.fetchTotal = 250;
                    });

                    it('should fetch filtered data', function(done) {
                        var jTest = this;
                        var store = jTest.store;
                        var search = 'search';

                        store.commit('searchText', search);

                        expect(jTest.fetchCallback).toHaveBeenCalledWith(search, 0, 100);
                        expect(store.state.status.searching).toBe(true);
                        expect(store.state.filteredOptions.length).toBe(0);
                        jTest.fetchCallback.calls.reset();
                        jTest.resolveFetch();
                        jTest.fetchPromise.then(function() {
                            _.defer(afterInitialFetch);
                        });

                        function afterInitialFetch() {
                            expect(store.state.status.searching).toBe(false);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(100);
                            expect(store.state.totalFilteredOptions).toBe(250);

                            store.commit('offsetItem', 100);
                            store.$nextTick(afterChangingOffset);
                        }

                        function afterChangingOffset() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith(search, 100, 100);
                            expect(store.state.status.searching).toBe(true);
                            jTest.fetchCallback.calls.reset();
                            jTest.resolveFetch();
                            jTest.fetchPromise.then(function() {
                                _.defer(receiveReponse);
                            });
                        }

                        function receiveReponse() {
                            expect(store.state.status.searching).toBe(false);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(200);
                            expect(store.state.totalFilteredOptions).toBe(250);

                            store.commit('offsetItem', 50);
                            store.$nextTick(afterInnerOffset);
                        }

                        function afterInnerOffset() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.status.searching).toBe(false);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(200);
                            expect(store.state.totalFilteredOptions).toBe(250);

                            done();
                        }
                    });

                    it('should reset search', function(done) {
                        var jTest = this;
                        var store = jTest.store;
                        var search = 'search';

                        store.commit('searchText', search);

                        jTest.resolveFetch();
                        jTest.fetchPromise.then(function() {
                            _.defer(afterInitialFetch);
                        });

                        function afterInitialFetch() {
                            store.commit('offsetItem', 100);

                            jTest.fetchCallback.calls.reset();
                            jTest.resolveFetch();
                            jTest.fetchPromise.then(function() {
                                _.defer(afterInitialSearch);
                            });
                        }

                        function afterInitialSearch() {
                            expect(store.state.status.searching).toBe(false);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(200);
                            expect(store.state.totalFilteredOptions).toBe(250);

                            search = '2nd';
                            store.commit('searchText', search);
                            store.$nextTick(afterChangingSearch);
                        }

                        function afterChangingSearch() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith(search, 0, 100);
                            expect(store.state.status.searching).toBe(true);
                            jTest.fetchCallback.calls.reset();
                            jTest.resolveFetch();
                            jTest.fetchPromise.then(function() {
                                _.defer(receiveReponse);
                            });
                        }

                        function receiveReponse() {
                            expect(store.state.status.searching).toBe(false);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(100);
                            expect(store.state.totalFilteredOptions).toBe(250);
                            /* check that items have been replaced */
                            expect(store.state.filteredOptions[0].text).toContain('2nd');

                            store.commit('searchText', '');
                            store.$nextTick(afterResetingSearch);
                        }

                        function afterResetingSearch() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.status.searching).toBe(false);

                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(100);
                            expect(store.state.totalFilteredOptions).toBe(300);
                            /* check that items have been replaced */
                            expect(store.state.filteredOptions[0].text).not.toContain('2nd');

                            done();
                        }
                    });

                    it('should not fetch more data', function(done) {
                        var jTest = this;
                        var store = jTest.store;
                        var search = 'search';

                        store.commit('pageSize', 500);
                        store.commit('searchText', search);


                        expect(jTest.fetchCallback).toHaveBeenCalledWith(search, 0, 500);
                        expect(store.state.status.searching).toBe(true);
                        jTest.fetchCallback.calls.reset();
                        jTest.resolveFetch();
                        jTest.fetchPromise.then(function() {
                            _.defer(afterInitialFetch);
                        });

                        function afterInitialFetch() {
                            expect(store.state.status.searching).toBe(false);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(300);
                            expect(store.state.filteredOptions.length).toBe(250);
                            expect(store.state.totalFilteredOptions).toBe(250);

                            store.commit('pageSize', 10);
                            store.commit('offsetItem', 100);
                            store.$nextTick(afterInnerOffset);
                        }

                        function afterInnerOffset() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.status.searching).toBe(false);

                            store.commit('offsetItem', 2000);
                            store.$nextTick(afterMaxOffset);
                        }

                        function afterMaxOffset() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();

                            done();
                        }
                    });
                });
            });

            describe('when changing "offsetItem"', function() {
                describe('with classical options', function() {
                    beforeEach(function() {
                        var jTest = this;
                        jTest.fetchCallback = function(search, offset, pageSize) {
                            jTest.fetchPromise = Promise.resolve({
                                total: 500,
                                result: getOptions(pageSize, '', offset),
                            });
                            return jTest.fetchPromise;
                        };
                        spyOn(jTest, 'fetchCallback').and.callThrough();
                        jTest.store = new Store({propsData: {
                            fetchCallback: jTest.fetchCallback,
                        }});
                        jTest.store.commit('isOpen', true);
                    });

                    it('should not fetch already fetched data', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });

                        function isReady() {
                            store.commit('offsetItem', 100);
                            jTest.fetchPromise.then(function() {
                                _.defer(loadInitialData);
                            });
                        }

                        function loadInitialData() {
                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 70);
                            jTest.fetchPromise.then(function() {
                                _.defer(step1);
                            });
                        }

                        function step1() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.allOptions.length).toBe(200);

                            done();
                        }
                    });

                    it('should not fetch data less than half of pageSize', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });

                        function isReady() {
                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 50);
                            jTest.fetchPromise.then(function() {
                                _.defer(step1);
                            });
                        }

                        function step1() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.offsetItem).toBe(50);

                            done();
                        }
                    });

                    it('should fetch more data to fill page', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });

                        function isReady() {
                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 51);
                            jTest.fetchPromise.then(function() {
                                _.defer(step1);
                            });
                        }

                        function step1() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 100, 100);
                            expect(store.state.allOptions.length).toBe(200);
                            expect(store.state.offsetItem).toBe(51);

                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 190);
                            jTest.fetchPromise.then(function() {
                                _.defer(step2);
                            });
                        }

                        function step2() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 200, 100);
                            expect(store.state.allOptions.length).toBe(300);
                            expect(store.state.offsetItem).toBe(190);

                            done();
                        }
                    });

                    it('should fetch also missing data', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });

                        function isReady() {
                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 180);
                            jTest.fetchPromise.then(function() {
                                _.defer(step1);
                            });
                        }

                        function step1() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 100, 200);
                            expect(store.state.allOptions.length).toBe(300);
                            expect(store.state.offsetItem).toBe(180);

                            done();
                        }
                    });
                });

                describe('with groups', function() {
                    beforeEach(function() {
                        var jTest = this;
                        jTest.fetchCallback = function(search, offset, pageSize) {
                            var groupName;

                            if (offset === 100) {
                                groupName = 'group1';
                            } else
                            if (offset >= 200) {
                                groupName = 'group2';
                            }

                            jTest.fetchPromise = Promise.resolve({
                                total: 500,
                                result: getOptions(pageSize, '', offset, groupName),
                            });
                            return jTest.fetchPromise;
                        };
                        spyOn(jTest, 'fetchCallback').and.callThrough();
                        jTest.store = new Store({propsData: {
                            groups: getGroups(2),
                            fetchCallback: jTest.fetchCallback,
                        }});
                        jTest.store.commit('isOpen', true);
                    });

                    it('should fetch data in groups', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(step1);
                        });

                        function step1() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 0, 100);
                            expect(store.state.allOptions.length).toBe(100);
                            expect(store.state.totalAllOptions).toBe(500);
                            expect(store.state.filteredOptions.length).toBe(100);
                            expect(store.state.totalFilteredOptions).toBe(502);
                            expect(store.state.offsetItem).toBe(0);

                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 100);
                            jTest.fetchPromise.then(function() {
                                _.defer(step2);
                            });
                        }

                        /* The items of the first group have been fetched */
                        function step2() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 100, 100);
                            expect(store.state.allOptions.length).toBe(200);
                            expect(store.state.totalAllOptions).toBe(500);
                            expect(store.state.filteredOptions.length).toBe(201);
                            expect(store.state.totalFilteredOptions).toBe(502);
                            expect(store.state.offsetItem).toBe(100);

                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 151);
                            jTest.fetchPromise.then(function() {
                                _.defer(step3);
                            });
                        }

                        /* As there is the group item which has been added
                         * we currently have all data so there is no query */
                        function step3() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.allOptions.length).toBe(200);
                            expect(store.state.totalAllOptions).toBe(500);
                            expect(store.state.filteredOptions.length).toBe(201);
                            expect(store.state.totalFilteredOptions).toBe(502);
                            expect(store.state.offsetItem).toBe(151);

                            store.commit('offsetItem', 152);
                            jTest.fetchPromise.then(function() {
                                _.defer(step4);
                            });
                        }

                        /* The items of the second group have been fetched */
                        function step4() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 200, 100);
                            expect(store.state.allOptions.length).toBe(300);
                            expect(store.state.totalAllOptions).toBe(500);
                            expect(store.state.filteredOptions.length).toBe(302);
                            expect(store.state.totalFilteredOptions).toBe(502);
                            expect(store.state.offsetItem).toBe(152);

                            jTest.fetchCallback.calls.reset();
                            store.commit('offsetItem', 252);
                            jTest.fetchPromise.then(function() {
                                _.defer(step5);
                            });
                        }

                        /* As there are the group items which have been added
                         * we currently have all data so there is no query */
                        function step5() {
                            expect(jTest.fetchCallback).not.toHaveBeenCalled();
                            expect(store.state.allOptions.length).toBe(300);
                            expect(store.state.totalAllOptions).toBe(500);
                            expect(store.state.filteredOptions.length).toBe(302);
                            expect(store.state.totalFilteredOptions).toBe(502);
                            expect(store.state.offsetItem).toBe(252);

                            store.commit('offsetItem', 253);
                            jTest.fetchPromise.then(function() {
                                _.defer(step6);
                            });
                        }

                        /* Next items are in second group, so no more group
                         * item has been added in filteredOptions */
                        function step6() {
                            expect(jTest.fetchCallback).toHaveBeenCalledWith('', 300, 100);
                            expect(store.state.allOptions.length).toBe(400);
                            expect(store.state.totalAllOptions).toBe(500);
                            expect(store.state.filteredOptions.length).toBe(402);
                            expect(store.state.totalFilteredOptions).toBe(502);
                            expect(store.state.offsetItem).toBe(253);

                            var optGroup = store.state.filteredOptions[201];
                            var optItem = store.state.filteredOptions[200];

                            expect(optGroup).toEqual({
                                id: 'group2',
                                text: 'group id 2',
                                disabled: false,
                                selected: false,
                                isGroup: true,
                            });
                            expect(optItem).toEqual({
                                id: 199,
                                text: 'text199',
                                disabled: false,
                                selected: false,
                                group: 'group1',
                                isGroup: false,
                            });

                            done();
                        }
                    });
                });
            });

            describe('when changing "pageSize"', function() {
                beforeEach(function() {
                    var jTest = this;
                    jTest.fetchCallback = function(search, offsetItem, pageSize) {
                        var prefix = offsetItem ? 'alpha' : 'beta';
                        var promise = new Promise(function(resolve) {
                            jTest.resolveFetch = function() {
                                var list = getOptions(Math.min(pageSize, 300), prefix);
                                resolve({
                                    total: 300,
                                    result: list,
                                });
                            };
                        });
                        jTest.fetchPromise = promise;

                        return promise;
                    };

                    spyOn(jTest, 'fetchCallback').and.callThrough();
                });

                it('should fetch a different amount of data', function(done) {
                    var jTest = this;
                    var store = new Store({propsData: {
                        fetchCallback: jTest.fetchCallback,
                        params: {
                            pageSize: 50,
                        },
                    }});

                    expect(jTest.fetchCallback).not.toHaveBeenCalled();
                    store.commit('isOpen', true);

                    expect(jTest.fetchCallback).toHaveBeenCalledWith('', 0, 50);
                    expect(store.state.status.searching).toBe(true);
                    jTest.fetchCallback.calls.reset();
                    jTest.resolveFetch();
                    jTest.fetchPromise.then(function() {
                        _.defer(afterInitialFetch);
                    });

                    function afterInitialFetch() {
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.allOptions.length).toBe(50);
                        expect(store.state.totalAllOptions).toBe(300);
                        expect(store.state.filteredOptions.length).toBe(50);
                        expect(store.state.totalFilteredOptions).toBe(300);

                        store.commit('pageSize', 150);
                        store.commit('offsetItem', 50);
                        store.$nextTick(afterChangingOffset);
                    }

                    function afterChangingOffset() {
                        expect(jTest.fetchCallback).toHaveBeenCalledWith('', 50, 150);
                        expect(store.state.status.searching).toBe(true);
                        jTest.fetchCallback.calls.reset();
                        jTest.resolveFetch();
                        jTest.fetchPromise.then(function() {
                            _.defer(receiveReponse);
                        });
                    }

                    function receiveReponse() {
                        expect(store.state.status.searching).toBe(false);
                        expect(store.state.allOptions.length).toBe(200);
                        expect(store.state.totalAllOptions).toBe(300);
                        expect(store.state.filteredOptions.length).toBe(200);
                        expect(store.state.totalFilteredOptions).toBe(300);

                        done();
                    }
                });
            });

            describe('when disabled is changed', function() {
                beforeEach(function() {
                    this.store = new Store({propsData: {
                        options: getOptions(5),
                    }});
                });

                it('should avoid opening the select list', function() {
                    var store = this.store;

                    store.commit('disabled', true);
                    store.commit('isOpen', true);

                    expect(store.state.isOpen).toBe(false);

                    store.commit('disabled', false);
                    store.commit('isOpen', true);

                    expect(store.state.isOpen).toBe(true);
                });

                it('should close the select list', function() {
                    var store = this.store;

                    store.commit('isOpen', true);
                    store.commit('disabled', true);

                    expect(store.state.isOpen).toBe(false);
                });
            });

            describe('when selectionIsExcluded is changed', function() {
                it('should reverse the selection', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(5),
                        params: {
                            multiple: true,
                        },
                        allowRevert: true,
                        value: [1, 3, 4],
                        selectionIsExcluded: false,
                    }});
                    store.commit('isOpen', true);
                    await sleep(0);

                    store.commit('selectionIsExcluded', true);
                    await sleep(0);

                    expect(store.state.internalValue).toEqual([0, 2]);
                    expect(store.state.selectionIsExcluded).toBe(false);

                    done();
                });

                it('should keep selection but revert selectionIsExcluded', async function(done) {
                    var store = new Store({propsData: {
                        params: {
                            multiple: true,
                        },
                        allowRevert: true,
                        value: [1, 3, 4],
                        selectionIsExcluded: false,
                        fetchCallback: buildFetchCb({total: 2000}),
                    }});
                    store.commit('isOpen', true);
                    await sleep(0);

                    store.commit('selectionIsExcluded', true);
                    await sleep(0);

                    expect(store.state.internalValue).toEqual([1, 3, 4]);
                    expect(store.state.selectionIsExcluded).toBe(true);

                    done();
                });
            });
        });

        describe('selectItem()', function() {
            describe('when "multiple" is false', function() {
                beforeEach(function() {
                    var options = getOptions(6);
                    options[4].disabled = true;

                    this.store = new Store({propsData: {
                        options: options,
                        params: {
                            multiple: false,
                            autoSelect: false,
                            strictValue: true,
                        },
                    }});
                });

                it('should select a unique value', function() {
                    var store = this.store;

                    expect(store.state.internalValue).toBe(null);

                    store.selectItem(2, true);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(true);

                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(5, true);
                    expect(store.state.internalValue).toBe(5);
                    expect(store.state.status.hasChanged).toBe(true);
                });

                it('should unselect a value', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(2, false);
                    expect(store.state.internalValue).toBe(null);
                    expect(store.state.status.hasChanged).toBe(true);

                    expect(store.state.selectionIsExcluded).toBe(false);
                });

                it('should not change when applying on other item', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    /* reset status to check that it is not modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(2, true);
                    expect(store.state.internalValue).toBe(2);

                    store.selectItem(5, false);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(false);
                });

                it('should not change when applying on disabled item', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    /* reset status to check that it is not modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(4, true);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(false);

                    store.state.internalValue = 4;
                    store.state.status.hasChanged = false;

                    store.selectItem(4, false);
                    expect(store.state.internalValue).toBe(4);
                    expect(store.state.status.hasChanged).toBe(false);
                });

                it('should select items when toggling', function() {
                    var store = this.store;

                    store.selectItem(2);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(true);

                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    /* In single value, toggling will not unselect */
                    store.selectItem(2);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(false);

                    /* disabled case */
                    store.selectItem(4);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(false);

                    expect(store.state.selectionIsExcluded).toBe(false);
                });

                it('should have set items as selected', function() {
                    var store = this.store;
                    store.commit('isOpen', true);

                    store.selectItem(2, true);
                    expect(store.state.filteredOptions[2].selected).toBe(true);

                    store.selectItem(5, true);
                    expect(store.state.filteredOptions[2].selected).toBe(false);
                    expect(store.state.filteredOptions[5].selected).toBe(true);

                    store.selectItem(5, false);
                    expect(store.state.filteredOptions[5].selected).toBe(false);
                });

                it('should close list', function() {
                    var store = this.store;
                    store.commit('isOpen', true);

                    /* on new selected item */
                    store.selectItem(2, true);
                    expect(store.state.isOpen).toBe(false);

                    store.commit('isOpen', true);

                    /* on previously selected item */
                    store.selectItem(2, true);
                    expect(store.state.isOpen).toBe(false);

                    store.commit('isOpen', true);

                    /* on disabled item, it should not close list */
                    store.selectItem(4, true);
                    expect(store.state.isOpen).toBe(true);
                });

                it('should clear selection', function() {
                    var store = this.store;
                    store.commit('isOpen', true);
                    store.state.internalValue = 1;

                    store.selectItem(null);
                    expect(store.state.isOpen).toBe(false);
                    expect(store.state.internalValue).toBe(null);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.state.status.hasChanged = false;
                    store.state.internalValue = 2;

                    /* applied also when selectic is closed */
                    store.selectItem(null);
                    expect(store.state.internalValue).toBe(null);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.state.status.hasChanged = false;
                    store.state.internalValue = 3;

                    /* ignore the selected argument */
                    store.selectItem(null, false);
                    expect(store.state.internalValue).toBe(null);
                    expect(store.state.status.hasChanged).toBe(true);
                });

                it('should reject invalid value with strictValue', function() {
                    var store = this.store;

                    store.selectItem(456, true);
                    expect(store.state.internalValue).toBe(null);
                    expect(store.state.status.hasChanged).toBe(false);

                    store.selectItem(2, true);
                    /* reset status to check that it is not modified */
                    store.state.status.hasChanged = false;

                    store.selectItem('3', true);
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(false);
                });
            });

            describe('when "multiple" is true', function() {
                beforeEach(function() {
                    var options = getOptions(6);
                    options[4].disabled = true;

                    this.store = new Store({propsData: {
                        options: options,
                        params: {
                            multiple: true,
                            strictValue: true,
                        },
                    }});
                });

                it('should select several value', function() {
                    var store = this.store;

                    expect(store.state.internalValue).toEqual([]);

                    store.selectItem(2, true);
                    expect(store.state.internalValue).toEqual([2]);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.selectItem(5, true);
                    expect(store.state.internalValue).toEqual([2, 5]);
                    expect(store.state.status.hasChanged).toBe(true);

                    expect(store.state.selectionIsExcluded).toBe(false);
                });

                it('should keep order in which they where selected', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    store.selectItem(5, true);
                    store.selectItem(1, true);
                    store.selectItem(3, true);
                    expect(store.state.internalValue).toEqual([2, 5, 1, 3]);

                    store.selectItem(5, true);
                    expect(store.state.internalValue).toEqual([2, 5, 1, 3]);
                });

                it('should unselect a value', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(2, false);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.selectItem(2, true);
                    store.selectItem(3, true);
                    store.selectItem(5, true);
                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(3, false);
                    expect(store.state.internalValue).toEqual([2, 5]);
                    expect(store.state.status.hasChanged).toBe(true);
                });

                it('should not change when applying on other item', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    /* reset status to check that it is not modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(2, true);
                    expect(store.state.internalValue).toEqual([2]);

                    store.selectItem(5, false);
                    expect(store.state.internalValue).toEqual([2]);
                    expect(store.state.status.hasChanged).toBe(false);
                });

                it('should not change when applying on disabled item', function() {
                    var store = this.store;

                    store.selectItem(2, true);
                    /* reset status to check that it is not modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(4, true);
                    expect(store.state.internalValue).toEqual([2]);
                    expect(store.state.status.hasChanged).toBe(false);

                    store.state.internalValue = [1, 4];
                    store.state.status.hasChanged = false;

                    store.selectItem(4, false);
                    expect(store.state.internalValue).toEqual([1, 4]);
                    expect(store.state.status.hasChanged).toBe(false);
                });

                it('should toggle item selection', function() {
                    var store = this.store;

                    store.selectItem(2);
                    expect(store.state.internalValue).toEqual([2]);
                    expect(store.state.status.hasChanged).toBe(true);

                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(2);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(true);

                    /* reset status to check that it is modified */
                    store.state.status.hasChanged = false;

                    /* disabled case */
                    store.selectItem(4);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(false);

                    expect(store.state.selectionIsExcluded).toBe(false);
                });

                it('should have set items as selected', function() {
                    var store = this.store;
                    store.commit('isOpen', true);

                    store.selectItem(2, true);
                    expect(store.state.filteredOptions[2].selected).toBe(true);

                    store.selectItem(5, true);
                    expect(store.state.filteredOptions[2].selected).toBe(true);
                    expect(store.state.filteredOptions[5].selected).toBe(true);

                    store.selectItem(2, false);
                    expect(store.state.filteredOptions[2].selected).toBe(false);
                    expect(store.state.filteredOptions[5].selected).toBe(true);
                });

                it('should not close list', function() {
                    var store = this.store;
                    store.commit('isOpen', true);

                    store.selectItem(2, true);
                    expect(store.state.isOpen).toBe(true);

                    store.selectItem(2, false);
                    expect(store.state.isOpen).toBe(true);

                    store.selectItem(4, true);
                    expect(store.state.isOpen).toBe(true);
                });


                it('should clear selection', function() {
                    var store = this.store;
                    store.state.internalValue = [1, 4];

                    store.selectItem(null);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.state.status.hasChanged = false;
                    store.state.internalValue = [2, 4];

                    /* ignore the selected argument */
                    store.selectItem(null, false);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.state.status.hasChanged = false;
                    store.state.internalValue = [3, 4];

                    /* applied also when selectic is open */
                    store.commit('isOpen', true);
                    store.selectItem(null);
                    expect(store.state.isOpen).toBe(true);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(true);
                });

                it('should not change when applying on invalid values with strictValue', function() {
                    var store = this.store;

                    store.selectItem(1.5, true);
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.status.hasChanged).toBe(false);

                    store.selectItem(2, true);
                    /* reset status to check that it is not modified */
                    store.state.status.hasChanged = false;

                    store.selectItem(-42, true);
                    expect(store.state.internalValue).toEqual([2]);
                    expect(store.state.status.hasChanged).toBe(false);

                    store.selectItem('2', false);
                    expect(store.state.internalValue).toEqual([2]);
                    expect(store.state.status.hasChanged).toBe(false);
                });
            });
        });

        describe('toggleSelectAll()', function() {
            it('should select all static options', function(done) {
                var store = new Store({propsData: {
                    options: getOptions(5),
                    params: {
                        multiple: true,
                    },
                    value: [1, 3],
                }});
                store.commit('isOpen', true);

                expect(store.state.status.areAllSelected).toBe(false);

                store.toggleSelectAll();
                store.$nextTick(step1);
                function step1() {
                    expect(store.state.internalValue).toEqual([1, 3, 0, 2, 4]);
                    expect(store.state.selectionIsExcluded).toBe(false);
                    expect(store.state.status.areAllSelected).toBe(true);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.toggleSelectAll();
                    store.$nextTick(step2);
                }

                function step2() {
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.selectionIsExcluded).toBe(false);
                    expect(store.state.status.areAllSelected).toBe(false);

                    done();
                }
            });

            it('should invert selection when selectionIsExcluded is true', async function(done) {
                var store = new Store({propsData: {
                    options: getOptions(5),
                    params: {
                        multiple: true,
                    },
                    value: [1, 3],
                    selectionIsExcluded: true,
                }});
                store.commit('isOpen', true);

                await sleep(0);

                expect(store.state.internalValue).toEqual([0, 2, 4]);
                expect(store.state.selectionIsExcluded).toBe(false);
                expect(store.state.status.areAllSelected).toBe(false);

                store.toggleSelectAll();
                store.$nextTick(step1);
                function step1() {
                    expect(store.state.internalValue).toEqual([0, 2, 4, 1, 3]);
                    expect(store.state.selectionIsExcluded).toBe(false);
                    expect(store.state.status.areAllSelected).toBe(true);
                    expect(store.state.status.hasChanged).toBe(true);

                    store.toggleSelectAll();
                    store.$nextTick(step2);
                }

                function step2() {
                    expect(store.state.internalValue).toEqual([]);
                    expect(store.state.selectionIsExcluded).toBe(false);
                    expect(store.state.status.areAllSelected).toBe(false);

                    done();
                }
            });

            describe('given dynamic options', function() {
                beforeEach(function() {
                    var jTest = this;
                    jTest.store = new Store({propsData: {
                        params: {
                            multiple: true,
                        },
                        value: [1, 3],
                        fetchCallback: function(search, offset) {
                            jTest.fetchPromise = new Promise(function(success) {
                                success({
                                    total: 20,
                                    result: getOptions(10, '', offset),
                                });
                            });
                            return jTest.fetchPromise;
                        },
                    }});
                    jTest.store.commit('isOpen', true);
                });

                it('should set the "selectionIsExcluded" flag', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(isReady);
                    });

                    function isReady() {
                        store.toggleSelectAll();
                        store.$nextTick(step1);
                    }

                    function step1() {
                        expect(store.state.internalValue).toEqual([]);
                        expect(store.state.selectionIsExcluded).toBe(true);
                        expect(store.state.status.hasChanged).toBe(true);

                        store.toggleSelectAll();
                        store.$nextTick(step2);
                    }

                    function step2() {
                        expect(store.state.internalValue).toEqual([]);
                        expect(store.state.selectionIsExcluded).toBe(false);
                        expect(store.state.status.areAllSelected).toBe(false);

                        done();
                    }
                });

                it('should set all options when all fetched', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(function() {
                            store.commit('offsetItem', 10);

                            jTest.fetchPromise.then(function() {
                                _.defer(isReady);
                            });
                        });
                    });

                    function isReady() {
                        store.toggleSelectAll();
                        store.$nextTick(step1);
                    }

                    function step1() {
                        expect(store.state.internalValue).toEqual(
                            [1, 3, 0, 2, 4, 5, 6 ,7 ,8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
                        );
                        expect(store.state.selectionIsExcluded).toBe(false);
                        expect(store.state.status.areAllSelected).toBe(true);
                        expect(store.state.status.hasChanged).toBe(true);

                        store.toggleSelectAll();
                        store.$nextTick(step2);
                    }

                    function step2() {
                        expect(store.state.internalValue).toEqual([]);
                        expect(store.state.selectionIsExcluded).toBe(false);
                        expect(store.state.status.areAllSelected).toBe(false);

                        done();
                    }
                });
            });

            describe('given searched text', function() {
                it('should select all filtered static options', function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(15),
                        params: {
                            multiple: true,
                        },
                        value: [1, 3],
                    }});
                    store.commit('isOpen', true);
                    store.commit('searchText', '1');

                    store.toggleSelectAll();
                    store.$nextTick(step1);

                    function step1() {
                        expect(store.state.internalValue).toEqual(
                            [1, 3, 10, 11, 12, 13, 14]
                        );
                        expect(store.state.selectionIsExcluded).toBe(false);
                        expect(store.state.status.areAllSelected).toBe(true);
                        expect(store.state.status.hasChanged).toBe(true);

                        store.toggleSelectAll();
                        store.$nextTick(step2);
                    }

                    function step2() {
                        expect(store.state.internalValue).toEqual([3]);
                        expect(store.state.selectionIsExcluded).toBe(false);
                        expect(store.state.status.areAllSelected).toBe(false);

                        done();
                    }
                });

                describe('given dynamic options', function() {
                    beforeEach(function() {
                        var jTest = this;
                        jTest.store = new Store({propsData: {
                            params: {
                                multiple: true,
                            },
                            value: [1, 15],
                            fetchCallback: function(search, offset) {
                                jTest.fetchPromise = new Promise(function(success) {
                                    success({
                                        total: 20,
                                        result: getOptions(10, '', offset),
                                    });
                                });
                                return jTest.fetchPromise;
                            },
                        }});
                        jTest.store.commit('isOpen', true);
                        jTest.store.commit('searchText', '1');
                    });

                    it('should not select anything while not all searched items are fetched', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });

                        function isReady() {
                            store.toggleSelectAll();
                            store.$nextTick(step1);
                        }

                        function step1() {
                            expect(store.state.internalValue).toEqual([1, 15]);
                            expect(store.state.selectionIsExcluded).toBe(false);
                            expect(store.state.status.hasChanged).toBe(false);
                            expect(store.state.status.errorMessage)
                                .toBe(store.labels.cannotSelectAllSearchedItems);

                            done();
                        }
                    });

                    it('should select all options when all fetched', function(done) {
                        var jTest = this;
                        var store = jTest.store;

                        jTest.fetchPromise.then(function() {
                            _.defer(function() {
                                store.commit('offsetItem', 10);

                                jTest.fetchPromise.then(function() {
                                    _.defer(isReady);
                                });
                            });
                        });

                        function isReady() {
                            store.toggleSelectAll();
                            store.$nextTick(step1);
                        }

                        function step1() {
                            expect(store.state.internalValue).toEqual(
                                [1, 15, 0, 2, 3, 4, 5, 6 ,7 ,8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19]
                            );
                            expect(store.state.selectionIsExcluded).toBe(false);
                            expect(store.state.status.areAllSelected).toBe(true);
                            expect(store.state.status.hasChanged).toBe(true);
                            expect(store.state.status.errorMessage).toBe('');

                            store.toggleSelectAll();
                            store.$nextTick(step2);
                        }

                        function step2() {
                            expect(store.state.internalValue).toEqual([]);
                            expect(store.state.selectionIsExcluded).toBe(false);
                            expect(store.state.status.areAllSelected).toBe(false);

                            done();
                        }
                    });
                });
            });

            it('should do nothing when "multiple" is false', function(done) {
                var store = new Store({propsData: {
                    options: getOptions(5),
                    params: {
                        multiple: false,
                    },
                    value: 2,
                }});

                store.toggleSelectAll();
                store.$nextTick(step1);

                function step1() {
                    expect(store.state.internalValue).toBe(2);
                    expect(store.state.status.hasChanged).toBe(false);
                    expect(store.state.status.areAllSelected).toBe(false);

                    done();
                }
            });
        });

        describe('getItem()', function() {
            describe('with static options', function() {
                beforeEach(function () {
                    this.store = new Store({propsData: {
                        options: getOptions(15),
                        value: 5,
                    }});
                });

                it('should retrieve the given item', function() {
                    const item = this.store.getItem(12);

                    expect(item).not.toEqual(jasmine.any(Promise));
                    expect(item).toEqual({
                        id: 12,
                        text: 'text12',
                        disabled: false,
                        selected: false,
                        isGroup: false,
                    });
                });

                it('should retrieve selected item', function() {
                    const item = this.store.getItem(5);

                    expect(item).not.toEqual(jasmine.any(Promise));
                    expect(item).toEqual({
                        id: 5,
                        text: 'text5',
                        disabled: false,
                        selected: true,
                        isGroup: false,
                    });
                });

                it('should fallback for unknown item', function() {
                    const item = this.store.getItem(1024);

                    expect(item).not.toEqual(jasmine.any(Promise));
                    expect(item).toEqual({
                        id: 1024,
                        text: '1024',
                        disabled: false,
                        selected: false,
                        isGroup: false,
                    });
                });
            });

            describe('with dynamic options', function() {
                beforeEach(function() {
                    var jTest = this;

                    jTest.getItemsCallback = function(ids) {
                        jTest.getItemPromise = new Promise(function(resolve) {
                            jTest.resolveGetItem = function(hasFound) {
                                var rslt = ids.map(function(id) {
                                    if (hasFound) {
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
                        });

                        return jTest.getItemPromise;
                    };

                    spyOn(jTest, 'getItemsCallback').and.callThrough();

                    jTest.store = new Store({propsData: {
                        fetchCallback: function(search) {
                            jTest.fetchPromise = Promise.resolve({
                                total: 300,
                                result: getOptions(50, search, search ? 100 : 0),
                            });

                            return jTest.fetchPromise;
                        },
                        pageSize: 50,
                        getItemsCallback: jTest.getItemsCallback,
                        value: 55,
                    }});

                    jTest.store.commit('isOpen', true);
                });

                it('should retrieve an item which is already fetched', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    store.$nextTick(function() {
                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var item = store.getItem(5);

                        expect(jTest.getItemsCallback).not.toHaveBeenCalled();
                        expect(item).toEqual({
                            id: 5,
                            text: 'text5',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        });

                        done();
                    }
                });

                it('should retrieve an item in filtered list', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        store.commit('searchText', 'searched');
                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var item = store.getItem(105);


                        expect(jTest.getItemsCallback).not.toHaveBeenCalled();
                        expect(item).toEqual({
                            id: 105,
                            text: 'searched105',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        });

                        done();
                    }
                });

                it('should not retrieve an item which is not yet fetched', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(isReady);
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var item = store.getItem(250);

                        expect(jTest.getItemsCallback).toHaveBeenCalledWith([250]);
                        expect(item).toEqual({
                            id: 250,
                            text: '250',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        });

                        done();
                    }
                });

                it('should cache result of a not yet fetched item', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(isReady);
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var item = store.getItem(250);

                        jTest.resolveGetItem(true);
                        jTest.getItemPromise.then(function() {
                            _.defer(step1);
                        });

                        function step1() {
                            var item2 = store.getItem(250);

                            expect(item2).toEqual({
                                id: 250,
                                text: 'some text 250',
                                disabled: false,
                                selected: false,
                                isGroup: false,
                                data: 'data250',
                            });
                            expect(item).not.toEqual(item2);

                            done();
                        }
                    }
                });
            });
        });

        describe('getItems()', function() {
            describe('with static options', function() {
                beforeEach(function () {
                    this.store = new Store({propsData: {
                        options: getOptions(15),
                        value: 5,
                    }});
                });

                it('should retrieve the given item', function(done) {
                    const pItem = this.store.getItems([12]);

                    expect(pItem).toEqual(jasmine.any(Promise));
                    pItem.then(function(item) {
                        expect(item).toEqual([{
                            id: 12,
                            text: 'text12',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        }]);

                        done();
                    });
                });

                it('should retrieve items in given order', function(done) {
                    const pItem = this.store.getItems([12, 3, 7]);

                    expect(pItem).toEqual(jasmine.any(Promise));
                    pItem.then(function(item) {
                        expect(item).toEqual([{
                            id: 12,
                            text: 'text12',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        }, {
                            id: 3,
                            text: 'text3',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        }, {
                            id: 7,
                            text: 'text7',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        }]);

                        done();
                    });
                });

                it('should retrieve selected item', function(done) {
                    const pItem = this.store.getItems([5]);

                    expect(pItem).toEqual(jasmine.any(Promise));
                    pItem.then(function(item) {
                        expect(item).toEqual([{
                            id: 5,
                            text: 'text5',
                            disabled: false,
                            selected: true,
                            isGroup: false,
                        }]);

                        done();
                    });
                });

                it('should fallback for unknown item', function(done) {
                    const pItem = this.store.getItems([258]);

                    expect(pItem).toEqual(jasmine.any(Promise));
                    pItem.then(function(item) {
                        expect(item).toEqual([{
                            id: 258,
                            text: '258',
                            disabled: false,
                            selected: false,
                            isGroup: false,
                        }]);

                        done();
                    });
                });
            });

            describe('with dynamic options', function() {
                beforeEach(function() {
                    var jTest = this;

                    jTest.getItemsCallback = function(ids) {
                        var promise = new Promise(function(resolve) {
                            jTest.resolveGetItem = function(hasFound) {
                                var rslt = ids.map(function(id) {
                                    if (hasFound) {
                                       return {
                                            id: id,
                                            text: 'some text ' + id,
                                        };
                                    }
                                    return;
                                });

                                resolve(rslt);
                            };
                        });

                        return promise;
                    };

                    spyOn(jTest, 'getItemsCallback').and.callThrough();

                    jTest.store = new Store({propsData: {
                        fetchCallback: function(search) {
                            jTest.fetchPromise = Promise.resolve({
                                total: 200,
                                result: getOptions(10, search, search ? 100 : 0),
                            });

                            return jTest.fetchPromise;
                        },
                        getItemsCallback: jTest.getItemsCallback,
                        value: 55,
                    }});

                    jTest.store.commit('isOpen', true);
                });

                it('should retrieve an item which is already fetched', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    store.$nextTick(function() {
                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var p = store.getItems([5]);

                        expect(jTest.getItemsCallback).not.toHaveBeenCalled();

                        p.then(function(item) {
                            expect(item).toEqual([{
                                id: 5,
                                text: 'text5',
                                disabled: false,
                                selected: false,
                                isGroup: false,
                            }]);

                            done();
                        });
                    }
                });

                it('should retrieve an item in filtered list', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        store.commit('searchText', 'searched');
                        jTest.fetchPromise.then(function() {
                            _.defer(isReady);
                        });
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var p = store.getItems([105]);

                        expect(jTest.getItemsCallback).not.toHaveBeenCalled();

                        p.then(function(item) {
                            expect(item).toEqual([{
                                id: 105,
                                text: 'searched105',
                                disabled: false,
                                selected: false,
                                isGroup: false,
                            }]);

                            done();
                        });
                    }
                });

                it('should retrieve an item which is not yet fetched', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(isReady);
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();
                        var p = store.getItems([55]);

                        expect(jTest.getItemsCallback).toHaveBeenCalledWith([55]);
                        jTest.resolveGetItem(true);

                        p.then(function(item) {
                            expect(item).toEqual([{
                                id: 55,
                                text: 'some text 55',
                                disabled: false,
                                selected: true,
                                isGroup: false,
                            }]);

                            done();
                        });
                    }
                });

                it('should cache result of a not yet fetched item', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(function() {
                            store.getItems([55]).then(isReady);
                            jTest.resolveGetItem(true);
                        });
                    });

                    function isReady() {
                        jTest.getItemsCallback.calls.reset();

                        var p = store.getItems([55]);

                        expect(jTest.getItemsCallback).not.toHaveBeenCalled();

                        p.then(function(item) {
                            expect(item).toEqual([{
                                id: 55,
                                text: 'some text 55',
                                disabled: false,
                                selected: true,
                                isGroup: false,
                            }]);

                            done();
                        });
                    }
                });

                it('should fallback for unknown item', function(done) {
                    var jTest = this;
                    var store = jTest.store;

                    jTest.fetchPromise.then(function() {
                        _.defer(isReady);
                    });

                    function isReady() {
                        var p = store.getItems([555]);

                        expect(jTest.getItemsCallback).toHaveBeenCalledWith([555]);
                        jTest.resolveGetItem(false);

                        p.then(function(item) {
                            expect(item).toEqual([{
                                id: 555,
                                text: '555',
                                disabled: false,
                                selected: false,
                                isGroup: false,
                            }]);

                            done();
                        });
                    }
                });
            });
        });

        describe('changeGroups()', function() {
            it('should update "groups"', function() {
                var store = new Store({propsData: {
                    groups: [{
                        id: '1st group',
                        text: 'First group',
                    }],
                }});

                store.changeGroups(getGroups(5));

                expect(store.state.groups.size).toBe(5);

                store.changeGroups(getGroups(2));

                expect(store.state.groups.size).toBe(2);
            });
        });

        describe('resetErrorMessage()', function() {
            it ('should reset the status of error message', function() {
                var store = new Store();

                store.state.status.errorMessage = 'An error';

                store.resetErrorMessage();

                expect(store.state.status.errorMessage).toBe('');
            });
        });

        describe('resetChange()', function() {
            it('should reset the status of "hasChanged"', function() {
                var store = new Store();

                store.state.status.hasChanged = true;

                store.resetChange();

                expect(store.state.status.hasChanged).toBe(false);

                /* redoing the reset should not change again the status */
                store.resetChange();

                expect(store.state.status.hasChanged).toBe(false);
            });
        });

        describe('clearCache()', function() {
            it('should clear all options already loaded', function() {
                var store = new Store({propsData: {
                    options: getOptions(10),
                    value: 2,
                }});
                store.state.status.errorMessage = 'a message';

                store.clearCache(true);

                expect(store.state.allOptions).toEqual([]);
                expect(store.state.totalAllOptions).toBe(0);
                expect(store.state.filteredOptions).toEqual([]);
                expect(store.state.status.errorMessage).toBe('');
                expect(store.state.internalValue).toBe(null);
            });

            it('should rebuild all options', function() {
                var options = getOptions(10);
                var store = new Store({propsData: {
                    options: options,
                    value: 2,
                }});
                store.state.status.errorMessage = 'a message';

                store.clearCache();

                expect(store.state.allOptions).toEqual(options);
                expect(store.state.allOptions).not.toBe(options);
                expect(store.state.totalAllOptions).toBe(10);
                expect(store.state.filteredOptions).toEqual([]);
                expect(store.state.status.errorMessage).toBe('');
                expect(store.state.internalValue).toBe(2);
            });
        });

        describe('state selectedOptions', function() {
            it('should be updated with static option', function(done) {
                var store = new Store({propsData: {
                    options: getOptions(20),
                    value: [12, 5],
                    params: {
                        multiple: true,
                    },
                }});

                _.defer(isReady);

                function isReady() {
                    expect(store.state.selectedOptions).toEqual([{
                        id: 12,
                        text: 'text12',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    }, {
                        id: 5,
                        text: 'text5',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    }]);

                    store.selectItem(3, true);
                    _.defer(hasBeenUpdated);
                }

                function hasBeenUpdated() {
                    expect(store.state.selectedOptions).toEqual([{
                        id: 12,
                        text: 'text12',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    }, {
                        id: 5,
                        text: 'text5',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    }, {
                        id: 3,
                        text: 'text3',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    }]);

                    done();
                }
            });

            it('should be updated with dynamic option', function(done) {
                /* {{{ preparation */

                var jTest = this;

                jTest.getItemsCallback = function (ids) {
                    jTest.getItemPromise = new Promise(function(resolve) {
                        jTest.resolveGetItem = function(hasFound) {
                            var rslt = ids.map(function(id) {
                                if (hasFound) {
                                    return {
                                        id: id,
                                        text: 'some text ' + id,
                                    };
                                }
                            });
                            resolve(rslt);
                        };
                    });

                    return jTest.getItemPromise;
                };

                var store = new Store({propsData: {
                    fetchCallback: function(search) {
                        jTest.fetchPromise = Promise.resolve({
                            total: 200,
                            result: getOptions(10, search, search ? 100 : 0),
                        });

                        return jTest.fetchPromise;
                    },
                    getItemsCallback: jTest.getItemsCallback,
                    value: 55,
                }});

                /* }}} */

                _.defer(isReady);

                function isReady() {
                    expect(store.state.selectedOptions).toEqual({
                        id: 55,
                        text: '55',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    });

                    jTest.resolveGetItem(true);
                    jTest.getItemPromise.then(function() {
                        _.defer(valueFetched);
                    });
                }

                function valueFetched() {
                    expect(store.state.selectedOptions).toEqual({
                        id: 55,
                        text: 'some text 55',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    });

                    store.selectItem(22, true);
                    store.$nextTick(function() {
                        jTest.resolveGetItem(true);
                        jTest.getItemPromise.then(function() {
                            _.defer(valueChanged);
                        });
                    });
                }

                function valueChanged() {
                    expect(store.state.selectedOptions).toEqual({
                        id: 22,
                        text: 'some text 22',
                        selected: true,
                        disabled: false,
                        isGroup: false,
                    });

                    done();
                }
            });
        });

        describe('change props', function() {
            it('should change value', function(done) {
                var propOptions = getOptions(15, 'alpha');
                propOptions[12].disabled = true;

                var store = new Store({propsData: {
                    options: propOptions,
                }});
                store.value = 23;

                store.$nextTick(function() {
                    expect(store.state.internalValue).toBe(23);
                    expect(store.state.status.hasChanged).toBe(false);

                    store.value = 12;
                    store.$nextTick(areDisabledItemSelected);
                });

                function areDisabledItemSelected() {
                    expect(store.state.internalValue).toBe(12);
                    expect(store.state.status.hasChanged).toBe(false);

                    done();
                }
            });

            describe('"options"', function() {
                it('should change options', async function(done) {
                    var propOptions = getOptions(15, 'alpha');
                    var store = new Store({propsData: {options: propOptions}});

                    await sleep(0);
                    store.commit('isOpen', true);

                    expect(store.state.allOptions.length).toBe(15);

                    store.options = getOptions(5, 'beta');

                    store.$nextTick(function() {
                        var firstOption = store.state.filteredOptions[0];

                        expect(store.state.allOptions.length).toBe(5);
                        expect(store.state.totalAllOptions).toBe(5);
                        expect(store.state.filteredOptions.length).toBe(5);
                        expect(store.state.totalFilteredOptions).toBe(5);
                        expect(store.state.internalValue).toBe(0);
                        expect(firstOption).toEqual({
                            id: 0,
                            text: 'beta0',
                            disabled: false,
                            selected: true,
                            isGroup: false,
                        });
                        expect(store.state.status.errorMessage).toBe('');
                        done();
                    });
                });

                it('should invalid selection in strictValue', function(done) {
                    var propOptions = getOptions(15, 'alpha');
                    var store = new Store({propsData: {
                        options: propOptions,
                        value: 7,
                        params: {
                            autoSelect: false,
                            strictValue: true,
                        },
                    }});
                    store.commit('isOpen', true);

                    expect(store.state.internalValue).toBe(7);

                    store.options = getOptions(5, 'beta');

                    store.$nextTick(function() {
                        expect(store.state.internalValue).toBe(null);
                        done();
                    });
                });

                it('should keep valid selection in strictValue', function(done) {
                    var propOptions = getOptions(15, 'alpha');
                    var store = new Store({propsData: {
                        options: propOptions,
                        value: 3,
                        params: {
                            autoSelect: false,
                            strictValue: true,
                        },
                    }});
                    store.commit('isOpen', true);

                    expect(store.state.internalValue).toBe(3);

                    store.options = getOptions(5, 'beta');

                    store.$nextTick(function() {
                        expect(store.state.internalValue).toBe(3);
                        done();
                    });
                });

                it('should update selection', async function(done) {
                    var propOptions = getOptions(15, 'alpha');
                    var store = new Store({propsData: {
                        options: propOptions,
                        value: 7,
                        params: {
                            autoSelect: false,
                            strictValue: false,
                        },
                    }});
                    store.commit('isOpen', true);

                    await sleep(0);
                    expect(store.state.selectedOptions.text).toBe('alpha7');

                    store.options = getOptions(10, 'beta');

                    await sleep(0);
                    expect(store.state.selectedOptions.text).toBe('beta7');
                    done();
                });

                it('should disable the select when only one option is given', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(5, 'alpha'),
                        params: {
                            autoDisabled: true,
                        },
                    }});
                    await sleep(0);

                    store.commit('isOpen', true);
                    await sleep(0);

                    expect(store.state.internalValue).toBe(0);
                    expect(store.state.disabled).toBe(false);
                    expect(store.state.isOpen).toBe(true);

                    store.options = getOptions(1, 'beta');
                    await sleep(0);

                    expect(store.state.internalValue).toBe(0);
                    expect(store.state.disabled).toBe(true);
                    expect(store.state.isOpen).toBe(false);
                    done();
                });

                it('should enable the select when more options are given', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1, 'alpha'),
                        params: {
                            autoDisabled: true,
                        },
                    }});
                    await sleep(0);

                    store.commit('isOpen', true);
                    await sleep(0);

                    expect(store.state.internalValue).toBe(0);
                    expect(store.state.disabled).toBe(true);
                    expect(store.state.isOpen).toBe(false);

                    store.options = getOptions(5, 'beta');
                    await sleep(0);

                    expect(store.state.internalValue).toBe(0);
                    expect(store.state.disabled).toBe(false);
                    expect(store.state.isOpen).toBe(false);
                    done();
                });

                it('should not re-enable the select if disable is set', async function(done) {
                    var store = new Store({propsData: {
                        options: getOptions(1, 'alpha'),
                        disabled: true,
                        params: {
                            autoDisabled: true,
                        },
                    }});
                    await sleep(0);

                    store.commit('isOpen', true);
                    await sleep(0);

                    expect(store.state.internalValue).toBe(0);
                    expect(store.state.disabled).toBe(true);
                    expect(store.state.isOpen).toBe(false);

                    store.options = getOptions(5, 'beta');
                    await sleep(0);

                    expect(store.state.internalValue).toBe(0);
                    expect(store.state.disabled).toBe(true);
                    expect(store.state.isOpen).toBe(false);
                    done();
                });
            });

            it('should change selectionIsExcluded', function(done) {
                var store = new Store({propsData: {
                    fetchCallback: buildFetchCb({total: 5}),
                    selectionIsExcluded: false,
                    params: {
                        multiple: true,
                    },
                }});
                store.selectionIsExcluded = true;

                store.$nextTick(function() {
                    expect(store.state.selectionIsExcluded).toBe(true);

                    store.selectionIsExcluded = false;

                    store.$nextTick(function() {
                        expect(store.state.selectionIsExcluded).toBe(false);
                        done();
                    });
                });
            });

            it('should change disabled', function(done) {
                var store = new Store({propsData: {
                    options: getOptions(2),
                }});

                store.disabled = true;
                store.$nextTick(step1);

                function step1() {
                    expect(store.state.disabled).toBe(true);

                    store.disabled = false;
                    store.$nextTick(step2);
                }

                function step2() {
                    expect(store.state.disabled).toBe(false);

                    done();
                }
            });
        });

        describe('customize texts', function() {
            it('should have default texts', function() {
                var store = new Store();

                expect(store.labels).toBeDefined();

                /* Test some values */
                expect(store.labels.searching).toBe('Searching');
                expect(store.labels.searchPlaceholder).toBe('Search');
                expect(store.labels.noResult).toBe('No results');
            });

            it('should change texts for an instance', function() {
                var store = new Store({propsData: {
                    texts: {
                        searching: 'please wait',
                        noResult: 'nada',
                    },
                }});
                var storeRef = new Store();

                /* Test some values */
                expect(store.labels.searching).toBe('please wait');
                expect(store.labels.searchPlaceholder).toBe('Search');
                expect(store.labels.noResult).toBe('nada');

                /* Assert it has not change other instances */
                expect(storeRef.labels.searching).toBe('Searching');
                expect(storeRef.labels.searchPlaceholder).toBe('Search');
                expect(storeRef.labels.noResult).toBe('No results');
            });

            it('should change dynamically texts for an instance', function() {
                var store = new Store();
                var storeExistingRef = new Store();

                store.changeTexts({
                    searching: 'please wait',
                    noResult: 'nada',
                });

                /* Test some values */
                expect(store.labels.searching).toBe('please wait');
                expect(store.labels.searchPlaceholder).toBe('Search');
                expect(store.labels.noResult).toBe('nada');

                /* Assert it has not change other instances */
                expect(storeExistingRef.labels.searching).toBe('Searching');
                expect(storeExistingRef.labels.searchPlaceholder).toBe('Search');
                expect(storeExistingRef.labels.noResult).toBe('No results');

                var storeNewRef = new Store();
                /* Assert it has not change newly created instances */
                expect(storeNewRef.labels.searching).toBe('Searching');
                expect(storeNewRef.labels.searchPlaceholder).toBe('Search');
                expect(storeNewRef.labels.noResult).toBe('No results');
            });

            it('should change texts for all new instances', function() {
                StoreFile.changeTexts({
                    searching: 'please wait',
                    noResult: 'nada',
                });

                var store = new Store();

                /* Test some values */
                expect(store.labels.searching).toBe('please wait');
                expect(store.labels.searchPlaceholder).toBe('Search');
                expect(store.labels.noResult).toBe('nada');
            });

            afterEach(function() {
                StoreFile.changeTexts({
                    searching: 'Searching',
                    noResult: 'No results',
                });
            });
        });
    });

    /* }}} */
});
