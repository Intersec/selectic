import path from 'path';
import postcss from 'rollup-plugin-postcss';

const external = [
    'vtyx',
];

export default [{
    /* Main build: the style is injected at import time. */
    input: 'lib/index.js',
    plugins: [
        postcss({
            extensions: [ '.css' ],
        }),
    ],
    output: [{
        file: 'dist/selectic.common.js',
        exports: 'named',
        format: 'cjs',
    }, {
        file: 'dist/selectic.esm.js',
        format: 'esm',
    }],
    external,
    context: 'this'
}, {
    /* Style-free build: the CSS is extracted to `dist/selectic.css`, to be
     * imported by the application (which then owns the cascade order, and
     * does not need `style-src 'unsafe-inline'`).
     * `extract` requires an absolute path to emit a single file for both
     * outputs. */
    input: 'lib/index.js',
    plugins: [
        postcss({
            extensions: [ '.css' ],
            extract: path.resolve('dist/selectic.css'),
        }),
    ],
    output: [{
        file: 'dist/selectic.nostyle.common.js',
        exports: 'named',
        format: 'cjs',
    }, {
        file: 'dist/selectic.nostyle.esm.js',
        format: 'esm',
    }],
    external,
    context: 'this'
}];
