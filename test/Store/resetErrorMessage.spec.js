/**************************************************************************/
/*                                                                        */
/*  Copyright (C) INTERSEC SA                                             */
/*                                                                        */
/*  Should you receive a copy of this source code, you must check you     */
/*  have a proper, written authorization of INTERSEC to hold it. If you   */
/*  don't have such an authorization, you must DELETE all source code     */
/*  files in your possession, and inform INTERSEC of the fact you obtain  */
/*  these files. Should you not comply to these terms, you can be         */
/*  prosecuted in the extent permitted by applicable law.                 */
/*                                                                        */
/**************************************************************************/

const _ = require('../tools.js');
const tape = require('tape');
const StoreFile = require('../dist/Store.js');
const Store = StoreFile.default;

tape.test('resetErrorMessage()', (sTest) => {
    sTest.test('should reset the status of error message', (t) => {
        const store = new Store();

        store.state.status.errorMessage = 'An error';

        store.resetErrorMessage();

        t.is(store.state.status.errorMessage, '');
        t.end();
    });
});
