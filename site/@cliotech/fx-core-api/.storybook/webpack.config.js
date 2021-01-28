const path = require("path");
module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.ts(x?)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: "ts-loader",
      },
    ],
  });
  config.resolve.extensions.push(".ts", ".tsx");
  config.module.rules.push({
    test: /\.less$/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: {
          modules: {
            localIdentName: "[path][name]__[local]--[hash:base64:5]",
          },
        },
      },
      "less-loader",
    ],
    include: path.resolve(__dirname, "../"),
  });

  // Return the altered config

  return config;
};
