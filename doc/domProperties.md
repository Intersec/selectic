# DOM properties

[Back to documentation index](main.md)

[List of all properties](properties.md)

`<select>` has several properties which can be used in the same way in `selectic`.

* [className](domProperties.md#classname) (instead of `class` in order to be
applied on main element and on the list element)
* [disabled](domProperties.md#disabled)
* [id](domProperties.md#id)
* [multiple](domProperties.md#multiple)
* [placeholder](domProperties.md#placeholder)
* [title](domProperties.md#title)
* [value](domProperties.md#value)

[Not supported attributes](domProperties.md#not-supported-attributes)

## className

Type: `string`

Default: `''`

The given string will be applied as class to the main element and also to the list element.
It can be used instead of class for when it is not possible to use the reserved keyword.
Note that it will be applied to the inner list element too.

```html
<selectic
    :options="['item1', 'item2']"
    value="item2"
    className="my-custom-class another-class"
/>
```

## disabled

Type: `boolean`

Default: `false`

When disabled is set, `selectic` cannot be open nor changed.

```html
<selectic
    :options="['item1', 'item2']"
    disabled
/>
```

## id

Type: `string`

Default: `''`

It defines a unique identifier (ID) which must be unique in the whole document. It is applied on an `<input>` element which contains the current state.

```html
<selectic
    :options="['item1', 'item2']"
    value="item2"
    id="example"
/>
```
```javascript
document.getElementById('example').value; // 'item2'
```

## multiple

Type: `boolean`

Default: `false`

If set then several options can be selected.

The `value` will be an array.

```html
<selectic
    :options="['item1', 'item2', 'item3']"
    multiple
/>
```

## placeholder

Type: `string`

Default: `''`

`placeholder` is not really a DOM attribute as it doesn't exist on `<select>` element. But it behaves like placeholder on `<input>`.

It displays the given text if no option is selected.

```html
<selectic
    :options="['item1', 'item2', 'item3']"
    placeholder="choose an item"
/>
```

## title

Type: `string`

Default: `''`

It is added to the main element, and it behaves like `title` attribute of any HTML element when mouse is over the selected area.

```html
<selectic
    :options="['item1', 'item2', 'item3']"
    title="An information about this component"
/>
```

## value

Type: `optionId` or `optionId[]`

Default: `null` or `[]`

The selected value.  This is the initial value, and it can be altered to change the current selection.

This is the id of the selected option or an array of id (if `multiple` is set).

```html
<selectic
    :options="['item1', 'item2']"
    value="item2"
/>
```

# Not supported attributes

These attributes are currently not supported:

* autocomplete
* autofocus
* form
* name
* required
* size
* readonly
