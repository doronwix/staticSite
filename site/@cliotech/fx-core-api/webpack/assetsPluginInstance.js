/* eslint-disable @typescript-eslint/no-var-requires */
const AssetsPlugin = require("webpack-assets-manifest");
const _ = require("lodash");
const generate = require("@babel/generator").default;
const { parse } = require("@babel/parser");
const fs = require("fs");

const ENTRYPOINTS_KEY = "entryPoints";

const generateShims = (assetPaths, entryPoints) => {
  // we parse the object and only pick the js exports from assets
  const entryPointsWithJsFiles = Object.keys(entryPoints).reduce(
    (agg, entryPointKey) => {
      return {
        ...agg,
        [entryPointKey]: entryPoints[entryPointKey].js,
      };
    },
    {}
  );

  // replace the paths with bundle name from assets path
  const fileDepsToNames = (fileDeps) => {
    return _.map(fileDeps, (dependency) => {
      return _.findKey(assetPaths, (path) => path === dependency);
    });
  };

  // we go over the js objects and return an object containing the deps & exports
  const withDeps = _.reduce(
    entryPointsWithJsFiles,
    (shims, fileDeps, entryPointName) => ({
      ...shims,
      [entryPointName]: {
        deps: _.pull(fileDepsToNames(fileDeps), entryPointName),
        exports: `Core.${entryPointName}`,
      },
    }),
    {}
  );
  return withDeps;
};

const assetsManifest = new AssetsPlugin({
  output: "assets.json",
  entrypoints: true,
  entrypointsKey: ENTRYPOINTS_KEY,
  customize(entry, original, manifest, asset) {
    // don't add entries that are map files
    if (entry.key.toLowerCase().endsWith(".map")) {
      return false;
    }
    // remove the .js from entry point & bundle name
    if (entry.key.endsWith(".js")) {
      return {
        key: _.replace(entry.key, ".js", ""),
        value: entry.value,
      };
    }
  },
  transform(assets, manifest) {
    // only entrypoints config
    const entryPoints = assets[ENTRYPOINTS_KEY];
    // only asset lists with paths
    const onlyAssets = _.pickBy(
      assets,
      (value, key) => key !== ENTRYPOINTS_KEY
    );

    // finally we return the paths & shim as required by requirejs config
    return {
      shim: generateShims(onlyAssets, entryPoints),
      paths: _.reduce(
        onlyAssets,
        (assets, asset, key) => ({
          ...assets,
          [key]: _.replace(asset, ".js", ""),
        }),
        {}
      ),
    };
  },
  done(manifest, stats) {
    const manifestPath = manifest.getOutputPath();
    const parsedManifest = require(manifestPath);
    function generatePaths(basePath) {
      return Object.keys(paths).reduce(function(agg, pathKey) {
        agg[pathKey] = basePath + paths[pathKey];
        return agg;
      }, {});
    }
    const codeText = `
        define("fxnet/CoreAssetsConfig", ["require"], function CoreAssetsConfig() {
            var shim = ${JSON.stringify(parsedManifest.shim)};
            var paths = ${JSON.stringify(parsedManifest.paths)};

            ${generatePaths.toString()}
            
            return {
                generatePaths: generatePaths,
                shim: shim
            };
        });
    `;

    const ast = parse(codeText);
    const { code } = generate(ast, {}, codeText);
    fs.writeFileSync(_.replace(manifestPath, ".json", ".js"), code);
  },
});

module.exports = assetsManifest;
