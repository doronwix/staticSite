/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/camelcase */
declare let __webpack_public_path__: string;

if (process.env.NODE_ENV === "development") {
  const DEV_IP = process.env.DEV_IP || "127.0.0.1";
  __webpack_public_path__ = `https://${DEV_IP}:9000/`;
} else {
  __webpack_public_path__ = UrlResolver.getAssetsPath() + "/js/fx-core-api/";
}

export const set = 1;
