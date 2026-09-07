# Breaking changes

[Back to documentation index](main.md)

This document is mainly for users which had projects with oldest Selectic
version which want to upgrade them to latest version.

**This is not something you have to read to understand and to use Selectic.**

## 3.4.x → 3.5.x

### The filter panel is no more collapsible

The search input used to live in a panel which could be folded behind a
handler. That handler has been removed: the search input is now always
part of the list panel, next to the footer actions.

The only visible consequence is the `hideFilter: 'open'` value, which
used to unfold that panel. It is kept as an alias of `false` (the search
input is always displayed), so existing code keeps working, but it does
not do anything specific anymore.

For the same reason, the `keepFilterOpen` attribute of the store state
does not exist anymore.

Read [the documentation of `hideFilter`](./params.md#hidefilter) for more
information.

### Renamed message keys

The footer labels are now prefixed with `footer`, so that they can be
told apart from the labels of the main input:

| Removed key     | New key                 |
| --------------- | ----------------------- |
| `selectAll`     | `footerSelectAll`       |
| `excludeResult` | `footerInvertSelection` |

`changeTexts()` ignores the keys it does not know, so a project which
still sets the old ones does not crash: its translations are silently
dropped and the default English labels are displayed instead. TypeScript
projects get a compilation error, which is the intended warning.

Read [the documentation about changing texts](./changeText.md) for the
complete list of the available keys.

## 3.0.x → 3.1.x

Selectic no more depends on Font-awesome. It embeds its own icons (from Material
Design Icons).

It is still possible to use Font-awesome icons (or from any other libraries).

Read [the documentation section related to changing icons](./changeIcons.md) for
more information on how to handle them.

## 1.3.x → 3.x

### Vue2 → Vue3

Selectic 3.x uses Vue3 instead of Vue2. The library should be changed and may
impact the whole project.

You should read [Vue3 migration strategy](https://v3.vuejs.org/guide/migration/introduction.html)
to see all implications.

### Events listener

The argument given when events are emitted have been changed.

For example to listen to a `change` event with Selectic 1.3.x you could write
something like:

```
<Selectic @change="(id, isExcluded, instance) => ..."></Selectic>
```

With Selectic 3.x you should write:

```
<Selectic @change="(id, information) => ..."></Selectic>
```

where `information` contains all options related to the event.
```
{
    instance: selecticInstance,
    eventType: 'change';
    automatic: false,
    isExcluded: false,
}
```
An object rather than severals arguments is much better because it is much
more robust to further changes.

[Read more about the events in the dedicated section](events.md).

### `<option>` slots

It is currently no more possible to use `<option>` slots in Selectic.

We can hope that a solution will be found soon, but currently only the static
and dynamic mode are available.
