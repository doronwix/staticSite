import { IWebECta } from "../facade/enums/IWebECta";
import { IWebFacade } from "../facade/IWebFacade";

export interface IUserFlowCTAApi {
  getUserFlowAction: (cta?: IWebECta) => () => void;
}

const userFlowCTAApi = (facet: IWebFacade) => ({
  getUserFlowAction: (cta?: IWebECta) => {
    if (cta) {
      return facet.UserFlowCTA.getUserFlowAction(cta);
    } else {
      return () => ({});
    }
  },
});

export default userFlowCTAApi;
