import { IWebECta } from "./enums/IWebECta";

export interface IWebUserFlowCTA {
  getUserFlowAction: (cta: IWebECta) => () => void;
}
