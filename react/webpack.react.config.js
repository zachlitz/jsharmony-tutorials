const path = require('path');
const OUTPUT_ROOT = path.join(__dirname, '../models/js');

module.exports = {
    entry: path.resolve(__dirname, 'src/vendor.lib.ts'),
    output: {
        filename: 'vendor.lib.js',
        path: OUTPUT_ROOT,
        library: 'vendor',
        libraryTarget: 'umd',
    },
    externals: {

    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.webpack.json"
                        }
                    }
                ]
            },
        ],
    }
}