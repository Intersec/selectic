# Breaking changes

[Back to documentation index](main.md)

This document is mainly for users which had projects with oldest Selectic
version which want to upgrade them to latest version.

**This is not something you have to read to understand and to use Selectic.**

## 1.3.x → 3.x

### Vue2 → Vue3

Selectic 3.x uses Vue3 instead of Vue2. The library should be changed and may
impact the whole project.

You should read [Vue3 migration strategy](https://v3.vuejs.org/guide/migration/introduction.html)
to see all implications.

### Events listener

The argument given when events are emitted have been changed.

For example to listen to a `change` event with Selectic 1.3.x you could write something like:

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
