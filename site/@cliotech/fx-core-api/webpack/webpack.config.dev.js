/* eslint-disable @typescript-eslint/no-var-requires */
const base = require("./webpack.config.base");
const merge = require("webpack-merge");
const webpack = require("webpack");
const path = require("path");

const config = {
  // mode: "development",
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(process.cwd(), "dist/scripts"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    libraryTarget: "global",
    libraryExport: "default",
  },
  devtool: "eval-source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
      },
    }),
  ],
};

module.exports = (local = false) =>
  merge(
    base({
      sourceMaps: true,
      devServer: true,
      dev: true,
    }),
    config
  );
