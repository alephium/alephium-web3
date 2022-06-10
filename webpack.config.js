/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

<<<<<<< HEAD
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
=======
const webpack = require('webpack')
>>>>>>> alephium/master

module.exports = {
  mode: 'production',
  entry: {
<<<<<<< HEAD
    alephium: './dist/src/index.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.SourceMapDevToolPlugin({ filename: '[file].map' }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
=======
    alephium: './dist/lib/index.js'
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({ filename: '[file].map' }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        // The "bip39/src/wordlists" node module consists of json files for multiple languages. We only need English.
>>>>>>> alephium/master
        return /.*\/wordlists\/(?!english).*\.json/.test(resource)
      }
    })
  ],
<<<<<<< HEAD
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify')
=======
  resolve: {
    extensions: ['.js'],
    fallback: {
      fs: false,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/')
>>>>>>> alephium/master
    }
  },
  output: {
    filename: 'alephium-web3.min.js',
<<<<<<< HEAD
    path: path.resolve(__dirname, 'web'),
    library: 'alephium-web3',
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          },
          compress: true,
          keep_classnames: true,
          keep_fnames: true
        },
        extractComments: false
      })
    ]
=======
    library: {
      name: 'alephium',
      type: 'umd'
    }
  },
  optimization: {
    minimize: true
>>>>>>> alephium/master
  }
}
