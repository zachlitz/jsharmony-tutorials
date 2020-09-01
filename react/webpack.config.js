const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { parse } = require('path');

const MODELS_INPUT_ROOT = path.join(__dirname, 'src/models');
const OUTPUT_ROOT = path.join(__dirname, '../public/react-model-js');

module.exports = {
    entry: entries,
    output: {
        // filename: outputs,
        filename: '[name].js',
        path: OUTPUT_ROOT,
        library: '[name].model',
        libraryTarget: 'umd',
    },
    externals: {
        // react: 'react',
        // 'react-dom': 'react-dom',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'less-loader', // compiles Less to CSS
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: "tsconfig.webpack.json"
                        }
                    }
                ],
                exclude: /node_modules/
            },
        ],
    }
}



function entries() {
    const modelsRoot = MODELS_INPUT_ROOT;
    const files = glob.sync('**/*.model.ts', {
        cwd: modelsRoot.replace(/\//g, '/'),
    });

    return files.reduce((prev, file) => {
        const parsed = path.parse(file);
        const relativeOutputFolder = path.dirname(parsed.dir);

        const outputName = `${relativeOutputFolder}/${parsed.name}`.replace(/^(?:\.\/)/, '').replace(/\.model$/i, '');
        prev[outputName] = path.join(modelsRoot, file);
        return prev;
    }, {});
}

