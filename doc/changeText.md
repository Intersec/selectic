# Change texts

[Back to documentation index](main.md)

There are some texts in selectic. But sometimes it is useful to change them (because you want to translate them or to be more precise for the context usage).

There are 3 ways to changes these texts:
* Call the static `changeTexts()` method. It changes texts for all selectic components.
* Change the `texts` property. It changes texts only for the component.
* Call the `changeTexts()` method on the component. It changes texts only for the component.

_Changes done locally are prioritary on changes done globally_.

Changing texts on the component with property or with `changeTexts()` are equivalent.

They accept the same argument: an object which contains keys of sentences.

It is possible to replace only some sentences.

## Keys

* **noFetchMethod**: This is an error message which is displayed if some options are missing and `fetchCallback` is not defined. _Default value is `'Fetch callback is missing: it is not possible to retrieve data.'`_.

* **searchPlaceholder**: This is the message in the input placeholder to search for options. _Default value is `'Search'`_.

* **searching**: This is an information message displayed in options when it is not fetched yet._Default value is `'Searching'`_.

* **cannotSelectAllSearchedItems**: This is an error message displayed if the action _select all_ is triggered but all options are not fetched and `allowRevert` property is not set to `true`. _Default value is `'Cannot select all items: too much items in the search result.'`_.

* **selectAll**: The name of the action to _select all_ options. _Default value is `'Select all'`_.

* **excludeResult**: The name of the action to invert the selection. _Default value is `'Invert selection'`_.

* **reverseSelection**: The title displayed on icon which means that selection is inverted. _Default value is `'The displayed elements are those not selected.'`_.

* **noData**: This is an information message when there are no options. _Default value is `'No data'`_.

* **noResult**: This is an information message when there are no options which match the search. _Default value is `'No results'`_.

* **clearSelection**: This is a message displayed in title of the icon to remove the selected option from the selection list. _Default value is `'Clear current selection'`_.

* **clearSelections**: This is a message displayed in title of the icon to remove all selected options from the selection list. _Default value is `'Clear all selections'`_.

* **wrongFormattedData**: This is an error message displayed when result from the `fetchCallback` is not in correct format. _Default value is `'The data fetched is not correctly formatted.'`_.

* **moreSelectedItem**: This is a message displayed in a badge if there are one selected option more than the size of the component. _Default value is `'+1 other'`_.

* **moreSelectedItems**: This is a message displayed in a badge if there are more selected options than the size of the component. _Default value is `'+%d others'`_.


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
