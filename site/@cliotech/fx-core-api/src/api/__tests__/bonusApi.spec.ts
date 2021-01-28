import bonusApi from "../bonusApi";
import { IWebBonusManager, IWebBonusData } from "../../facade/IWebBonusManager";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const bonusData = {
  volumeUsd: 12,
  amountBase: 14,
  amountGivenBase: 15,
  startDate: "",
  endDate: "",
  accumulatedVolumeUsd: 14,
};

const BonusManagerMock = mock<IWebBonusManager>({}, { deep: true });
BonusManagerMock.bonus.mockImplementation(() => bonusData);

const facade = mock<IWebFacade>();
facade.BonusManager = BonusManagerMock;

describe("bonusApi", () => {
  it("getBonusData should call bonus on BonusManager", () => {
    const api = bonusApi(facade);
    expect(api.getBonusData()).toStrictEqual(bonusData);
  });

  it("subscriing to change updates should call onchange.add on bonusManager", () => {
    const api = bonusApi(facade);

    api.subscribeToChangeUpdates(() => ({}));
    expect(BonusManagerMock.onChange.Add).toHaveBeenCalled();
  });

  it("calling the return of subscription should call onchange.remove on bonus manager", () => {
    const api = bonusApi(facade);

    const unsub = api.subscribeToChangeUpdates(() => ({}));
    unsub();
    expect(BonusManagerMock.onChange.Remove).toHaveBeenCalled();
  });
});
