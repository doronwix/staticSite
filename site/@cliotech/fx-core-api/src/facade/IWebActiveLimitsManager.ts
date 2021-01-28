import { Dictionary } from "lodash";
import { IWebTDelegate } from "./IWebTDelegate";
import { IWebLimit } from "./IWebLimit";

export interface IWebActiveLimitsManager {
  OnPriceAlert: IWebTDelegate<Dictionary<IWebLimit>>;
  HasPriceAlerts: (instrumentId: number) => boolean;
}
