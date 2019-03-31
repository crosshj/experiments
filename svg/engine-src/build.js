const webpack = require('webpack');
const load = require('./webpack-to-memory');
const { join } = require('path');
const fs = require('fs');
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

var engineSrc;
function cacheOrRun(fn, callback){
    if(engineSrc){
        //console.log('--- read engine from memory');
        callback(null, engineSrc);
        return;
    }
    const engineSrcPath = join(__dirname, "./index.js");
    const engineBldPath = join(__dirname, "../engine.js");

    var sourceStats;
    var buildStats;
    try {
        sourceStats = fs.statSync(engineSrcPath);
        buildStats = fs.statSync(engineBldPath);
    } catch(e){}

    //if engine.js and engine-src are "same", use engine.js
    if (buildStats && sourceStats && sourceStats.mtime.valueOf() === buildStats.mtime.valueOf()) {
        //console.log('--- read engine from file');
        engineSrc = fs.readFileSync(engineBldPath);
        callback(null, engineSrc);
        return;
    }
    //console.log('--- new engine build');

    fn((err, data) => {
        if(err){
            console.log({ err })
            callback(JSON.stringify(err));
            return;
        }
        engineSrc = `/*! Expression Engine */\n${data['expressionEngine.js']}`;

        fs.writeFile(engineBldPath, engineSrc, function(err) {
            if(err) {
                return console.log(err);
            }
            const sourceStats = fs.statSync(engineSrcPath);
            fs.utimesSync(
                engineBldPath, sourceStats.atime, sourceStats.mtime
            );
            //console.log("engine.js built");
            callback(null, engineSrc);
        });
    });
}

function buildToMemory(callback) {
    load(webpack(config), { source: true })
        .then(data => callback(null, data))
        .catch(e => callback(e));
}

module.exports = (callback) => cacheOrRun(buildToMemory, callback);
