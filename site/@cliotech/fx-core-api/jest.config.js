// eslint-disable-next-line @typescript-eslint/no-var-requires
const babelConfig = require("./babelrc.test");
const IS_DEV = !!process.env.RUN_DEV;
const IS_WATCH = !!process.env.RUN_WATCH;

module.exports = {
  globals: {
    Format: true,
    "ts-jest": {
      babelConfig,
    },
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^lodash-es$": "lodash",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: !IS_WATCH,
  setupFilesAfterEnv: ["<rootDir>/src/jestSetup.js"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],

  // even when using automock don't mock node_modules
  // they can still be mocked manually using jest.mock()
  unmockedModulePathPatterns: ["<rootDir>/node_modules", "__testUtils__"],
  coverageReporters: IS_DEV
    ? ["text"]
    : ["json", "lcov", "clover", "text-summary"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!**/node_modules/**"],
  coverageDirectory: "<rootDir>/coverage",
  // coverageThreshold: {
  //   global: {
  //     branches: 90,
  //     functions: 90,
  //     lines: 90,
  //     statements: 90,
  //   },
  // },
};
