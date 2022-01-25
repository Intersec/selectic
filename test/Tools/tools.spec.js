const tape = require('tape');
const toolFile = require('../dist/tools.js');

const {
    assignObject,
    convertToRegExp,
    deepClone,
} = toolFile;

tape.test('assignObject()', (st) => {
    st.test('behaves like Object.assign', (tst) => {
        const deep1 = {
            dp: 1,
        };
        const deep2 = {
            dp: 2,
            other: 'value',
        };
        const obj1 = {
            a: 1,
            b: 2,
            c: false,
            deep: deep1,
        };
        const obj2 = {
            a: 3,
            c: true,
            d: false,
            deep: deep2,
            other: {
                attr: 'str',
            },
        };

        const result = assignObject(obj1, obj2);

        tst.is(result, obj1, 'should modify first argument');
        tst.deepEqual(result, {
            a: 3,
            b: 2,
            c: true,
            d: false,
            deep: {
                dp: 2,
                other: 'value',
            },
            other: {
                attr: 'str',
            },
        }, 'should merge all attributes');
        tst.is(result.deep, deep2, 'should keep references');
        tst.deepEqual(obj2, {
            a: 3,
            c: true,
            d: false,
            deep: deep2,
            other: {
                attr: 'str',
            },
        }, 'should not change second argument');
        tst.end();
    });

    st.test('accept multiple arguments', (tst) => {
        const obj1 = {
            a: 1,
            b: 2,
        };
        const obj2 = {
            a: 2,
            c: 3,
        };
        const obj3 = {
            a: 3,
            d: 4,
        };
        const obj4 = {
            a: 4,
            e: 5,
        };

        const result = assignObject(obj1, obj2, obj3, obj4);

        tst.is(result, obj1, 'should modify first argument');
        tst.deepEqual(result, {
            a: 4,
            b: 2,
            c: 3,
            d: 4,
            e: 5,
        }, 'should merge all attributes');
        tst.deepEqual(obj2, {
            a: 2,
            c: 3,
        }, 'should not change second argument');
        tst.deepEqual(obj3, {
            a: 3,
            d: 4,
        }, 'should not change third argument');
        tst.deepEqual(obj4, {
            a: 4,
            e: 5,
        }, 'should not change fourth argument');
        tst.end();
    });

    st.test('ignores undefined attributes', (tst) => {
        const obj1 = {
            a: 1, // modified by all
            b: 2, // not modified by all (undefined)
            c: 3, // obj2: undefined, modified by obj3
            d: 4, // modified by obj2, obj3: undefined
            e: 5, // not set by obj2, obj3: undefined
            f: 6, // not set by all
        };
        const obj2 = {
            a: 'a',
            b: undefined,
            c: undefined,
            d: 'd',
        };
        const obj3 = {
            a: 2,
            b: undefined,
            c: 'c',
            d: undefined,
            e: undefined,
        };

        const result = assignObject(obj1, obj2, obj3);

        tst.is(result, obj1, 'should modify first argument');
        tst.deepEqual(result, {
            a: 2,
            b: 2,
            c: 'c',
            d: 'd',
            e: 5,
            f: 6,
        }, 'should merge all attributes');
        tst.deepEqual(obj2, {
            a: 'a',
            b: undefined,
            c: undefined,
            d: 'd',
        }, 'should not change second argument');
        tst.deepEqual(obj3, {
            a: 2,
            b: undefined,
            c: 'c',
            d: undefined,
            e: undefined,
        }, 'should not change third argument');
        tst.end();
    });
});

tape.test('convertToRegExp()', (st) => {
    st.test('convert wildcard', (tst) => {
        const str = '*the search*';

        const result = convertToRegExp(str);

        tst.is(result instanceof RegExp, true, 'should create a RegExp');

        const pattern = result.source;
        const flags = result.flags;

        tst.is(pattern, '.*the search.*', 'should create wildcard sequence');
        tst.is(flags, 'i', 'should be case insensitive by default');

        tst.end();
    });
    st.test('escape special characters', (tst) => {
        const str = '\\^$.+?(){}[]|';

        const result = convertToRegExp(str);

        tst.is(result instanceof RegExp, true, 'should create a RegExp');

        const pattern = result.source;
        const flags = result.flags;

        tst.is(pattern, '\\\\\\^\\$\\.\\+\\?\\(\\)\\{\\}\\[\\]\\|', 'should escape special characters');
        tst.is(flags, 'i', 'should be case insensitive by default');

        tst.end();
    });

    st.test('allow RegExp flags', (tst) => {
        const str = 'file*.*';

        const result = convertToRegExp(str, 'gm');

        tst.is(result instanceof RegExp, true, 'should create a RegExp');

        const pattern = result.source;
        const flags = result.flags;

        tst.is(pattern, 'file.*\\..*', 'should convert special characters');
        tst.is(flags, 'gm', 'should set flags');

        tst.end();
    });
});

