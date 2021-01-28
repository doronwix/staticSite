import { IWebEForms } from "../facade/enums/IWebEForms";
import { IWebFacade } from "../facade/IWebFacade";

export interface IViewsManagerApi {
  redirectToForm: (view: IWebEForms, args?: any, cb?: () => any) => void;
  switchViewVisible: (view: IWebEForms, args?: any, cb?: () => any) => void;
}

export default (facet: IWebFacade): IViewsManagerApi => ({
  // this might look bizarre but I'd rather not reference RedirectToForm directly but instead call it
  redirectToForm: (...args) => facet.ViewsManager.RedirectToForm(...args),
  switchViewVisible: (...args) => facet.ViewsManager.SwitchViewVisible(...args),
});
