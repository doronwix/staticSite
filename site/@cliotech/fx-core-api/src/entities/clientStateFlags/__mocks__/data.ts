import { IClientStateFlagsSnapshotIn } from "../clientStateFlags";
import { IWebECSFlagStates } from "../../../facade/enums/IWebECSFlagStates";

export const clientStateFlagsData: IClientStateFlagsSnapshotIn = {
  equityAlert: 0,
  exposureAlert: IWebECSFlagStates.Active,
  exposureCoverage: IWebECSFlagStates.Active,
  limitMultiplier: "15",
  marketState: IWebECSFlagStates.Active,
  systemMode: 1,
};
