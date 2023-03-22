# Dynamic mode

[Back to documentation index](main.md)

The dynamic mode allows to load options dynamically (from a server or from anything else asynchronously).
The list of options will be built when selectic is open. It fetches the first options and fetch the following ones when it is needed.
It keeps result in cache to avoid re-fetching when selectic is open another time.

## Basic usage

There are 2 attributes to set: **fetchCallback** and **getItemsCallback**.
They are both callbacks which should return a promise. Promises should resolve with an array of options ([see list options](./list.md) to know all possible values to configure them).

These attributes are part of the `params` property ([see more information](params.md) about this property).

### fetchCallback

Its purpose is to return the list of options to display in the list with all available options.

There are 3 arguments:

* **search** (`string`): Only options which match the given pattern should be returned. It is up to you to handle wildcard character such as "`*`". By default this argument is worth `''` (empty string), in such case it should return all available options.
* **offsetItem** (`number`): Only options from this index should be returned.
* **pageSize** (`number`): The maximum number of options to be returned.

The return should be a promise which resolves with an object containing 2 attributes:

* **total** (`number`): The total number of options that can be fetched (depending on the search). This information is important to display the correct length of the scroll bar and to let selectic know if there are more options to fetch.
* **result** (`Options[]`): The list of options which match the request.

### getItemsCallback

This callback should return option information from an id list.
This is used to display correctly the initial selected options.

There is only one argument:

* ids (`OptionId[]`): list of options id.

The return should be a promise which resolve with an array of `Options`.

### Example

```javascript
const items = Array.from(new Array(100)).map((v, idx) => buildItem(idx));


function listItems(search, offset, limit) {
    const searchedItems = items.filter(item => {
        if (search === '') {
            return true;
        }
        return item.text.includes(search);
    });

    return new Promise((resolve, reject) => {
        setTimeout(() => resolve({
            total: searchedItems.length,
            result: searchedItems.slice(offset, offset + limit),
        }), 500);
    });
}

function getItems(ids) {
    return Promise.resolve(ids.map(id => items[id]));
}

function buildItem(id) {
    return {
        id: id,
        text: `choose item ${id + 1}`,
    };
}
```

```html
<selectic
    :value="5"
    :params="{
        fetchCallback: listItems,
        getItemsCallback: getItems,
    }"
/>
```

Of course, the promises can be `fetch()` method.

## reseting cache

Sometimes it is useful to reset cache when we want a complete different list (because another parameter has changed).
To remove the cache, you should call the method `clearCache()`.

```javascript
this.refs.selectic.clearCache();
```

If you want also to reset the current selection and any string in the search, you can add `true` as argument.

```javascript
this.refs.selectic.clearCache(true);
```

## usage with multiple

It works with the multiple attribute. There is nothing more to do.

## Exclude selection

In _multiple_ mode, selectic offers the possibility to invert the selection (which can be useful to unselect only some options in a very huge list).
With _dynamic_ options, selectic will not fetch the whole options. So in such case it will set the flag `selectionIsExcluded` which means that all options which are in `value` are the ones which are not selected.
This up to you to handle this flag. ([Read more information](events.md) about events).

If you don't want to activate this feature, then you could set the `allowRevert` attribute in `params` property to `false` ([see more information](params.md) about `params` property).

```html
<selectic
    multiple
    :params="{
        fetchCallback: fetchCallback,
        getItemsCallback: getItemsCallback,
        allowRevert: false,
    }"
/>
```

## Usage with groups

In order to keep pagination working well, it is required to not count the parent group option in the total and to not send them in the result.
The list of all groups should be provided in the `groups` property and child option should set their `group` attribute to the corresponding id.

```html
<selectic
    :groups="[{
        id: 'group 1',
        text: 'This is the first group',
    }, {
        id: 'group 2',
        text: 'This is the second group',
    }]"
    :params="{
        fetchCallback: fetchCallback,
        getItemsCallback: getItemsCallback,
    }"
/>
```

example of result that can be returned:
```json
[{
    "id": "item1",
    "text": "my first item",
    "group": "group 1"
}, {
    "id": "item2",
    "text": "my second item",
    "group": "group 1"
}, {
    "id": "item3",
    "text": "1st item in second group",
    "group": "group 2"
}, {
    "id": "item4",
    "text": "2nd item in second group",
    "group": "group 2"
}]
```

_We hope to improve this behavior as soon as possible to support group directly inside the result._
