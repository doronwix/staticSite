import { getEnv, Instance, SnapshotIn, types } from "mobx-state-tree";
import { IApi } from "../../api";

import { IWebABTestings } from "../../facade/IWebCustomer";

const Customer = types
  .model({
    abTestings: types.maybe(types.frozen<IWebABTestings>()),
    accountNumber: types.maybe(types.number),
    customerType: types.maybe(types.number),
    maintenanceMarginPercentage: types.optional(types.number, 0),
    minPctEQXP: types.optional(types.string, ""),
    selectedCcyId: types.maybe(types.number),
    userName: types.maybe(types.string),
    isDemo: types.optional(types.boolean, false),
    brokerAllowLimitsOnNoRates: types.optional(types.boolean, false),
  })
  .actions((anySelf) => {
    const self = anySelf as ICustomerType;
    let subscription: KnockoutSubscription | null | undefined;

    const afterCreate = () => {
      self.loadCustomerData();
      subscription = self.subscribeToCcyChanges();
    };

    const loadCustomerData = () => {
      const { customerApi } = getEnv(self) as IApi;
      Object.assign(self, customerApi.getCustomerData());
    };

    const subscribeToCcyChanges = () => {
      const { customerApi } = getEnv(self) as IApi;

      return customerApi.subscribeToCcyIdChanges(self.updateCCyId);
    };

    const updateCCyId = (val: number) => {
      self.selectedCcyId = val;
    };

    const onDestroy = () => {
      if (subscription) {
        subscription.dispose();
      }
    };

    return {
      afterCreate,
      loadCustomerData,
      subscribeToCcyChanges,
      updateCCyId,
      onDestroy,
    };
  });

export interface ICustomerType extends Instance<typeof Customer> {}
export interface ICustomerSnapshotIn extends SnapshotIn<typeof Customer> {}

export default Customer;
