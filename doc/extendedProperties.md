# Properties

[Back to documentation index](main.md)

[List of all properties](properties.md)

Selectic supports common properties which are related to `<select>` element ([read dom properties document](domProperties.md)), but they are some more which are more related to the nature of selectic.

* [groups](extendedProperties.md#groups)
* [noCache](extendedProperties.md#nocache)
* [open](extendedProperties.md#open)
* [options](extendedProperties.md#options)
* [selectionIsExcluded](extendedProperties.md#selectionisexcluded)
* [texts](extendedProperties.md#texts)
* [params](extendedProperties.md#params)
    * [allowClearSelection](params.md#allowclearselection)
    * [allowRevert](params.md#allowrevert)
    * [autoDisabled](params.md#autodisabled)
    * [autoSelect](params.md#autoselect)
    * [emptyValue](params.md#emptyvalue)
    * [fetchCallback](params.md#fetchcallback)
    * [forceSelectAll](params.md#forceselectall)
    * [formatOption](params.md#formatoption)
    * [formatSelection](params.md#formatselection)
    * [getItemsCallback](params.md#getitemscallback)
    * [hideFilter](params.md#hidefilter)
    * [keepOpenWithOtherSelectic](params.md#keepopenwithotherselectic)
    * [listPosition](params.md#listposition)
    * [optionBehavior](params.md#optionbehavior)
    * [pageSize](params.md#pagesize)
    * [selectionOverflow](params.md#selectionoverflow)
    * [strictValue](params.md#strictvalue)


## groups

Type: `Option[]`

Default: `[]`

This property list options which should contains other options.

It is required to fill this property only in _dynamic_ mode in order to know to which group their property `group` refers.

```html
<selectic
    :groups="[{
        id: 'g1',
        text: 'The first group',
    }, {
        id: 'g2',
        text: 'The second group',
    }]"
/>
```

## noCache

Type: `Boolean`

Default: `false`

If `noCache` is set to `true`, the dynamic cache is cleared each time the list is opening. This means that selectic has to re-fetch options every time.

This is useful when we want up to date options from backend.

This attribute has effects only in ([dynamic mode](dynamic.md)).

```html
<selectic
    :params="{
        fetchCallback: fetchData,
    }"
    noCache
/>
```

## open

Type: `boolean`

Default: `false`

If `open` is set to `true`, the selectic component will open (if closed).
If `open` is set to `false`, the selectic component will close (if opened).

This allows to force the selectic to a given state. The state may be changed due to other user actions (like selecting a value which close the component). Then to re-open the component this attribute should be reset to `false` and then to `true`.

It also allows to start in an open state.

This attribute purpose is to change the state programmatically. To keep state unchanged there are several other attributes ([disabled](extendedProperties.md#disabled), [keepOpenWithOtherSelectic](params.md#keepOpenWithOtherSelectic), ...).
The current state can be updated with the [open](events.md#open) and [close](events.md#close) events.

It is also possible to change the "open" state with the method [toggleOpen](methods.md#toggleOpen).

```html
<selectic
    :options="optionList"
    open
/>
```

## options

Type: `Option[]`

Default: `[]`

This property is to list all options available ([read how to build a list](list.md)).

This property can be omitted in dynamic mode ([read how to build dynamic list](dynamic.md)).

## selectionIsExcluded

Type: `boolean`

Default: `false`

It should be only used in _multiple_ mode.

If it is set to `true`, it means that current `value` are options which are **not** selected.

It is useful with _dynamic_ mode where it is not possible to fetch all options.

This value can be changed automatically by selectic if all options are fetched.

```html
<selectic
    :options="['item1', 'item2']"
    value="item2"
    selectionIsExcluded
/>
```

## texts

Type: `Object`

Default: `{}`

The `texts` property is to change texts in the component.

It is possible to change all texts or only some.

It changes the texts only for this component. To change texts for all selectic components, you should use the static method `changeTexts()`.

[Read the documentation about changing text](changeText.md).

```html
<selectic
    :options="['Goldfish', 'Salmon', 'Trout', 'Tuna']"
    value="Tuna"
    :texts="{
        searchPlaceholder: 'Search for fish',
        noResult: 'No fish matched your search',
    }"
/>
```

## params

Type: `Object`

This is a property for advanced configuration. Properties set in `params` should not change during the life time of a selectic component.

[Read the advanced configuration documentation](params.md) to know more about the `params` property.
