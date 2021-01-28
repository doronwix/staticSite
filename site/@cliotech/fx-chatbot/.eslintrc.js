module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        //"eslint:recommended",
        "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module",
        "allowImportExportEverywhere": true
    },
    "plugins": ["react", "react-hooks"],
    "rules": {
        // "linebreak-style": ["error", "windows"],
        "quotes": ["error", "single"],
        "semi": ["error", "never"],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react/prop-types": "off",
        "no-console":"warn"
    },
    "settings": {
      "react": {
        "version": "16.8"
      }
    }
}
