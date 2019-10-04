export default {
    input: 'lib/index.js',
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
    context: "this",
}
