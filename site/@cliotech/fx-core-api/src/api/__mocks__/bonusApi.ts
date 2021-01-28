import { IBonusApi } from "../bonusApi";
import { mock } from "jest-mock-extended";

export const unsubFunc = jest.fn();

const bonusApi = mock<IBonusApi>();

bonusApi.subscribeToChangeUpdates.mockImplementation(() => unsubFunc);
bonusApi.getBonusData.mockImplementation(() => ({
  accumulatedVolumeUsd: 1500,
  amountBase: 1500,
  amountGivenBase: 1500,
  endDate: "",
  startDate: "",
  volumeUsd: 1500,
}));

export default () => bonusApi;
