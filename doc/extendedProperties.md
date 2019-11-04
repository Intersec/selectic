# Properties

[Back to documentation index](main.md)

Selectic supports common properties which are related to `<select>` element ([read dom properties document](domProperties.md)), but they are some more which are more related to the nature of selectic.

## value

Type: `optionId` or `optionId[]`

The selected value.  This is the initial value, and it can be altered to change the current selection.

This is the id of the selected option or an array of id (if `multiple` is set).

```html
<selectic
    options={['item1', 'item2']}
    value="item2"
/>
```

## selectionIsExcluded

Type: `boolean`

It should be only used in _multiple_ mode.

If it is set to `true`, it means that current `value` are options which are **not** selected.

It is useful with _dynamic_ mode where it is not possible to fetch all options.

This value can be changed automatically by selectic if all options are fetched.

```html
<selectic
    options={['item1', 'item2']}
    value="item2"
    selectionIsExcluded
/>
```

## options

This property is to list all options available ([read how to build a list](list.md)).

This property can be ommited in dynamic mode ([read how to build dynamic list](dynamic.md));

## groups

Type: `Option[]`

This property list options which should contains other options.

It is required to fill this property only in _dynamic_ mode in order to know to which group their property `group` refers.

```html
<selectic
    groups={[{
        id: 'g1',
        text: 'The first group',
    }, {
        id: 'g2',
        text: 'The second group',
    }]}
/>
```

## texts

Type: `Object`

The `texts` property is to change texts in the component.

It is possible to change all texts or only some.

It changes the texts only for this component. To change texts for all selectic components, you should use the static method `changeTexts()`.

[Read the documentation about changing text](changeText.md).

```html
<selectic
    options={['Goldfish', 'Salmon', 'Trout', 'Tuna']}
    value="Tuna"
    texts={{
        searchPlaceholder: 'Search for fish',
        noResult: 'No fish matched your search',
    }}
/>
```

## params

Type: `Object`

This is a property for advanced configuration. Properties set in `params` should not change during the life time of a selectic component.

[Read the advanced configuration documentation](params.md) to know more about the `params` property.
