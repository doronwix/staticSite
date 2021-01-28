import { IWebUserFlow } from "./IWebUserFlow";
import { IWebStateObjectTopics } from "./enums/IWebStateObjectTopics";
import { IWebDealerParams } from "./IWebDealerParams";

export interface IWebStateObject<T> {
  get: <K extends keyof T>(key: K) => T[K] | undefined;
  unset: <K extends keyof T>(key: K) => void;
  getAll: () => T;
  subscribe: <K extends keyof T>(
    key: K,
    cb: (value: T[K]) => void
  ) => () => void;
  update: <K extends keyof T>(key: K, value: T[K]) => void;
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  containsKey: (key: string) => boolean;
  clear: () => void;
}

export interface IWebStateObjectStore {
  DealerParams: IWebStateObject<IWebDealerParams>;
  UserFlow: IWebStateObject<{
    [IWebStateObjectTopics.UserFlowChanged]: IWebUserFlow;
  }>;
}
