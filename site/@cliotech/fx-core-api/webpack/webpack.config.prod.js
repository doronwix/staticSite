/* eslint-disable @typescript-eslint/no-var-requires */
const base = require("./webpack.config.base");
const merge = require("webpack-merge");
const webpack = require("webpack");
const assetsPlugin = require("./assetsPluginInstance");

const config = {
  mode: "production",
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    assetsPlugin,
  ],
};

module.exports = (local = false) => merge(base(local), config);
