export interface IWebProfileCustomerData {
  advancedWalletView: 1 | 0;
  demoDepositAmount: number;
}

export interface IWebCustomerProfileManager {
  ProfileCustomer: (
    profileCustomer?: IWebProfileCustomerData
  ) => IWebProfileCustomerData | void;
  LastSelectedPresetId: (preset: number) => void;
}
