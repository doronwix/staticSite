import { mock } from "jest-mock-extended";
import { IClientStateApi } from "../clientStateApi";
import { IWebCSHolder } from "../../facade/IWebClientStateHolderManager";

export const unsubFunc = jest.fn();

export const csHolderData: IWebCSHolder = {
  accountBalance: "1000",
  availableMargin: "1222",
  equity: "155",
  exposureCoverage: "155",
  maintenanceMargin: "155",
  margin: "155",
  marginUtilizationPercentage: "15123",
  marginUtilizationStatus: 1,
  netExposure: "15141",
  openPL: "12141",
  totalEquity: "155",
  usedMargin: "155",
};

const clientStateApi = mock<IClientStateApi>();

clientStateApi.subscribeToChangeUpdates.mockImplementation(() => unsubFunc);
clientStateApi.getClientStateData.mockImplementation(() => csHolderData);

export default () => clientStateApi;
