import clientStateFlagsApi from "../clientStateFlagsApi";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../facade/IWebFacade";
import { IWebClientStateFlagsManager } from "../../facade/IWebClientStateFlagsManager";

const ClientStateFlagsManagerMock = mock<IWebClientStateFlagsManager>(
  {},
  { deep: true }
);
ClientStateFlagsManagerMock.CSFlags = {
  equityAlert: 15,
  exposureAlert: 15,
  exposureCoverageAlert: 15,
  limitMultiplier: "15",
  marketState: 15,
  systemMode: 15,
};

const facade = mock<IWebFacade>();
facade.ClientStateFlagsManager = ClientStateFlagsManagerMock;

describe("ClientStateFlagsApi", () => {
  it("should return CSFlags on ClientStateFlagsManager", () => {
    const api = clientStateFlagsApi(facade);
    const data = api.getCsFlags();
    expect(data).toEqual(ClientStateFlagsManagerMock.CSFlags);
  });
  it("should call ClientStateFlagsManager ADD on sub and REMOVE on unsub", () => {
    const api = clientStateFlagsApi(facade);
    const subCb = () => ({});
    const unsub = api.subscribeToCSFlagManager(subCb);
    expect(ClientStateFlagsManagerMock.OnChange.Add).toHaveBeenCalledWith(
      subCb
    );
    unsub();
    expect(ClientStateFlagsManagerMock.OnChange.Remove).toHaveBeenCalledWith(
      subCb
    );
  });
});
