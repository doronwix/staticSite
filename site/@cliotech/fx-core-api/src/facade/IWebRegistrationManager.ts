import { IWebERegistrationListName } from "./enums/IWebERegistrationListName";

export interface IWebRegistrationManager {
  Update: (
    controlName: IWebERegistrationListName,
    // currently only handleing quotes list from preset, don't think we need to pass the 2nd param
    iList: Array<[number, string?]>
  ) => void;
}
