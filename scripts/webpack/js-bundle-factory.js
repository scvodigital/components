/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @fileoverview Creates Webpack bundle config objects to compile ES2015 JavaScript to ES5.
 */

'use strict';

class JsBundleFactory {
  constructor({
    env,
    pathResolver,
    globber,
    pluginFactory,
  } = {}) {
    /** @type {!Environment} */
    this.env_ = env;

    /** @type {!PathResolver} */
    this.pathResolver_ = pathResolver;

    /** @type {!Globber} */
    this.globber_ = globber;

    /** @type {!PluginFactory} */
    this.pluginFactory_ = pluginFactory;
  }

  createCustomJs(
    {
      bundleName,
      chunks,
      chunkGlobConfig: {
        inputDirectory = null,
        filePathPattern = '**/*.js',
      } = {},
      output: {
        fsDirAbsolutePath = undefined, // Required for building the npm distribution and writing output files to disk
        httpDirAbsolutePath = undefined, // Required for running the demo server
        filenamePattern = this.env_.isProd() ? '[name].min.js' : '[name].js',
        library,
      },
      plugins = [],
    }) {
    chunks = chunks || this.globber_.getChunks({inputDirectory, filePathPattern});

    /*
    if (Array.isArray(chunks)) {
      chunks = ['babel-polyfill', ...chunks];
    } else if(typeof chunks === 'object') {
      chunks.polyfill = 'babel-polyfill';
    } else {
      chunks = ['babel-polyfill', chunks];
    }
    console.log('CHUNKS:', chunks);
    */

    return {
      name: bundleName,
      entry: chunks,
      output: {
        path: fsDirAbsolutePath,
        publicPath: httpDirAbsolutePath,
        filename: filenamePattern,
        libraryTarget: 'umd',
        library,
      },
      devtool: 'source-map',
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        }],
      },
      plugins: [
        ...plugins,
      ],
    };
  }

  createMainJsCombined(
    {
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
      },
      plugins = [],
    }) {
    const getAbsolutePath = (...args) => this.pathResolver_.getAbsolutePath(...args);

    return this.createCustomJs({
      bundleName: 'main-js-combined',
      chunks: getAbsolutePath('/packages/scvo-material-components/index.js'),
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
        filenamePattern: this.env_.isProd() ? 'scvo-material-components.min.js' : 'scvo-material-components.js',
        library: 'smc',
      },
      plugins: [
        this.pluginFactory_.createCopyrightBannerPlugin(),
        ...plugins,
      ],
    });
  }
  
  createMdcJsCombined(
    {
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
      },
      plugins = [],
    }) {
    const getAbsolutePath = (...args) => this.pathResolver_.getAbsolutePath(...args);

    return this.createCustomJs({
      bundleName: 'mdc-js-combined',
      chunks: getAbsolutePath('/node_modules/material-components-web/index.js'),
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
        filenamePattern: this.env_.isProd() ? 'material-compontents-components.min.js' : 'material-components-web.js',
        library: 'mdc',
      },
      plugins: [
        this.pluginFactory_.createCopyrightBannerPlugin(),
        ...plugins,
      ],
    });
  }

  createMainJsALaCarte(
    {
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
      },
      plugins = [],
    }) {
    const getAbsolutePath = (...args) => this.pathResolver_.getAbsolutePath(...args);

    return this.createCustomJs({
      bundleName: 'main-js-a-la-carte',
      chunks: {
        ajaxButton: getAbsolutePath('/packages/smc-ajax-button/index.js'),
      },
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
        filenamePattern: this.env_.isProd() ? 'smc.[name].min.js' : 'smc.[name].js',
        library: ['smc', '[name]'],
      },
      plugins: [
        this.pluginFactory_.createCopyrightBannerPlugin(),
        ...plugins,
      ],
    });
  }
}

module.exports = JsBundleFactory;