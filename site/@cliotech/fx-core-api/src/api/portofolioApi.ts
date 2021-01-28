import { IWebPortofolio } from "../facade/IWebPortofolioStaticManager";
import { IWebFacade } from "../facade/IWebFacade";

export interface IPortofolioApi {
  getPortofolioData: () => IWebPortofolio;
  subscribeToChangeUpdates: (
    subFn: (portofolio?: IWebPortofolio) => void
  ) => () => void;
}

export default ({ PortofolioStaticManager }: IWebFacade): IPortofolioApi => ({
  getPortofolioData: () => PortofolioStaticManager.Portfolio,

  subscribeToChangeUpdates: (subFn: (portofolio?: IWebPortofolio) => void) => {
    PortofolioStaticManager.OnChange.Add(subFn);
    return () => PortofolioStaticManager.OnChange.Remove(subFn);
  },
});
