jest.enableAutomock();

jest.unmock("../index");
jest.unmock("../walletConfiguration.ts");
jest.unmock("../../../api/index.ts");
import AppConfig from "../index";
import { IAppConfigApi } from "../../../api/appConfigApi";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../../facade/IWebFacade";
import { webWalletDataMock } from "../../../api/__mocks__/appConfigApi";
import buildApiWithFacade from "../../../api";

const facade = mock<IWebFacade>();

const api = buildApiWithFacade(facade);

const appConfigApi = api.appConfigApi as jest.Mocked<IAppConfigApi>;

describe("App Config Store", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should load wallet config on creation", () => {
    AppConfig.create(
      {
        walletConfiguration: {},
      },
      api
    );

    expect(appConfigApi.getWalletConfig).toHaveBeenCalled();
  });

  it("should add data when calling loadWalletConfig", () => {
    const appConfigStore = AppConfig.create(
      {
        walletConfiguration: {},
      },
      api
    );

    // called by afterCreate
    expect(appConfigApi.getWalletConfig).toHaveBeenCalledTimes(1);

    // should have initialValues
    expect(appConfigStore.walletConfiguration.formatConditionalVolume).toBe(
      webWalletDataMock.formatConditionalVolume
    );

    // we mock 1 call with different value
    appConfigApi.getWalletConfig.mockImplementationOnce(() => ({
      formatConditionalVolume: true,
      useAdvancedView: true,
      supressDialog: true,
      isVisibileUsedMargin: true,
    }));

    // call it manually
    appConfigStore.loadWalletConfig();

    // should be called 2 times now
    expect(appConfigApi.getWalletConfig).toHaveBeenCalledTimes(2);

    // value should change to match new data
    expect(appConfigStore.walletConfiguration.formatConditionalVolume).toBe(
      true
    );
  });
});
