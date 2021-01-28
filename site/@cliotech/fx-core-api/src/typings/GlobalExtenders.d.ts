/* eslint-disable @typescript-eslint/interface-name-prefix */

/**
 * in this file we define extensions to global scope done in Web project
 */
declare interface StringConstructor {
  format(val: string, ...args: any): string;
}

/**
 * because we treat ko as global sometimes we define the postbox.publish method from Web
 */
declare interface IKoPostBox {
  publish: (event: string, cat: string) => void;
}

declare interface KnockoutStatic {
  postbox: IKoPostBox;
}

declare interface KnockoutComponents {
  _allRegisteredComponents: { [key: string]: { deps: string[] } };
}

declare namespace KnockoutComponentTypes {
  interface ComponentConfig {
    deps?: string[];
    react?: string;
  }
}

declare namespace UrlResolver {
  function getAssetsPath(): string;
}

type OptionalSpreadParams<T> = T extends undefined
  ? []
  : never | T extends Array<any>
  ? T
  : never | [T];
