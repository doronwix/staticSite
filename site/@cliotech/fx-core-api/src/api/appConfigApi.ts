import { IWebFacade } from "../facade/IWebFacade";
import { IWebWalletConfiguration } from "../facade/IWebInitialConfiguration";

export interface IAppConfigApi {
  getWalletConfig: () => IWebWalletConfiguration;
}

export default ({ InitialConfiguration }: IWebFacade): IAppConfigApi => ({
  getWalletConfig: () => {
    return InitialConfiguration.WalletConfiguration;
  },
});
