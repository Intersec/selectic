# API Methods

[Back to documentation index](main.md)

For some projects, it is easier to interact with components by API rather than props/emit. This is the main purpose of these API.

All these methods should be called directly on the component instance.

## clearCache

`clearCache(forceReset: boolean = false) => void`

Whole cache in selectic are cleared, and so all options are refetched.
This method is mainly useful in _dynamic_ mode when data should be completely changed (due to some context change).

If `forceReset` is set to `true`, the current selection is also cleared. Otherwise it keeps previous selection.

## changeTexts

`changeTexts(texts: Object) => void`

This method allows to change any texts used in the component.

[More details about how to change texts in selectic](changeText.md).

## getValue

`getValue() => id | id[]`

This method returns the ids of current selected options.

It returns a single id when not in _multiple_ mode, and an array of id in _multiple_ mode.

## getSelectedItems

`getSelectedItems() => option | option[]`

This method returns the current selected options (which includes all information related to the option).

## isEmpty

`isEmpty() => boolean`

This method checks if there is a selection.

It returns `false` if there are no selected options and `true` if there is at least one selected option.

## toggleOpen

`toggleOpen(open?: boolean) => boolean`

This methods force the "open" state of the component.

if `open` is not set, it toggles the current state.

It returns the final state.
Keep in mind that the state can be changed immediatley afterward by automatic settings (like [autoDisabled](params.md#autoDisabled)).
