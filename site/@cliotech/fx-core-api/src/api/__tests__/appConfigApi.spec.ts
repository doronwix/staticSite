import appConfigApi from "../appConfigApi";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const InitialConfigurationMock = {
  WalletConfiguration: {
    formatConditionalVolume: false,
    useAdvancedView: false,
    supressDialog: false,
    isVisibleUsedMargin: false,
  },
};

const facade = mock<IWebFacade>();
facade.InitialConfiguration = InitialConfigurationMock;

describe("App Config Api", () => {
  it("getWalletConfig should return walletconfiguration on manager", () => {
    const api = appConfigApi(facade);
    expect(api.getWalletConfig()).toStrictEqual(
      InitialConfigurationMock.WalletConfiguration
    );
  });
});
