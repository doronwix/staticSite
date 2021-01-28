module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: 10,
        },
      },
    ],
    [
      "@babel/preset-react",
      {
        development: true,
      },
    ],
  ],
  plugins: ["transform-es2015-modules-commonjs"],
};
