/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const terserPlugin = require("./terserPlugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const babelLoader = (devBuild) => {
  const baseConfig = {
    loader: "babel-loader",
    options: {
      cacheDirectory: false,
      presets: [
        [
          "@babel/preset-env",
          {
            useBuiltIns: "entry",
            corejs: 3,
            modules: false,
            targets: {
              ie: "11",
              browsers: "cover 99.5% in US",
            },
            include: [
              "es.array.fill",
              "es.string.ends-with",
              "es.map",
              "es.set",
              "es.symbol",
              "es.weak-map",
            ],
          },
        ],
        [
          "@babel/preset-react",
          {
            development: !!devBuild,
          },
        ],
      ],
      plugins: [],
      sourceMaps: true,
      inputSourceMap: true,
    },
  };
  if (devBuild) {
    baseConfig.options.plugins.push("react-hot-loader/babel");
  }
  return baseConfig;
};

module.exports = ({
  dev = false,
  devServer = false,
  sourceMaps = false,
} = {}) => ({
  context: process.cwd(),
  cache: true,
  target: "web",
  optimization: {
    moduleIds: "hashed",
    minimizer: [terserPlugin(sourceMaps)],
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      cacheGroups: {
        vendor: {
          chunks: "all",
          minChunks: Infinity,
        },
      },
    },
    runtimeChunk: {
      name: "core.runtime",
    },
  },
  entry: {
    StoreAPI: "./src/index.ts",
    Components: "./src/components/index.ts",
    KoBindings: "./src/koBindings/index.ts",
  },
  output: {
    path: path.resolve(process.cwd(), "dist/scripts"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    libraryTarget: "global",
    libraryExport: "default",
    library: ["Core", "[name]"],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          babelLoader(dev),
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              configFile: "tsconfig.webpack.json",

              experimentalWatchApi: false,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [babelLoader(devServer)],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]--[hash:base64:5]",
              },
              sourceMap: sourceMaps && dev,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]--[hash:base64:5]",
              },
              sourceMap: sourceMaps && dev,
            },
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: sourceMaps && dev,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  externals: {
    knockout: {
      root: ["ko"],
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.resolve(process.cwd(), "tsconfig.webpack.json"),
    }),
  ],
});
