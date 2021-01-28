import { getEnv, Instance, types } from "mobx-state-tree";
import { IApi } from "../../api";
import WalletConfiguration from "./walletConfiguration";

const AppConfig = types
  .model({
    walletConfiguration: WalletConfiguration,
  })
  .actions((anySelf) => {
    const self = anySelf as IAppConfigType;

    const afterCreate = () => {
      self.loadWalletConfig();
    };

    const loadWalletConfig = () => {
      const { appConfigApi } = getEnv(self) as IApi;
      Object.assign(self, {
        walletConfiguration: appConfigApi.getWalletConfig(),
      });
    };

    return {
      afterCreate,
      loadWalletConfig,
    };
  });

export interface IAppConfigType extends Instance<typeof AppConfig> {}

export default AppConfig;
