import clientStateApi from "../clientStateApi";
import { IWebFacade } from "../../facade/IWebFacade";
import { IWebClientStateHolderManager } from "../../facade/IWebClientStateHolderManager";
import { mock } from "jest-mock-extended";

/**
 * we can pass a 2nd param to mock options: { deep: true } so we mock the methods on children
 * eg: without deep - only mocks CSHM.OnChange, with deep - mocks CSHM.OnChange & all children of OnChange ( Add, Remove)
 */
const ClientStateHolderManagerMock = mock<IWebClientStateHolderManager>(
  {},
  { deep: true }
);
ClientStateHolderManagerMock.CSHolder = {
  accountBalance: "12",
  availableMargin: "14",
  equity: "13",
  exposureCoverage: "13",
  maintenanceMargin: "1",
  margin: "1",
  marginUtilizationPercentage: "1",
  marginUtilizationStatus: 0,
  netExposure: "1",
  openPL: "1",
  totalEquity: "1",
  usedMargin: "1",
};

const facade = mock<IWebFacade>();
facade.ClientStateHolderManager = ClientStateHolderManagerMock;

describe("ClientStateApi", () => {
  it("getClientStateData should return CSHolder on CSM", () => {
    const api = clientStateApi(facade);
    expect(api.getClientStateData()).toStrictEqual(
      ClientStateHolderManagerMock.CSHolder
    );
  });

  it("subscribeToChangeUpdates should call Add on manager with pased fn", () => {
    const mockSubFn = jest.fn();
    const api = clientStateApi(facade);
    api.subscribeToChangeUpdates(mockSubFn);
    expect(ClientStateHolderManagerMock.OnChange.Add).toHaveBeenCalledWith(
      mockSubFn
    );
  });

  it("when unsubbing should call OnChange.Remove on manager with fn used to sub ", () => {
    const mockSubFn = jest.fn();
    const api = clientStateApi(facade);
    const unsub = api.subscribeToChangeUpdates(mockSubFn);
    unsub();
    expect(ClientStateHolderManagerMock.OnChange.Remove).toHaveBeenCalledWith(
      mockSubFn
    );
  });
});
