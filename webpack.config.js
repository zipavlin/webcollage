/**
 * VARS
 */
const ENTRY_DIR = 'editor/vue';
const ENTRY_FILE = 'main.js';
const OUTPUT_DIR = 'editor/js';
const OUTPUT_FILE = '[name].js';
const watch_dir = true;

/**
 * CONFIG
 */
const path = require('path');
module.exports = {
    watch: watch_dir,
    entry: {
       build: path.join(__dirname, ENTRY_DIR, ENTRY_FILE),
    },
    output: {
       path: path.join(__dirname, OUTPUT_DIR), //this one sets the path to serve
       filename: OUTPUT_FILE
    },
    resolveLoader: {
        modules: [ path.join(__dirname, 'node_modules')]
    },
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    devServer: {
        historyApiFallback: true,
        noInfo: false
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [{
                    loader: "babel-loader",
                    options: { presets: ['es2015'] }
                }]
            }
        ]
    },
};