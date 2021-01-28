import { mock } from "jest-mock-extended";
import { IPortofolioApi } from "../portofolioApi";

const portofolioApi = mock<IPortofolioApi>();

export const unsubFn = jest.fn();

portofolioApi.getPortofolioData.mockImplementation(() => ({
  amlStatus: 1,
  maxExposure: "1000",
  cddStatus: 1,
  isActive: true,
  isDemo: true,
  kycReviewStatus: 1,
  kycStatus: 1,
  pendingBonus: "1000",
  pendingBonusType: 1,
  pendingWithdrawals: "1000",
  pepStatus: 1,
  securities: "1000",
  spreadDiscountVolumePercentage: 14,
  tradingBonus: "1000",
}));

portofolioApi.subscribeToChangeUpdates.mockImplementation(() => unsubFn);

export default () => portofolioApi;
