import profileApi from "../customerProfileApi";
import {
  IWebProfileCustomerData,
  IWebCustomerProfileManager,
} from "../../facade/IWebCustomerProfileManager";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const mockProfile1: IWebProfileCustomerData = {
  advancedWalletView: 1,
  demoDepositAmount: 100,
};

const mockProfile2: IWebProfileCustomerData = {
  advancedWalletView: 0,
  demoDepositAmount: 100,
};

const CustomerProfileManagerMock = mock<IWebCustomerProfileManager>();

const facade = mock<IWebFacade>();
facade.CustomerProfileManager = CustomerProfileManagerMock;

describe("ProfileApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getProfile should call CustomerProfileManager and return profile", () => {
    const api = profileApi(facade);

    CustomerProfileManagerMock.ProfileCustomer.mockImplementationOnce(
      () => mockProfile1
    );

    expect(api.getProfile()).toStrictEqual(mockProfile1);
    expect(CustomerProfileManagerMock.ProfileCustomer).toHaveBeenCalledTimes(1);
  });

  it("toggleAdvancedView should call ProfileCustomer with new value", () => {
    const api = profileApi(facade);

    CustomerProfileManagerMock.ProfileCustomer.mockImplementationOnce(
      () => mockProfile1
    );
    api.toggleAdvancedView(true);
    expect(CustomerProfileManagerMock.ProfileCustomer).toHaveBeenCalledWith(
      mockProfile1
    );

    CustomerProfileManagerMock.ProfileCustomer.mockImplementationOnce(
      () => mockProfile2
    );
    api.toggleAdvancedView(false);
    expect(CustomerProfileManagerMock.ProfileCustomer).toHaveBeenCalledWith(
      mockProfile2
    );
  });
});
