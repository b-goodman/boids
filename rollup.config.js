import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: './src/index.ts',
    output: [
        {
            file: './dist/index.js',
            format: 'umd',
            name: "boids"
        },
        // {
        //     file: './dist/index.es.js',
        //     format: 'es'
        // }
    ], 
    plugins: [
        typescript(),
        resolve(),
        commonjs()
    ]
}