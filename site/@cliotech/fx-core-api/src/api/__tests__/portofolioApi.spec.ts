import portofolioApi from "../portofolioApi";
import { IWebPortofolioStaticManager } from "../../facade/IWebPortofolioStaticManager";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const PortofolioStaticManagerMock = mock<IWebPortofolioStaticManager>(
  {},
  { deep: true }
);

PortofolioStaticManagerMock.Portfolio = {
  amlStatus: 1,
  cddStatus: 1,
  isActive: false,
  isDemo: false,
  kycReviewStatus: 1,
  kycStatus: 1,
  pendingBonus: "125",
  maxExposure: "125",
  pendingBonusType: 1,
  pendingWithdrawals: "125",
  pepStatus: 1,
  securities: "124",
  spreadDiscountVolumePercentage: 13,
  tradingBonus: "15",
};

const facade = mock<IWebFacade>();

facade.PortofolioStaticManager = PortofolioStaticManagerMock;

describe("Portofolio Api", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("getPortofolioData should retreive Portofolio off manager", () => {
    const api = portofolioApi(facade);
    expect(api.getPortofolioData()).toEqual(
      PortofolioStaticManagerMock.Portfolio
    );
  });

  it("subscribe to change updates should add passed fn to OnChange", () => {
    const subFn = jest.fn();
    const api = portofolioApi(facade);
    api.subscribeToChangeUpdates(subFn);
    expect(PortofolioStaticManagerMock.OnChange.Add).toHaveBeenCalledWith(
      subFn
    );
  });

  it("unsubscribe should remove passed fn from onChange", () => {
    const subFn = jest.fn();
    const api = portofolioApi(facade);
    const unsub = api.subscribeToChangeUpdates(subFn);
    expect(PortofolioStaticManagerMock.OnChange.Add).toHaveBeenCalledWith(
      subFn
    );
    unsub();
    expect(PortofolioStaticManagerMock.OnChange.Remove).toHaveBeenCalledWith(
      subFn
    );
  });
});
