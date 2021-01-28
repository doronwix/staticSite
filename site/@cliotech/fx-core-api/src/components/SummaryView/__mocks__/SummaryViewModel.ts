import { IViewInjectedProps } from "../SummaryViewModel";

export const baseMockData = {
  accountBalance: "1500",
  advancedWalletView: false,
  availableMargin: "1500",
  cashBackVisibility: true,
  equity: "1500",
  exposureCoverage: "15000",
  financialSummaryDetailsVisibility: true,
  getValue: jest.fn(),
  isActive: true,
  isDemo: false,
  isValidExposureCoverage: true,
  maintenanceMargin: "15000",
  maintenanceMarginPercentage: 15,
  maintenanceMarginVisibility: true,
  marginLevel: { value: 150, isVisible: true },
  marginUtilizationPercentage: "150",
  maxExposure: "1500",
  minPctEQXP: "1500",
  netExposure: "1500",
  openPL: "1500",
  pendingBonusCss: true,
  pendingWithdrawals: "1500",
  pendingWithdrawalsVisibility: true,
  showAvailableMargin: jest.fn(),
  showCashBack: jest.fn(),
  showDetailedMarginStatus: jest.fn(),
  showExposureSummary: jest.fn(),
  showUsedMargin: jest.fn(),
  totalEquity: "15000",
  tradingBonus: "15000",
  tradingBonusVisibility: true,
  useRedirectToForm: jest.fn(),
  useSwitchViewVisible: jest.fn(),
  useToggleAdvancedView: jest.fn(),
  usedMargin: "15000",
  usedMarginVisibility: true,
};

export const useSummaryStoreData = jest
  .fn<IViewInjectedProps, []>()
  .mockImplementation(() => baseMockData);
