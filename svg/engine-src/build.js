const webpack = require('webpack');
const load = require('./webpack-to-memory');
const { join } = require('path');
const config = {
    entry: join(__dirname, './index.js'),
    target: 'node',
    output: {
        library: 'expressionEngine',
        libraryTarget: 'var',
        filename: 'expressionEngine.js',
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
};

function buildToMemory(callback) {
    load(webpack(config), { source: true })
        .then(data => callback(null, data))
        .catch(e => callback(e));
}

module.exports = buildToMemory;
