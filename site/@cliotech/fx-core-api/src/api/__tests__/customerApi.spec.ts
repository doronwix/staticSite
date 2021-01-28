import customerApi from "../customerApi";
import { IWebFacade } from "../../facade/IWebFacade";
import { IWebCustomer } from "../../facade/IWebCustomer";
import { mock } from "jest-mock-extended";

const selectedCcyIdMock = jest.fn<number, any>(() => 4);

const CustomerMock = mock<IWebCustomer>();
CustomerMock.prop = {
  abTestings: {
    configuration: {},
    groupsNames: [],
    testsNames: [],
  },
  isDemo: true,
  accountNumber: 14,
  customerType: 1,
  maintenanceMarginPercentage: 14,
  minPctEQXP: "13",
  // ugly hack ... we're not mocking the whole observable, just the return value of the call
  selectedCcyId: selectedCcyIdMock as any,
  userName: "Name",
};

const facade = mock<IWebFacade>();
facade.Customer = CustomerMock;

describe("Customer Api", () => {
  it("getCustomerData to return formated data on IWebCustomer", () => {
    const api = customerApi(facade);
    const data = api.getCustomerData();

    expect(data).toStrictEqual({
      ...CustomerMock.prop,
      selectedCcyId: CustomerMock.prop.selectedCcyId(),
    });
  });
});