tape.test('deepClone()', (st) => {
    st.test('should copy simple object', (tst) => {
        const fn = () => {};
        const objRef = {
            a: 1,
            b: 'b',
            c: false,
            d: undefined,
            e: null,
            f: {},
            g: fn,
            spe1: NaN,
            spe2: Infinity,
            spe3: '',
            spe4: [],
        };

        const result = deepClone(objRef);

        tst.isNot(result, objRef, 'should create a copy');
        tst.deepEqual(result, objRef, 'should have been similar to original');

        tst.end();
    });

    st.test('should copy nested object', (tst) => {
        const fn = () => {};
        const deep1 = {
            a: 1,
            b: 'b',
            c: false,
            d: undefined,
            e: null,
            f: {},
            g: fn,
            spe1: NaN,
            spe2: Infinity,
            spe3: '',
            spe4: [],
        };
        const deep2 = {
            deep: deep1,
            added: 'a value',
        };
        const objRef = {
            d: deep2,
        }

        const result = deepClone(objRef);

        tst.isNot(result, objRef, 'should create a copy');
        tst.deepEqual(result, objRef, 'should have been similar to original');
        tst.isNot(result.d, deep2, 'should copy nested object');
        tst.isNot(result.d.deep, deep1, 'should copy deeper nested object');

        tst.end();
    });


    st.test('with arrays', (tst) => {
        const fn = () => {};
        const objRef = {
            a: 1,
            b: 'b',
            c: false,
            d: undefined,
            e: null,
            f: {},
            g: fn,
            spe1: NaN,
            spe2: Infinity,
            spe3: '',
            spe4: [],
        };
        const nestedArray1 = [
            objRef,
            { a: 'value' },
            null,
            undefined,
            42,
            'value',
        ];
        const nestedArray2 = [
            objRef,
            { a: 'value' },
            null,
            undefined,
            42,
            'value',
        ];
        const arrayRef = [
            {
                deep: nestedArray1,
            },
            nestedArray2,
            42, 'value', null, undefined, [[]],
        ];

        const result = deepClone(arrayRef);

        tst.isNot(result, arrayRef, 'should create a copy');
        tst.is(Array.isArray(arrayRef), true, 'should create an array');
        tst.deepEqual(result, arrayRef, 'should have been similar to original');
        tst.isNot(result[1], nestedArray2, 'should copy nested array');
        tst.isNot(result[0].deep, nestedArray1, 'should copy deeper nested array');
        tst.isNot(result[1][0], objRef, 'should copy nested object');
        tst.isNot(result[0].deep[0], objRef, 'should copy deeper nested object');

        tst.end();
    });

    st.test('with RegExp', (tst) => {
        const r1 = /hello?/gi;
        const r2 = /.* [aA]+?/;

        const result1 = deepClone(r1);
        const result2 = deepClone({rgx: r2});

        tst.isNot(result1, r1, 'should copy RegExp');
        tst.is(result1 instanceof RegExp, true, 'should create a RegExp');
        tst.is(result1.source, 'hello?', 'should copy pattern');
        tst.is(result1.flags, 'gi', 'should copy flags');

        tst.isNot(result2.rgx, r2, 'should copy the RegExp');
        tst.is(result2.rgx.source, '.* [aA]+?', 'should copy the attribute pattern');
        tst.is(result2.rgx.flags, '', 'should copy the attribute flags');
        tst.end();
    });

    st.test('with primitives', (tst) => {
        const result1 = deepClone(1);
        const result2 = deepClone('a');
        const result3 = deepClone(false);
        const result4 = deepClone(null);
        const result5 = deepClone(undefined);

        tst.is(result1, 1, 'should return number');
        tst.is(result2, 'a', 'should return string');
        tst.is(result3, false, 'should return boolean');
        tst.is(result4, null, 'should return null');
        tst.is(result5, undefined, 'should return undefined');
        tst.end();
    });

    st.test('with circular references', (tst) => {
        const obj1 = {
            a: 'a',
        }
        const obj2 = {
            b: 'b',
        }
        obj1.child = obj1;
        obj1.sibling = obj2;
        obj2.sibling = obj1;

        const ref = [obj1, obj2];

        const result = deepClone(ref);

        tst.isNot(result, ref, 'should create a new object');
        tst.isNot(result[0], obj1, 'should copy inner objects');
        tst.is(result[0].child, result[0], 'should keep the circular reference');
        tst.is(result[1].sibling, result[0], 'should keep similar references');
        tst.is(result[0].sibling, result[1], 'should keep similar references (2)');

        tst.end();
    });

    st.test('can ignore some attributes', (tst) => {
        const noCopy1 = {
            ref: 1,
        };
        const noCopy2 = new Set(['alpha', 'omega']);
        const noCopy3 = new Map([[1, 'alpha'], [22, 'omega']]);
        const deep1 = {
            a: 'alpha',
            noCopy: noCopy3,
        };
        const ref = {
            id: 'ref',
            noCopy: noCopy1,
            nop: noCopy2,
            not: 42,
            deep: deep1,
        };

        const result = deepClone(ref, ['noCopy', 'nothing', 'nop', 'not']);

        tst.isNot(result, ref, 'should create a new object');
        tst.isNot(result.deep, deep1, 'should create a new object');
        tst.is(result.noCopy, noCopy1, 'should keep original reference');
        tst.is(result.nop, noCopy2, 'should keep original reference (2)');
        tst.is(result.not, 42, 'should keep primitive');
        tst.is(result.deep.noCopy, noCopy3, 'should keep nested original reference');

        tst.end();
    });
});
