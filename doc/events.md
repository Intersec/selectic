# Events

[Back to documentation index](main.md)

Selectic component emits some events that can be caught by the parent.

* [input](#input)
* [change](#change)
* [item:click](#itemclick)
* [open](#open)
* [close](#close)

## input

An event _input_ is emitted each time user select another option.

This event is emitted even if the list doesn't close (like in _multiple_ mode).

Any changes on **value** will also trigger this event.

2 arguments are sent with the event:
* The selection which is the id of the selected option or an array of id in
_multiple_ mode.
* Information about the event. This is an
[`EventChangeOptions` object](#eventchangeoptions). It includes the `isExcluded`
information ([(read more about isExcluded flag)](dynamic.md#exclude-selection)).

## change

An event _change_ is emitted when list is closing and selection has changed.

If changes are done on **value** and selectic is closed, the event will also be emited.

2 arguments are sent with the event:
* The selection which is the id of the selected option or an array of id in
_multiple_ mode.
* Information about the event. This is an
[`EventChangeOptions` object](#eventchangeoptions). It includes the `isExcluded`
information ([(read more about isExcluded flag)](dynamic.md#exclude-selection)).

## item:click

An event _item:click_ is emitted when user click on a selected item in _multiple_ mode (which are displayed in the main input).

2 arguments are sent with the event:
* The id of the selected item.
* Information about the event. This is an [`EventOptions` object](#eventoptions).

## open

An event _open_ is emitted when list is opening.

1 argument is sent with the event:
* Information about the event. This is an [`EventOptions` object](#eventoptions).

## close

An event _close_ is emited when list is closing.

1 argument is sent with the event:
* Information about the event. This is an [`EventOptions` object](#eventoptions).

# Types

## EventType

This is a string of an event that can be triggered by Selectic.

Its value can be `'input' | 'change' | 'open' | 'close' | 'item:click'`

## EventOptions

This is an object with the following arguments:

* **eventType** (*[`EventType`](#eventoptions)*): The type of the triggered
event.

* **instance** (*Selectic*): A reference to the Selectic instance which had
triggered the event.

* **automatic** (*boolean*): It is worth `true` When the event is
automatically triggered by Selectic (for example like when value is
automatically selected at start).

## EventChangeOptions

This is an object with the same argument as [`EventOptions`](#eventoptions)
and the following arguments:

* **isExcluded** (*boolean*): The current state of `selectionIsExcluded` which
can be `true` in _dynamic_ and _multiple_ mode if `allowRevert` is set to
`true` [(read more about dynamic mode)](dynamic.md).
