import { IWebTDelegate } from "./IWebTDelegate";
import { IWebEPendingBonusType } from "./enums/IWebEPendingBonusType";

export interface IWebPortofolio {
  maxExposure: string;
  securities: string;
  tradingBonus: string;
  pendingBonus: string;
  pendingWithdrawals: string;
  kycStatus: number;
  amlStatus: number;
  cddStatus: number;
  kycReviewStatus: number;
  isDemo: boolean;
  isActive: boolean;
  pepStatus: number;
  pendingBonusType: IWebEPendingBonusType;
  spreadDiscountVolumePercentage: number;
}

export interface IWebPortofolioStaticManager {
  OnChange: IWebTDelegate<IWebPortofolio>;
  Portfolio: IWebPortofolio;
  ProcessData: (data: Array<any>) => void;
}
