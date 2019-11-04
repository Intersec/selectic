# Options

[Back to documentation index](main.md)

`options` is a props that builds the list of options. It should be an array.
content of this array can be either `string` either an `object` which define the option property.

## strings[]

In such case id and text displayed will be the same. Their id/text will be the array values.

```javascript
const items = ['item1', 'second Item'];
```

```html
<selectic
    options={items}
/>
```
## object[]

It is possible to define the `option` more precisely.

* **id** {`string | number`} _(mandatory)_: The option identifier. *It is important that it is unique among all other options*.
* **text** {`string`} _(mandatory)_: The text which is displayed to select the option or when it is selected.
* **title** {`string`}: Text displayed in `title` when cursor is over the option (default: `''`).
* **disabled** {`boolean`}: if `true` this option cannot be selected (default: `false`).
* **className** {`string`}: `class` that are applied on the option (default: `''`).
* **style** {`string`}: css style which are applied on the option (default: `''`).
* **icon** {`string`}: class names which are applied on a `<span>` before text in the option to display an icon (default: `''`).
* **options** {`options[]`}: an other list of options. The current option is considered as a group (equivalent of `optgroup`) (default: `undefined`).
* **group** {`string | number`}: If set the option is part of the given group. This property is needed only in dynamic mode if the option is part of an optgroup (default: `null`).
* **data** {`any`}: You can store any information here, it will be provided when getting selected options. _It is not used by selectic so it can be anything you want_ (default: `undefined`).

```javascript
const items = [{
    id; 1,
    text: 'item1',
}, {
    id: 2,
    text: 'not available yet',
    disabled: true,
}, {
    id: 3,
    text: 'the red option',
    style: 'background-color: red',
}];,
{
    id: 'group1',
    text: 'some amount',
    options: [{
        id: 'amount1',
        text: '1',
    }, {
        id: 'amount2',
        text: '10',
    }, {
        id: 'amount3',
        text: '100',
    }],
};
```

```html
<selectic
    options={items}
/>
```
