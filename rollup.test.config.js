/* Bundles used by the test suite only: they are not part of the published
 * package, so they are built by `npm test` and not by `npm run build`. */

import postcss from 'rollup-plugin-postcss';

export default [{
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
}, {
    input: 'test/components-entry.js',
    plugins: [
        postcss({
            extensions: [ '.css' ],
        }),
    ],
    output: [{
        file: 'test/dist/components.js',
        exports: 'named',
        format: 'cjs',
    }],
    external: [
        'vtyx',
        'vue',
    ],
    context: 'this',
}];
