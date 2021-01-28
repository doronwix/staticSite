import Customer from "../index";
import { ICustomerApi } from "../../../api/customerApi";
import { getSnapshot } from "mobx-state-tree";

const customerApi: jest.Mocked<ICustomerApi> = {
  getCustomerData: jest.fn(),
  subscribeToCcyIdChanges: jest.fn(),
};
describe("Customer Entity", () => {
  it("should load customer data after creation", () => {
    const mockData = {
      accountNumber: 12,
      customerType: 1,
      maintenanceMarginPercentage: 13,
      brokerAllowLimitsOnNoRates: false,
      minPctEQXP: "something",
      selectedCcyId: 4,
      userName: "Doron",
      abTestings: undefined,
      isDemo: false,
    };
    customerApi.getCustomerData.mockImplementationOnce(() => mockData);
    const customerStore = Customer.create({}, { customerApi });

    expect(getSnapshot(customerStore)).toStrictEqual(mockData);
    expect(customerApi.getCustomerData).toHaveBeenCalled();
  });
});
