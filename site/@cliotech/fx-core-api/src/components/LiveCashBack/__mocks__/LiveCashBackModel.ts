export const mockData = {
  isAdvancedView: true,
  maxCashBack: 15000,
  volumeUsd: 15000,
  accumulatedVolumeUsd: 15000,
  cashBack: 1000,
};

export const useCashBackData = jest.fn().mockImplementation(() => mockData);

export const useAnimateCashback = jest.fn().mockImplementation(() => false);
