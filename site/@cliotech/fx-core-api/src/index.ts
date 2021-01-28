require("./publicPath");
import "./polyfills";

import buildApiWithFacade from "./api";

import Store, { IDataStoreSnapshotIn } from "./store";
import { merge } from "lodash-es";
import { IWebFacade } from "./facade/IWebFacade";

// Story: http://tfserver:8080/tfs/iForex/FXNET/_workitems?id=351759&_a=edit

const baseData = {
  appConfig: { walletConfiguration: {} },
  clientState: { id: "" },
  customer: { id: "" },
  customerProfile: { id: "" },
  portofolio: {},
  bonus: {},
  dictionary: { id: "" },
  dialog: {},
  systemInfo: { id: "" },
  userFlow: { id: "" },
  presetsAndCategories: {
    quoteList: {},
  },
  clientStateFlags: {},
  directApi: {},
};

const createStore = (data: IDataStoreSnapshotIn, facade: IWebFacade) => {
  const store = Store.create(merge(data, baseData), buildApiWithFacade(facade));

  if (process.env.NODE_ENV === "development") {
    require("mobx-devtools-mst").default(store);
  }

  return store;
};

const StoreAPI = {
  createStore,
};

export default StoreAPI;
