# Properties

[Back to documentation index](main.md)

[List of all properties](properties.md)

Selectic supports common properties which are related to `<select>` element ([read dom properties document](domProperties.md)), but they are some more which are more related to the nature of selectic.

* [footer](extendedProperties.md#footer)
* [groups](extendedProperties.md#groups)
* [multilines](extendedProperties.md#multilines)
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


## footer

Type: `FooterConfig`

Default: `undefined`

When this property is set (even as an empty object `{}`), a footer bar is displayed under the options list, with up to four buttons. Each entry configures one button; a missing entry hides that button.

In _multiple_ mode, the footer is displayed even without this property: _Select all_ and _Invert selection_ are enabled by default (the two other buttons remain opt-in).

```typescript
interface FooterConfig {
    selectAll?: FooterButtonConfig;
    invertSelection?: FooterButtonConfig;
    clearFilter?: FooterButtonConfig;
    apply?: FooterButtonConfig;
}

interface FooterButtonConfig {
    /* If false, the button is not rendered. Default: true. */
    visible?: boolean;

    /* Override the default label (which comes from `texts`). */
    text?: string;

    /* Override the label displayed in the "active" state (all items
     * selected for selectAll, selection excluded for invertSelection). */
    textActive?: string;

    /* If true, the button is disabled. */
    disabled?: boolean;

    /* Optional tooltip. */
    title?: string;
}
```

_Select all_ and _Invert selection_ have a built-in behavior (the same as the former filter panel checkboxes) and are automatically hidden or disabled when the current mode cannot support them (single mode, partial data, ...). When all items are selected, the _Select all_ label becomes `footerUnselectAll`. _Clear filter_ and _Apply_ have no built-in behavior: they only emit their event.

Each click also emits the corresponding event ([footer:selectAll, footer:invertSelection, footer:clearFilter, footer:apply](events.md#footer-buttons-events)).

The default labels can be replaced with [texts](changeText.md) (`footerSelectAll`, `footerUnselectAll`, `footerInvertSelection`, `footerClearFilter`, `footerApply`).

```html
<selectic
    :options="optionList"
    multiple
    :footer="{
        selectAll: {},
        invertSelection: {},
        apply: { text: 'Ok' },
    }"
/>
```

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

## multilines

Type: `boolean | number`

Default: `false`

If `true`, Selectic renders its content inline (search input + options list, always visible) instead of the input-with-dropdown layout. There is no main input anymore: the selection is visible through the selected state of the options.

A **number** switches the mode on as well, and sets how many options the inline list displays at once before scrolling: `:multilines="5"` is a shortcut for `multilines` + [`displayedItems: 5`](params.md#displayedItems). The same rules apply: the value is an order of magnitude rather than an exact count, and the minimum is `2` (any smaller value is raised to `2`). `0` and `false` both keep the dropdown layout.

When [`params.displayedItems`](params.md#displayedItems) is given too, it takes precedence: it is the dedicated parameter, so `:multilines="5" :params="{ displayedItems: 20 }"` displays 20 options.

The component root gets the `selectic--multilines` class. When placed inside a flex container, the list fills the available height and scrolls internally instead of growing unbounded.

### Events

The list is always displayed: there is no opening nor closing, so
[open](events.md#open) and [close](events.md#close) are not emitted in this
mode, and [change](events.md#change) is not deferred — it is emitted with
every [input](events.md#input), like a native `<select multiple size="N">`
does. A consumer listening only to `@change` is notified of every
modification.

[focus](events.md#focus) and [blur](events.md#blur) report the user
entering and leaving the component. They are not emitted while the focus
moves between the search input, the options and the footer buttons; and
since clicking an option does not always move the DOM focus (Firefox and
Safari do not focus every element on click), the pointer is watched too, so
that interacting with the list is never reported as a blur.

The [custom](slots.md#custom) slot allows adding content under the options list in this mode. The [footer](extendedProperties.md#footer) property and the [listFooter](slots.md#listFooter) slot are also supported.

See also the [accessibility page](accessibility.md#multilines-mode) for the keyboard and screen reader behavior in this mode.

```html
<!-- inline list, sized by displayedItems (10 options by default) -->
<selectic
    :options="optionList"
    multiple
    multilines
/>
```

```html
<!-- inline list displaying 5 options at once -->
<selectic
    :options="optionList"
    multiple
    :multilines="5"
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
