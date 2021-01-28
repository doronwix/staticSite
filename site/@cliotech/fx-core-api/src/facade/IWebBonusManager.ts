import { IWebTDelegate } from "./IWebTDelegate";

export interface IWebBonusManager {
  bonus: () => IWebBonusData;
  onChange: IWebTDelegate<void>;
}

export interface IWebBonusData {
  volumeUsd: number | null;
  amountBase: number | null;
  amountGivenBase: number | null;
  startDate: string | null;
  endDate: string | null;
  accumulatedVolumeUsd: number | null;
}
