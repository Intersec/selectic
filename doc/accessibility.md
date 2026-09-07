# Accessibility

[Back to documentation index](main.md)

Selectic implements the WAI-ARIA
[select-only combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/):
the component is announced as a *combobox* which opens a *listbox*, and it
can be used with a keyboard only. This page describes what is supported,
and what remains under the responsibility of the host application.

## Semantic (what screen readers announce)

* The visible element is a `combobox`. It announces its label (see
  [Naming the component](#naming-the-component)), the current selection
  (as displayed texts), and its expanded/collapsed state.
* The list of options is a `listbox`. Each option announces its state
  (`aria-selected`, `aria-disabled`) and its real position in the list
  (`aria-setsize`/`aria-posinset`): even if Selectic only renders a slice
  of a very long list (virtual scroll), screen readers announce
  "option 1234 of 100000".
* Group headers are selectable options (clicking or pressing `Enter` on
  them toggles the whole group) and are described as "group"
  (`aria-roledescription`, translatable with the `groupRoleDescription`
  text).
* The search input announces the option highlighted while navigating with
  arrow keys (`aria-activedescendant`).
* "Searching", "no data" and "no result" messages are polite live regions;
  error messages are announced immediately (`role="alert"`).
* In multiple mode, navigating through the selected items announces each
  item and how to remove it, through a visually hidden live region.
* All announced texts can be translated or replaced, see
  [changeTexts](./changeText.md).

## Keyboard support

When the component has the focus (the list opens automatically):

| Key | Action |
| --- | ------ |
| `ArrowDown` / `ArrowUp` | Move to the next / previous option |
| `PageDown` / `PageUp` | Move one page (10 options) forward / backward |
| `Home` / `End` | Move to the first / last option (when the search input is empty) |
| `Enter` | Select the highlighted option (on a group header, toggle the whole group) |
| `Space` | Select the highlighted option, like `Enter`, while the search input is empty. It types a space instead as soon as the search contains some text, or while a typeahead text is being typed |
| `Escape` | Close the list. The focus stays on the component: `ArrowDown`, `ArrowUp`, `Enter` or `Space` reopen it |
| `Tab` / `Shift+Tab` | Reach the buttons of the open panel (clear search, footer), then leave the component (which closes the list) |
| printable characters | Type in the search input. When the search filter is hidden (`hideFilter`), *typeahead*: jump to the next option starting with the typed text |

### Why `Space` does not always type a space

The search input is an editable combobox: strictly following the ARIA
APG, every printable character — a space included — belongs to the text
field, and only `Enter` selects. Selectic departs from it on a single
point: **while the search input is empty**, `Space` selects the
highlighted option, like a native `<select>` does. It is the expected
gesture after having moved with the arrows, and nothing is lost since
there is no text to complete yet.

As soon as the user has typed something, the search input takes the key
back, so an expression made of several words stays searchable. `Home`
and `End` follow the very same rule.

Like in a native `<select>`, disabled options are skipped by the keyboard
navigation (they are still read in the list by screen readers).

In multiple mode, when the search input is empty:

| Key | Action |
| --- | ------ |
| `ArrowLeft` / `ArrowRight` | Cycle through the selected items ("chips"), in both directions, with a "no active chip" step between the last and the first one |
| `Delete` / `Backspace` | Remove the active selected item (a first `Backspace` only highlights the last one) |

In single mode, when `allowClearSelection` is enabled, `Delete` clears the
current selection.

When the list closes, the focus goes back to the combobox element.

## Multilines mode

With the `multilines` property, the list is always displayed, so there is
no main input and no expanded/collapsed state to announce. The search
input keeps the `combobox` role driving the listbox (with a permanent
`aria-expanded="true"`, which matches what the user sees), and the same
announcements as in the dropdown mode; with `hideFilter` there is no
combobox at all: the listbox itself takes the focus and carries
`aria-activedescendant`. The keyboard support is the same as above,
except `Escape` (nothing to close) and the chips navigation (selected
options are visible in the list).

The component reports entering and leaving with the `focus` and `blur`
events. Moving the focus between the search input, the options and the
footer buttons stays inside the component and emits nothing. Clicking an
option does not always move the DOM focus (Firefox and Safari do not focus
every element on click), so the pointer is watched as well: interacting
with the list is never reported as a blur. See
[the events of the mode](extendedProperties.md#events).

## Footer

The footer actions (displayed in multiple mode, or with the `footer`
property) are native buttons, reachable with `Tab`. "Select all" and
"Invert selection" are toggles: their state is announced either by their
label which describes the opposite action (like the default "Select all"
/ "Unselect all"), or by `aria-pressed` when their label is static (a
custom `text` without `textActive`).

## Naming the component

The accessible name is under the responsibility of the host application.
Associate a `<label>` to the component through the `id` property:

```html
<label for="my-select">Country</label>
<selectic id="my-select" :options="countries" />
```

The label is automatically linked to the visible combobox element
(`aria-labelledby`), and clicking on it gives the focus to the component.
Without such a label, screen readers announce an unnamed combobox.

## Notes and limitations

* The options list is attached to `document.body` (to avoid overflow
  issues). The link with the component is done with `aria-controls`, but
  inside an `aria-modal="true"` dialog some screen readers may ignore
  content outside of the dialog.
* In dropdown mode two elements carry the `combobox` role: the main
  input, which is the tab stop and announces the selection, and the
  search input of the open panel, which announces what is typed and
  which option is active. This is a deliberate compromise: the panel is
  attached to the body, so it cannot be a child of the main input, and
  each of the two needs to be announced on its own. Both point at the
  same listbox through `aria-controls`.
* The default theme focus indicator uses the
  `--selectic-focus-outline-color` CSS variable, see [css](./css.md).
  If you customize colors, keep a sufficient contrast (WCAG 1.4.11).

## Conventions (for contributors)

Any evolution of the component should preserve these rules:

* every interactive element has an accessible name, coming from the
  `labels` dictionary (overridable with `texts`/`changeTexts`);
* decorative icons are hidden to assistive technologies: this is the
  default behavior of the `Icon` component (an icon with a `title`
  becomes a labelled image, an explicit `aria-hidden` always wins);
* a state expressed by a CSS class only is invisible to screen readers:
  it must also be an `aria-*` attribute (or a live region for transient
  information);
* DOM ids use the `selectic-{uid}-*` scheme (see `listBoxId`/`optionId`
  in the Store) to stay unique in the page;
* mouse-only controls need a keyboard equivalent;
* the rendered ARIA attributes are covered by `test/Selectic/aria.spec.js`
  and the keyboard behaviors by `test/Store/keyboard.spec.js`.
