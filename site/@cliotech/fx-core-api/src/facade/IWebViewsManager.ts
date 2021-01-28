import { IWebEForms } from "./enums/IWebEForms";

export interface IWebViewsManager {
  RedirectToForm: (viewType: IWebEForms, args?: any, cb?: () => any) => void;
  SwitchViewVisible: (viewType: IWebEForms, args?: any, cb?: () => any) => void;
}
