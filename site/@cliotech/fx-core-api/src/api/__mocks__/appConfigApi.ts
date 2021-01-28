import { mock } from "jest-mock-extended";
import { IAppConfigApi } from "../appConfigApi";
import { IWebWalletConfiguration } from "../../facade/IWebInitialConfiguration";

const appConfigApi = mock<IAppConfigApi>();

export const webWalletDataMock: IWebWalletConfiguration = {
  formatConditionalVolume: false,
  useAdvancedView: true,
  isVisibleUsedMargin: true,
  supressDialog: true,
};

appConfigApi.getWalletConfig.mockImplementation(() => webWalletDataMock);

export default () => appConfigApi;
