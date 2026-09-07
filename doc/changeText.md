# Change texts

[Back to documentation index](main.md)

There are some texts in selectic. But sometimes it is useful to change them (because you want to translate them or to be more precise for the context usage).

There are 3 ways to changes these texts:
* Call the static `changeTexts()` method. It changes texts for all selectic components.
* Change the `texts` property. It changes texts only for the component.
* Call the `changeTexts()` method on the component. It changes texts only for the component.

_Changes made locally take precedence over changes made globally._.

Changing texts on the component with property or with `changeTexts()` are equivalent.

They accept the same argument: an object which contains keys of sentences.

It is possible to replace only some sentences.

## Keys

* **noFetchMethod**: This is an error message which is displayed if some options are missing and `fetchCallback` is not defined. _Default value is `'Fetch callback is missing: it is not possible to retrieve data.'`_.

* **searchPlaceholder**: This is the message in the input placeholder to search for options. _Default value is `'Search'`_.

* **clearSearch**: This is the accessible name (and the tooltip) of the button which empties the search input. It is displayed in place of the magnifier as soon as a search text is typed. _Default value is `'Clear the search'`_.

* **searching**: This is an information message displayed in options when it is not fetched yet._Default value is `'Searching'`_.

* **cannotSelectAllSearchedItems**: This is an error message displayed if the action _select all_ is triggered but all options are not fetched and `allowRevert` property is not set to `true`. _Default value is `'Cannot select all items: too much items in the search result.'`_.

* **cannotSelectAllRevertItems**: This is an error message displayed when the action _select all_ cannot be applied because some options are not fetched yet. _Default value is `'Cannot select all items: some items are not fetched yet.'`_.

* **unknownPropertyValue**: This is an error message displayed when a property is given an unsupported value. `%s` is replaced with the property name. _Default value is `'property "%s" has incorrect values.'`_.

* **footerSelectAll**: The label of the _Select all_ button in the [footer](extendedProperties.md#footer). _Default value is `'Select all'`_.

* **footerUnselectAll**: The label of the _Select all_ button when all items are already selected. _Default value is `'Unselect all'`_.

* **footerInvertSelection**: The label of the _Invert selection_ button in the [footer](extendedProperties.md#footer). _Default value is `'Invert selection'`_.

* **footerShowSelection**: The label of the _Show selection_ button in the [footer](extendedProperties.md#footer), which restricts the list to the selected options. _Default value is `'Show selection'`_.

* **footerShowAll**: The label of the _Show selection_ button while the list is already restricted to the selection, to come back to the whole list. _Default value is `'Show all'`_.

* **footerClearSelection**: The label of the _Clear selection_ button, displayed in place of _Select all_ while the list is restricted to the selection. _Default value is `'Clear selection'`_.

* **showingSelection**: The message displayed while the list is restricted to the selection. `%d` is replaced with the number of selected options. _Default value is `'Showing selection (%d)'`_.

* **footerClearFilter**: The label of the _Clear filter_ button in the [footer](extendedProperties.md#footer). _Default value is `'Clear filter'`_.

* **footerApply**: The label of the _Apply_ button in the [footer](extendedProperties.md#footer). _Default value is `'Apply'`_.

* **reverseSelection**: The title displayed on icon which means that selection is inverted. _Default value is `'The displayed elements are those not selected.'`_.

* **noData**: This is an information message when there are no options. _Default value is `'No data'`_.

* **noResult**: This is an information message when there are no options which match the search. _Default value is `'No results'`_.

* **clearSelection**: This is a message displayed in title of the icon to remove the selected option from the selection list. _Default value is `'Clear current selection'`_.

* **clearSelections**: This is a message displayed in title of the icon to remove all selected options from the selection list. _Default value is `'Clear all selections'`_.

* **removeSelectedItem**: This is the message displayed in title of the icon to remove a selected option (in multiple mode), and announced to screen readers while navigating through the selected options with keyboard. `%s` is replaced by the option text. _Default value is `'Remove %s'`_.

* **groupRoleDescription**: This is how screen readers describe a group header in the options list (instead of "option"). _Default value is `'group'`_.

* **wrongFormattedData**: This is an error message displayed when result from the `fetchCallback` is not in correct format. _Default value is `'The data fetched is not correctly formatted.'`_.

* **moreSelectedItem**: This is a message displayed in a badge if there are one selected option more than the size of the component. _Default value is `'+1 other'`_.

* **moreSelectedItems**: This is a message displayed in a badge if there are more selected options than the size of the component. _Default value is `'+%d others'`_.

* **wrongQueryResult**: This is an error message displayed when result from the `fetchCallback` don't return all expected values. _Default value is `'Query did not return all results.'`_.


## Example

```javascript
// change texts for all selectic components
Selectic.changeTexts({
    noData: 'There are no options to select.',
    noResult: 'Sorry, your option is in another select.',
});

// change texts only for this instance
this.$refs.selectic.changeTexts({
    noResult: 'Sorry, search again.',
});
```

```html
<Selectic
    :texts="{
        searchPlaceholder: 'Search for specific options?',
        searching: 'Loading information about this option',
        noData: 'ouch, I forgot to fill this select',
    }"
/>
```
