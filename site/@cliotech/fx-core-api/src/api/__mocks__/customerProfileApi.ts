import { mock } from "jest-mock-extended";
import { ICustomerProfileApi } from "../customerProfileApi";

const customerProfileApi = mock<ICustomerProfileApi>();

/**
 * just enough mock data so the store can init
 * you can provide manual mocks on a per test basis or change the default
 * make sure all tests run though if you do that
 */
customerProfileApi.getProfile.mockImplementation(() => ({
  advancedWalletView: 1,
  demoDepositAmount: 123,
}));

export default () => customerProfileApi;
