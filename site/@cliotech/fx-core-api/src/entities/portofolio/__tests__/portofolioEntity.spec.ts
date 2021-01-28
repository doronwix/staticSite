import Portofolio from "../index";
import { getSnapshot } from "mobx-state-tree";
import { IWebPortofolio } from "../../../facade/IWebPortofolioStaticManager";
import buildApiWithFacade from "../../../api";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../../facade/IWebFacade";

import { unsubFn } from "../../../api/__mocks__/portofolioApi";

jest.mock("../../../api");

const facade = mock<IWebFacade>();

const api = buildApiWithFacade(facade);

describe("Portofolio store tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update portofolio data and subscribeToChange updates on creation", () => {
    const portofolioStore = Portofolio.create({}, api);

    expect(api.portofolioApi.getPortofolioData).toHaveBeenCalledTimes(1);
    expect(api.portofolioApi.subscribeToChangeUpdates).toHaveBeenCalledWith(
      portofolioStore.updatePortofolioData
    );
  });

  it("should run unsubscribe onDestroy", () => {
    const portofolioStore = Portofolio.create({}, api);
    expect(api.portofolioApi.subscribeToChangeUpdates).toHaveBeenCalledWith(
      portofolioStore.updatePortofolioData
    );
    portofolioStore.onDestroy();
    expect(unsubFn).toHaveBeenCalledTimes(1);
  });

  it("data in store should be updated when updatePortofolioData is called", () => {
    const portofolioStore = Portofolio.create({}, api);

    expect(portofolioStore.maxExposure).toBe("1000");

    const mockData = {
      amlStatus: 1,
      maxExposure: "3000",
      cddStatus: 4,
      isActive: false,
      isDemo: true,
      kycReviewStatus: 1,
      kycStatus: 1,
      pendingBonus: "4000",
      pendingBonusType: 1,
      pendingWithdrawals: "1000",
      pepStatus: 2,
      securities: "3000",
      spreadDiscountVolumePercentage: 14,
      tradingBonus: "1000",
    };
    portofolioStore.updatePortofolioData(mockData);

    const snapshot = getSnapshot(portofolioStore);

    expect(snapshot).toStrictEqual(mockData);
  });
});
