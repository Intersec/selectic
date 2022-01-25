import postcss from 'rollup-plugin-postcss';

export default [{
    input: 'lib/index.js',
    plugins: [
        postcss({
            extensions: [ '.css' ],
        }),
    ],
    output: [{
        file: 'dist/selectic.common.js',
        exports: "named",
        format: 'cjs',
    }, {
        file: 'dist/selectic.esm.js',
        format: 'esm',
    }],
    external: [
        'vtyx',
    ],
    context: 'this',
}, {
    input: 'lib/Store.js',
    output: [{
        file: 'test/dist/Store.js',
        exports: 'named',
        format: 'cjs',
    }],
    external: [
        'vtyx',
    ],
    context: 'this',
}, {
    input: 'lib/tools.js',
    output: [{
        file: 'test/dist/tools.js',
        exports: 'named',
        format: 'cjs',
    }],
    context: 'this',
}];
