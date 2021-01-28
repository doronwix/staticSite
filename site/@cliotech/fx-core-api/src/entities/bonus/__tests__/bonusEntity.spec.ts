import Bonus from "../index";
import { mock } from "jest-mock-extended";
import { IWebBonusData } from "../../../facade/IWebBonusManager";
import { IBonusApi } from "../../../api/bonusApi";

const bonusApi = mock<IBonusApi>();

const mockData1: IWebBonusData = {
  volumeUsd: 1,
  accumulatedVolumeUsd: 15,
  amountBase: 12,
  amountGivenBase: 15,
  endDate: "1",
  startDate: "2",
};

let subs: any[] = [];

describe("Bonus Store", () => {
  afterEach(() => {
    subs = [];
    bonusApi.getBonusData.mockClear();
  });

  it("should call loadBonusData & subscribeToChangeUpdates after creation", () => {
    const bonusStore = Bonus.create({}, { bonusApi });
    expect(bonusApi.subscribeToChangeUpdates).toHaveBeenCalledWith(
      bonusStore.subscriptionFunction
    );
    expect(bonusApi.getBonusData).toHaveBeenCalled();
  });

  it("should unsubscribe onDestroy", () => {
    bonusApi.subscribeToChangeUpdates.mockImplementationOnce((subFn: any) => {
      subs.push(subFn);
      return () => {
        subs.splice(subs.indexOf(subFn), 1);
      };
    });
    const bonusStore = Bonus.create({}, { bonusApi });

    expect(subs.length).toBe(1);
    bonusStore.onDestroy();
    expect(subs.length).toBe(0);
  });

  it("loadBonusData, should call api and update data", () => {
    bonusApi.getBonusData.mockImplementationOnce(() => mockData1);
    bonusApi.getBonusData.mockImplementationOnce(() => ({
      ...mockData1,
      volumeUsd: 2,
    }));
    const bonusStore = Bonus.create({}, { bonusApi });

    expect(bonusStore.volumeUsd).toBe(1);
    bonusStore.loadBonusData();
    expect(bonusStore.volumeUsd).toBe(2);
    expect(bonusApi.getBonusData).toHaveBeenCalledTimes(2);
  });
});
