import { IWebFacade } from "../facade/IWebFacade";
import { IWebCSHolder } from "../facade/IWebClientStateHolderManager";

export interface IClientStateApi {
  getClientStateData: () => IWebCSHolder;
  subscribeToChangeUpdates: (
    subFn: (clientState?: IWebCSHolder) => void
  ) => () => void;
}

export default ({ ClientStateHolderManager }: IWebFacade): IClientStateApi => ({
  getClientStateData: () => ClientStateHolderManager.CSHolder,

  subscribeToChangeUpdates: (subFn: (clientState?: IWebCSHolder) => void) => {
    ClientStateHolderManager.OnChange.Add(subFn);
    return () => ClientStateHolderManager.OnChange.Remove(subFn);
  },
});
