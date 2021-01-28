import { mock } from "jest-mock-extended";
import { ICustomerApi } from "../customerApi";
import { ICustomerSnapshotIn } from "../../entities/customer";

const customerApi = mock<ICustomerApi>();

export const customerData: ICustomerSnapshotIn = {
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

// this is a fully mocked knockout subscription - no value, no nothing, no behaviour

export const unsub = mock<KnockoutSubscription>();

customerApi.getCustomerData.mockImplementation(() => customerData);
// as the subscription won't actually create a subscription, just our mocked function, maybe we need to test the dispose method on it
customerApi.subscribeToCcyIdChanges.mockImplementation(() => unsub);

export default () => customerApi;
