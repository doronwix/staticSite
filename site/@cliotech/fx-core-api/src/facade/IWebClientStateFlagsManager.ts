import { IWebTDelegate } from "./IWebTDelegate";
import { IWebECSFlagStates } from "./enums/IWebECSFlagStates";

interface IWebCSFlags {
  exposureCoverageAlert: IWebECSFlagStates;
  equityAlert: number;
  exposureAlert: IWebECSFlagStates;
  marketState: IWebECSFlagStates;
  systemMode: number;
  limitMultiplier: string;
}

export interface IWebClientStateFlagsManager {
  OnChange: IWebTDelegate<IWebCSFlags>;
  CSFlags: IWebCSFlags;
}
