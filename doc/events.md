# Events

[Back to documentation index](main.md)

Selectic component emits some events that can be caught by the parent.

## input

An event _input_ is emited each time user select another option.

This event is emited even if the list doesn't close (like in _multiple_ mode).

Any changes on **value** will also trigger this event.

2 arguments are sent with the event:
* The selection which is the id of the selected option or an array of id in _multiple_ mode.
* The current state of `selectionIsExcluded` which can be `true` in _dynamic_ and _multiple_ mode if `allowRevert` is set to `true` [(read more about dynamic mode)](dynamic.md).

## change

An event _change_ is emited when list is closing and selection has changed.

If changes are done on **value** and selectic is closed, the event will also be emited.

2 arguments are sent with the event (which are the same as in _input_ event):
* The selection which is the id of the selected option or an array of id in _multiple_ mode.
* The current state of `selectionIsExcluded` which can be `true` in _dynamic_ and _multiple_ mode if `allowRevert` is set to `true` [(read more about dynamic mode)](dynamic.md).
