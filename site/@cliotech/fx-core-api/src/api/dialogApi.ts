import { IWebDialogViewModel } from "../facade/IWebDialogViewModel";
import { IWebFacade } from "../facade/IWebFacade";

export interface IDialogApi {
  open: IWebDialogViewModel["open"];
}

const dialogApi = ({ DialogViewModel }: IWebFacade): IDialogApi => ({
  open: (...args) => DialogViewModel.open(...args),
});

export default dialogApi;
