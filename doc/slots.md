# Slots

[Back to documentation index](main.md)

Slots allow passing template fragment to a child component, and let the child component render the fragment within its own template.

* [listFooter](#listFooter)
* [custom](#custom)

## listFooter

The `listFooter` slot allows adding custom content to the bottom of the dropdown options list. It is displayed below the options.

This slot can be useful to display additional elements or information, for example a button to trigger a custom action (select all, create item, etc.).

The slot content is free. It can be any HTML or Vue component, and no constraints are enforced.

No default styling is applied to this slot. Styling is left to the user.

### Example

```javascript

const items = [{
    id: 1,
    text: 'a value',
}, {
    id: 2,
    text: 'not available yet',
    disabled: true,
}];
```

```html
<Selectic
    :options="items"
>
    <template #listFooter>
        <div class="selectic-footer">
            <button
                type="button"
                class="selectic-footer-btn"
                @click="selectAll()"
            >
                Reset
            </button>
        </div>
    </template>
</Selectic>
```

## custom

The `custom` slot is only rendered in [multilines](extendedProperties.md#multilines) mode. It allows adding custom content under the options list (before the messages and the footer).

The slot content is free. It can be any HTML or Vue component, and no constraints are enforced.

### Example

```html
<Selectic
    :options="items"
    multilines
>
    <template #custom>
        <div>
            Select your favorite items in the list above.
        </div>
    </template>
</Selectic>
```
