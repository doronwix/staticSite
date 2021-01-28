# Tech Stack

## Infrastructure

### Typescript

Documentation can be found [here](https://www.typescriptlang.org/docs/home.html).

Basic tutorial can be found [here](https://scrimba.com/g/gintrototypescript).

Our projects configuration of `typescript` resides in `tsconfig.json`.

### Babel

Documentation can be found [here](https://babeljs.io/docs/en/)

There's not really a tutorial on Babel but strongly advised reading the docs for a better understanding.

We use typescript with babel for optimization reasons, mainly ["@babel/preset-env"](https://babeljs.io/docs/en/babel-preset-env). It allows us to target our builds to specific browsers (via `.browserslistrc`) and have the preset do all the heavy loading in determining code transformation and polyfills

### Jest

Documentation can be found [here](https://jestjs.io/docs/en/getting-started).

In our project with use `Jest` with `Typescript` via `ts-jest` package. The configuration resides in `jest.config.js` in the package root folder.

### Webpack

Documentation on webpack can be found [here](https://webpack.js.org/concepts).

The main config resides in `webpack/webpack.config.base.js`, this is then extended for production/development via `...config.prod.js` and `...config.dev.js`.

I advise reading the following articles for a some insight into webpack:

1. [Understanding The Webpack Dynamics](https://medium.com/@paramsingh_66174/understanding-the-webpack-dynamics-700a7b862ade)
2. [Getting started with Webpack 4](https://hackernoon.com/lets-start-with-webpack-4-91a0f1dba02e)

Something very important, the loaders and dependencies used with webpack should be thought of as separate entities. The basic idea of webpack is going through your dependency tree, loading up assets and putting them through the configured loaders for the desired output.

Via `loaders`, `plugins` and specific configuration it can parse pretty much any type of file, from code files (JS/TS) to images, fonts, css and others.

### Prettier

Prettier is an opinionated code formatter. It has very few options, used as an IDE plugin it standardizes the code formatting of developers.

Documentation can be found [here](https://prettier.io/)

### TSLint

`ESLint` equivalent for Typescript. Documentation available [here](https://palantir.github.io/tslint/)

Configuration resides in `tslint.json`.

## Development

### Lodash

In the absence of a `stdlib` in Javascript we considered optimal to use a library that provides a large set of features to help with development.

Documentation for the latest version is available [here](https://lodash.com/docs/).

### Mobx

`Mobx` is a library created with the purpose of helping with state management. It uses the principle of `observables`, something that a lot of you are familiar with from `Knockout`.

While we won't be using `mobx` directly (but via `mobx-state-tree`) it's still very helpful to understand the principles on which it works. Strongly advise to go through the documentation and understand the guiding principles. [https://mobx.js.org/](https://mobx.js.org/)

### Mobx-State-Tree

`mobx-state-tree` is a state-container, it uses `mobx` and `observables` at it's core but provides an api for abstracting your state and structuring it as a tree.

The documentation [https://mobx-state-tree.gitbook.io/docs/](https://mobx-state-tree.gitbook.io/docs/) is very comprehensive and provides a very good guide into understanding it

# Setup

## Webpack Pipeline

`Typescript` -> `ES2015` -> browser compatibile `javascript` with poylfills.

```js
  entry: {
    main: "./src/index.ts",
  },
```

Using the `entry` config key in specify a starting point for webpack. Starting from this file webpack will traverse the modules (via the provided loaders) and provide output.

In our case via the `module` configuration:

```js
    module: {
        strictExportPresence: true,
        rules: [
        {
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            use: [
                babelLoader,
                {
                    loader: "ts-loader",
                },
            ],
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [babelLoader],
        },
        ],
    },
```

It wil parse `ts` & `tsx` file and take them through `ts-loader` (typescript loader). `ts-loader` will use `typescript` to provide output as per `tsconfig.json`. In our case these will be `es2015` code, that will then pass through `babel-loader`. Please note the order in which loaders are used is reverse to the order they are defined:

```js
        use: [
                babelLoader,
                {
                    loader: "ts-loader",
                },
            ],
```

In the above code, input will go through `ts-loader` first and after which `babel-loader`.

It will also parse `js` files but these will only go through the `babel-loader`.

After passing through the loaders webpack, via the `output` key configuration will provide the generated content (can be stdout, files or others). Example output config:

```js
  output: {
    path: path.resolve(process.cwd(), "dist/scripts"),
    filename: "[name].js",
    chunkFilename: "[name].[hash].js",
    libraryTarget: "amd",
    library: "store",
  },
```

This will output to `./dist/scripts` a file with the name of the entry key (`main`) in which the code will be created as part of an `amd` module named `store`.

## Others

- [Tech Stack](#tech-stack)
  - [Infrastructure](#infrastructure)
    - [Typescript](#typescript)
    - [Babel](#babel)
    - [Jest](#jest)
    - [Webpack](#webpack)
    - [Prettier](#prettier)
    - [TSLint](#tslint)
  - [Development](#development)
    - [Lodash](#lodash)
    - [Mobx](#mobx)
    - [Mobx-State-Tree](#mobx-state-tree)
- [Setup](#setup)
  - [Webpack Pipeline](#webpack-pipeline)
  - [Others](#others)
