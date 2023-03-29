const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: {
    index: path.resolve(__dirname, "dist", "cjs", "index.js"),
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({ filename: "[file].map" }),
    new webpack.ProvidePlugin({
      // you must `npm install buffer` to use this.
      Buffer: ['buffer', 'Buffer']
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      buffer: require.resolve('buffer'),
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      path: require.resolve("path-browserify")
    },
  },
  output: {
    path: path.resolve(__dirname, "dist", "umd"),
    filename: "[name].min.js",
    libraryTarget: "umd",
    library: "WalletConnectAlephiumProvider",
    umdNamedDefine: true,
    globalObject: "this",
  },
  optimization: {
    minimize: true,
  },
};
