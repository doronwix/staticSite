//plugins
const WebpackRequireFrom = require('webpack-require-from')
const WebpackAutoInject = require('webpack-auto-inject-version')

const path = require('path')
const fs = require('fs')

const version = fs.readFileSync(path.resolve(__dirname, '../../IFOREX.Clients.Web/scripts/fxnet/common/utils/version/version.txt'), 'utf8')
const outDir = path.resolve(__dirname, '../../iFOREX.Clients.Web/assets/' + version + '/js/fx-chatbot')
console.log('outDir', outDir)

module.exports = {
  mode: 'development',
  devtool: 'source.map',
  entry: './ChatBot.js',
  output: {
    libraryTarget: 'amd',
    library: 'assets/js/fx-chatbot/main',
    path: outDir,
    filename: 'main.js',
    chunkFilename: '[name].[chunkhash].js',
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
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
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
  watchOptions:{
    ignored:['node_modules/**']
  },
  optimization: {
    minimize: false,
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
}
