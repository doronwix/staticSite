import Store from "../store";
import buildApiWithFacade from "../api";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../facade/IWebFacade";
import { unprotect } from "mobx-state-tree";

const facade = mock<IWebFacade>();

const api = buildApiWithFacade(facade);

const createStore = () => {
  const store = Store.create(
    {
      appConfig: {
        walletConfiguration: {},
      },
      bonus: {},
      clientState: {},
      clientStateFlags: {},
      customer: {},
      customerProfile: {},
      dialog: {},
      dictionary: {},
      directApi: {},
      portofolio: {},
      presetsAndCategories: {
        quoteList: {},
      },
      systemInfo: {},
      userFlow: {},
    },
    api
  );
  unprotect(store);

  return store;
};

export default {
  createStore,
};
