# Change CSS style

[Back to documentation index](main.md)

Selectic comes with its own style. But this style may not fit your theme.
So some CSS variable can be reset to fit what you want.

By using CSS variable, you are sure to not break the Selectic behavior and you
don't have to know which are the Selectic elements' class name.


## How the style is delivered

There are two builds, and the only difference between them is the style:

* `selectic` (the default one) injects its style when it is imported. The
  style is then added after the style sheets of the application, so the
  rules of the application need a higher specificity to override it, and
  the page needs `style-src 'unsafe-inline'` with a strict CSP.

* `selectic/dist/selectic.nostyle.esm.js` (and its `.common.js` flavor)
  comes without any style: `dist/selectic.css` is imported separately, and
  the application decides where it lands in the cascade.

```js
import Selectic from 'selectic/dist/selectic.nostyle.esm.js';
import 'selectic/dist/selectic.css';
```

Import one or the other, not both: the rules would be loaded twice.


## Simple examples

```css
.selectic {
    --selectic-color: lightblue;
    --selectic-bg: black;
}
```

It is possible to change styles only for components which are in some area:

```css
body {
    --selectic-color: grey;
    --selectic-active-item-color: purple;
}
.selectic.gold {
    --selectic-color: black;
    --selectic-bg: gold;
    --selectic-panel-bg: lightyellow;
    --selectic-active-item-color: gold;
}
```


## Variables

### Generic

* **--selectic-font-size** _(default: `14px`)_: Size of all text in the
  component.

* **--selectic-cursor-disabled** _(default: `not-allowed`)_: Cursor type to
  display when an element (the component or an item) is disabled.

### The main element

* **--selectic-color** _(default: `#555555`)_: Color of texts.

* **--selectic-bg** _(default: `#ffffff`)_: Background color of the main
  element.

* **--selectic-color-disabled** _(default: `#787878`)_: Text color when
  component is disabled.

* **--selectic-bg-disabled** _(default: `#eeeeee`)_: Background color when
  component is disabled.

* **--selectic-value-bg** _(default: `#f0f0f0`)_: Background color of displayed
  selection (in multiple mode).

* **--selectic-more-items-color** _(default: `var(--selectic-info-color)`)_:
  Text color of the "more item" element.

* **--selectic-more-items-bg** _(default: `var(--selectic-info-bg)`)_:
  Background color of the "more item" element.

* **--selectic-more-items-bg-disabled** _(default: `#cccccc`)_: Background color
  of the "more item" element when component is disabled.

### The list

* **--selectic-panel-bg** _(default: `#f0f0f0`)_: Background color of the list.

* **--selectic-separator-bordercolor** _(default: `#cccccc`)_: Color of the
  separation between the list and the action menu.

* **--selectic-item-color** _(default: `var(--selectic-color)`)_: Text color of
  items (if different of the main color).

* **--selectic-selected-item-color** _(default: `#428bca`)_: Text color of
  selected items.

* **--selectic-active-item-color** _(default: `#ffffff`)_: Text color of items
  where cursor is over or the active by the arrow keys.

* **--selectic-active-item-bg** _(default: `#66afe9`)_: Background color of
  items where cursor is over or the active by the arrow keys.

* **--selectic-input-height** _(default: `30px`)_: The height of the main
  element.<br>
**:warning: It does not size the items of the list anymore: they follow the
[itemHeight](params.md#itemheight) parameter, which is published as
`--selectic-item-height` on the list itself. Changing this variable alone
leaves the rows at their height.**

* **--selectic-item-height** _(default: `calc(var(--selectic-input-height) -
3px)`)_: The height of each item of the list.<br>
**:warning: This variable is set from the
[itemHeight](params.md#itemheight) parameter, which is the way to change it:
the virtual scroll relies on the same value. Setting it from CSS moves the
rows without moving the scroll computations.**

### Options

* **--selectic-option-image-size** _(default: `1.5em`)_: Size of the square
  box displaying the image of an option (an `icon` prefixed with `img:`).

* **--selectic-option-image-radius** _(default: `3px`)_: Border radius of that
  box. Set it to `50%` for round avatars.

### Messages

* **--selectic-info-color** _(default: `#ffffff`)_: Text color of information
  messages (like "No results").

* **--selectic-info-bg** _(default: `#5bc0de`)_: Background color of information
  messages (like "No results").

* **--selectic-error-color** _(default: `#ffffff`)_: Text color of information
  messages (like when fetch is failing).

* **--selectic-error-bg** _(default: `#b72c29`)_: Background color of error
  messages (like when fetch is failing).

### Footer bar

The footer bar is displayed under the options list, in both the dropdown and the
[multilines](extendedProperties.md#multilines) modes.

* **--selectic-footer-bg** _(default: `#f1f1f1`)_: Background color of the
  footer bar.

* **--selectic-footer-gap** _(default: `24px`)_: Space kept between the left,
  center and right groups of buttons.

* **--selectic-footer-height** _(default: `40px`)_: Minimum height of the footer
  bar.

* **--selectic-footer-link-color** _(default: `#335895`)_: Text color of the
  left-side links (_Select all_, _Invert selection_, _Show selection_, _Clear
  selection_).

* **--selectic-footer-btn-secondary-bg** _(default: `#ffffff`)_: Background
  color of the secondary button (_Clear filter_).

* **--selectic-footer-btn-secondary-border** _(default: `#cccccc`)_: Border
  color of the secondary button.

* **--selectic-footer-btn-secondary-color** _(default: `#333333`)_: Text color
  of the secondary button.

* **--selectic-footer-btn-primary-bg** _(default: `#335895`)_: Background color
  of the primary button (_Apply_).

* **--selectic-footer-btn-primary-border** _(default: `#2d4d86`)_: Border color
  of the primary button.

* **--selectic-footer-btn-primary-color** _(default: `#ffffff`)_: Text color of
  the primary button.

### Accessibility

* **--selectic-focus-outline-color** _(default: `#66afe9`)_: Color of the
  keyboard focus indicator (outline of the focused element and of the active
  selected item in multiple mode).
