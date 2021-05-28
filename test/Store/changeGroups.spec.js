const _ = require('../tools.js');
const {
    getGroups,
} = require('../helper.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('changeGroups()', (sTest) => {
    sTest.test('should update "groups"', (t) => {
        const store = new Store({
            groups: [{
                id: '1st group',
                text: 'First group',
            }],
        });

        store.changeGroups(getGroups(5));

        t.is(store.state.groups.size, 5);

        store.changeGroups(getGroups(2));

        t.is(store.state.groups.size, 2);

        t.end();
    });
});
