# Advanced configuration with `params`

[Back to documentation index](main.md)

In property `params` you can configure selectic to behave the way you want.
All configurations set in this property should not change during the component life.

This property is an object with several attributes which are listed below.


## hideFilter

Type: `boolean` | `'auto'`

If `hideFilter` is set to `true`, the handler to open the filter panel is hidden and it will not be possible to search for options.

If `hideFilter` is set to `'auto`, the handler to open the filter panel is hidden only if there is less than 10 options (when there is no scroll), and is displayed otherwise. _This is the default value_.

If `hideFilter` is set to `true`, the handler to open the filter panel is always displayed.

```html
<selectic
    params={{
        hideFilter: false,
    }}
    options={optionList}
/>
```

## allowClearSelection

Type: `boolean`

If `allowClearSelection` is set to `true`, it will be possible to remove the selection to have nothing selected.

If `allowClearSelection` is set to `false`, it won't be possible to have nothing selected since an item has been selected. _This is the default value_.

```html
<selectic
    params={{
        allowClearSelection: true,
    }}
    options={optionList}
/>
```

## autoSelect

Type: `boolean`

If `autoSelect` is set to `true`, it will select automatically the first item if the value is empty. It behaves like `<select>` which selects by default the first item.

If `autoSelect` is set to `false`, it won't select anything automatically.

By default, it is set to `true` if `multiple` is not set, to `false` otherwise.

```html
<selectic
    params={{
        autoSelect: false,
    }}
    options={optionList}
/>
```

## autoDisabled

Type: `boolean`

If `autoDisabled` is set to `true`, it will disable automatically the component if the list of options is empty or if there is only one which must be selected (`allowClearSelection` is not set).

It doesn't apply for dynamic list ([see dymanic configuration](dynamic.md)).

By default, it is set to `true`.

```html
<selectic
    params={{
        autoDisabled: true,
    }}
    options={optionList}
/>
```

## strictValue

Type: `boolean`

If `stricValue` is set to `true`, it will consider value as `undefined` if its value is not an id of `options`.

By default, it is set to `false`.

```html
<selectic
    params={{
        strictValue: true,
    }}
    options={optionList}
/>
```

## selectionOverflow

Type: `'collapsed'` | `'multiline'`

`selectOverflow` is to describe how selected options should be displayed when theyr are not enough space to display them all (in _multiple_ mode).

Currently there are two supported behavior:
* `'collapsed'`: the size of selectic input is not changed. If there is not enough space to display all selected options then it displays the possible ones then displays a _"+x others"_ in a badge (_x_ is the number of not displayed options). It is possible to watch these options with `title` or by opening selectic and see which options are selected. _This is the default value_.
* `'multiline'`: If there is not enough space to display all selected options then it displays the others on another line. The size of the component can be higher than the allowed space.

```html
<selectic
    params={{
        selectionOverflow: 'multiple',
    }}
    options={optionList}
/>
```

## emptyValue

Type: `OptionId`

By default, if there is no selected options, the result given by `getValue()` returns `null`  (or `[]` in _multiple_ mode).

`emptyValue` allows to change this default value.

```html
<selectic
    params={{
        emptyValue: '',
    }}
    options={optionList}
/>
```

## formatOption

Type: `function (option) => option`

This callback function is called when items are displayed in the list. This allows to return specific class, style or icon depending on context, or to display a different text for the same option if it is in the list or in selection area.

As argument, it receives an option item and should also return an option item.

```html
<selectic
    params={{
        formatOption: (option) => {
            if (option.id === 2) {
                return Object.assign({}, option, {
                    style: 'color: orange; font-weight: bold;',
                    icon: 'fa fa-plus',
                });
            }
            return option;
        },
    }}
    options={optionList}
/>
```

## formatSelection

Type: `function (option) => option`

This callback function is called when items are displayed in the selected area. This allows to return specific class, style or icon depending on context, or to display a different text for ame option if it is in the list or in selection area.

As argument, it receives an option item and should also return an option item.

```html
<selectic
    params={{
        formatSelection: (option) => {
            return Object.assign({}, option, {
                style: 'background-color: rgb(250, 250, 20 * option.id)',
            });
        },
    }}
    options={optionList}
/>
```

## fetchCallback

Type: `function (search, offset, limit) => Promise<{total, result}>`

The purpose of this function is to return a list of option dynamically. With it, it is possible to fetch data build the list asynchronously (useful for very large list).

Read [the dynamic documentation](dynamic.md) for more information.

It should return a promise which resolves with an object which contains the total number of items and the list of options asked by the request.

```html
<selectic
    params={{
        fetchCallback: (search, offset, limit) => fetch(`list?search=${search}&offset=${offset}&limit=${limit}`),
    }}
    options={optionList}
/>
```

## getItemsCallback

Type: `function (optionId[]) => Promise<option[]>`

The purpose of this function is to return options information from an id list.
This is used to display correctly the initial selected options.

Read [the dynamic documentation](dynamic.md) for more information.

It should return a promise which resolves with an array of options corresponding of the given ids.

```html
<selectic
    params={{
        getItemsCallback: (ids) => Promise.all(
            ids.map(id => fetch(`getItem?id=${id}`))
        ),
    }}
    options={optionList}
/>
```

## pageSize

Type: `number`

`pageSize` is the number of options requested in dynamic mode when selectic needs to display more options than it has in cache.

By changing this value you can optimize performance result (more or less requests vs memory cache consumption).

Read [the dynamic documentation](dynamic.md) for more information.

Selectic displays 10 options at a time, but it will call for a new request as soon as the last option index reach the half of page size.

_`pageSize` default value is `100`._

```html
<selectic
    params={{
        pageSize: 500,
    }}
    options={optionList}
/>
```

## allowRevert

Type: `boolean` | `undefined`

In _multiple_ mode, it is possible to invert the selection.
However in _dynamic_ mode selectic does not know all options so it cannot select the opposite selections.

To allow this feature in _dynamic_ mode, there is a property `selectionIsExcluded` which means that values returned by `getValue()`, `getSelection()` or emitted events are the ones which are not selected.

As this behavior is more complex, it is needed to set `allowRevert` to `true` to enable it.

Read [the dynamic documentation](dynamic.md) for more information.

If `allowRevert` is set to `false`, the action to invert the selection will always be disabled.

If `allowRevert` is set to `true`, the action to invert the selection will always be enabled. The parent of selectic component should support `selectionIsExcluded` property (which can be applied in _dynamic_ mode).

If `allowRevert` is set to `undefined` (is not set), the action to invert the selection will be enabled only if the `selectionIsExcluded` property is not needed (always in _static_ mode, and in _dynamic_ mode when all options are already fetched).

Read [the extended properties documentation](extendedProperties.md) for more information about `selectionIsExcluded`.

```html
<selectic
    params={{
        allowRevert: true,
    }}
    options={optionList}
/>
```

## listPosition

Type: `'auto' | 'bottom' | 'top`

Default value: `'auto'`

`listPosition` defines where the list should be displayed (at top or at bottom of the select button).

With the `'auto'` value it displays the list at bottom, but if there is not enought space (the select is at bottom of the page). It displays the list at top instead.

```html
<selectic
    params={{
        listPosition: 'top',
    }}
    options={optionList}
/>
```
