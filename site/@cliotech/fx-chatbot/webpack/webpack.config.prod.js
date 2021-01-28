//plugins
const WebpackRequireFrom = require('webpack-require-from')
const WebpackAutoInject = require('webpack-auto-inject-version')

const path = require('path');



const outDir = path.resolve(__dirname, '../dist')
console.log('outDir', outDir)

module.exports = {
  mode: 'production',
  entry: './ChatBot.js',
  output: {
    libraryTarget: 'amd',
    library: 'assets/js/fx-chatbot/main',
    path: outDir,
    filename: '[name].js',
    chunkFilename: '[name].js', //'[name].[chunkhash].js',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              camelCase: true,
              sourceMap: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          },
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          name: '[path][name].[ext]',
        }
      },
    ],
  },
  optimization: {
    minimize: true,
    splitChunks: false
  },
  plugins: [
    new WebpackRequireFrom({
        methodName: 'UrlResolver.getChatBotResourcesPath',
    }),
    new WebpackAutoInject({
      SILENT: true,
      components: {
          AutoIncreaseVersion: false,
          InjectAsComment: false,
          InjectByTag: true
      },
    }),
  ]
};
