import { mock } from "jest-mock-extended";
import { IClientStateFlagsApi } from "../clientStateFlagsApi";
import { IClientStateFlagsSnapshotIn } from "../../entities/clientStateFlags/clientStateFlags";
import { IWebECSFlagStates } from "../../facade/enums/IWebECSFlagStates";

export const unsubFunc = jest.fn();

export const csFlagsData: IClientStateFlagsSnapshotIn = {
  equityAlert: 14,
  exposureAlert: IWebECSFlagStates.NotActive,
  exposureCoverage: IWebECSFlagStates.NotActive,
  limitMultiplier: "15",
  marketState: IWebECSFlagStates.Active,
  systemMode: IWebECSFlagStates.Active,
};

const clientStateFlagsApi = mock<IClientStateFlagsApi>();

clientStateFlagsApi.subscribeToCSFlagManager.mockImplementation(
  () => unsubFunc
);
clientStateFlagsApi.getCsFlags.mockImplementation(() => csFlagsData);

export default () => clientStateFlagsApi;
