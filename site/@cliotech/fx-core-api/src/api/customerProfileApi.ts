import { IWebProfileCustomerData } from "../facade/IWebCustomerProfileManager";
import { IWebFacade } from "../facade/IWebFacade";

export interface ICustomerProfileApi {
  toggleAdvancedView: (isAdvanced: boolean) => void;
  getProfile: () => IWebProfileCustomerData;
  setLastSelectedPreset: (presetId: number) => void;
}

export default ({
  CustomerProfileManager,
}: IWebFacade): ICustomerProfileApi => ({
  toggleAdvancedView: (isAdvanced: boolean) => {
    const profile = CustomerProfileManager.ProfileCustomer() as IWebProfileCustomerData;

    CustomerProfileManager.ProfileCustomer({
      ...profile,
      advancedWalletView: isAdvanced ? 1 : 0,
    });
  },
  getProfile: () => {
    const profile = CustomerProfileManager.ProfileCustomer() as IWebProfileCustomerData;
    return profile;
  },

  setLastSelectedPreset: (presetId: number) => {
    CustomerProfileManager.LastSelectedPresetId(presetId);
  },
});
