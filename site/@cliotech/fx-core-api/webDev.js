/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const WDS = require("webpack-dev-server");
const config = require("./webpack/webpack.config.dev");

const wbConfig = config(true);

const bindingIp = process.env.DEV_IP || "127.0.0.1";

wbConfig.output.publicPath = `https://${bindingIp}:9000/`;

new WDS(webpack(wbConfig), {
  publicPath: wbConfig.output.publicPath,

  port: 9000,
  disableHostCheck: true,
  https: true,
  host: bindingIp,
  hot: true,
  inline: true,
  allowedHosts: [".iforex.com", "*.vestle.com"],

  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "X-Requested-With, content-type, Authorization",
  },
  liveReload: false,
}).listen(9000, bindingIp, (err, _result) => {
  if (err) {
    console.log(err);
  }

  console.log(`Listening  at https://${bindingIp}:9000`);
});
