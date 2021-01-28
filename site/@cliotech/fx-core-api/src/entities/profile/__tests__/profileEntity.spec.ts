import CustomerProfile from "../index";
import { ICustomerProfileApi } from "../../../api/customerProfileApi";
import { IStateObjectApi } from "../../../api/stateObjectApi";
import { IWebProfileCustomerData } from "../../../facade/IWebCustomerProfileManager";
import { IWebStateObject } from "../../../facade/IWebStateObjectStore";
import { IWebDealerParams } from "../../../facade/IWebDealerParams";

const customerProfileApi: jest.Mocked<ICustomerProfileApi> = {
  getProfile: jest.fn<IWebProfileCustomerData, any>(() => ({
    advancedWalletView: 1,
    demoDepositAmount: 100,
  })),
  toggleAdvancedView: jest.fn(),
  setLastSelectedPreset: jest.fn((_id: number) => {
    return;
  }),
};

const dealerMock = {
  get: jest.fn(),
  unset: jest.fn(),
  getAll: jest.fn(),
  subscribe: jest.fn(),
  update: jest.fn(),
  set: jest.fn(),
  containsKey: jest.fn(),
  clear: jest.fn(),
};

const stateObjectApi: jest.Mocked<IStateObjectApi> = {
  getDealerParams: jest.fn<IWebStateObject<IWebDealerParams>, any>(
    () => dealerMock
  ),
  getUserFlow: jest.fn(),
  subScribeToUserFlow: jest.fn(),
};

describe("Customer Profile store", () => {
  it("should call getDealerParams and getProfile of customer and state apis", () => {
    const store = CustomerProfile.create(
      {},
      {
        customerProfileApi,
        stateObjectApi,
      }
    );
    expect(customerProfileApi.getProfile).toHaveBeenCalled();

    expect(dealerMock.get).toHaveBeenCalled();
    expect(store.advancedWalletView).toBe(true);
  });

  it("toggleAdvancedView should change advancedWalletView", () => {
    const store = CustomerProfile.create(
      {},
      { customerProfileApi, stateObjectApi }
    );

    expect(store.advancedWalletView).toBe(true);
    store.toggleAdvancedView();
    expect(store.advancedWalletView).toBe(false);
  });
});
