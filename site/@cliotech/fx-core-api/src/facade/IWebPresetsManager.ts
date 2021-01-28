import { IWebTDelegate } from "./IWebTDelegate";
import { Dictionary } from "lodash";

export type IWebPresetsManagerData = Dictionary<Array<[number, string]>>;

export interface IWebPresetsManager {
  OnPresetsUpdated: IWebTDelegate<[IWebPresetsManagerData, Array<number>]>;
  GetAvailableScreens: () => number[];
  GetPresetInstruments: () => IWebPresetsManagerData;
}
