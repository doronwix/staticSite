import { getEnv, Instance, types, SnapshotIn } from "mobx-state-tree";
import { IApi } from "../../api";

const CustomerProfile = types
  .model({
    advancedWalletView: types.optional(types.boolean, false),
    demoDepositAmount: types.maybe(types.number),
  })
  .actions((anySelf) => {
    const self = anySelf as ICustomerProfileType;

    const afterCreate = () => {
      self.setInitialData();
    };

    const setInitialData = () => {
      const { customerProfileApi, stateObjectApi } = getEnv(self) as IApi;

      const profile = customerProfileApi.getProfile();

      Object.assign(self, {
        ...profile,
        advancedWalletView:
          !!stateObjectApi.getDealerParams().get("dealerAdvancedWalletView") ||
          profile.advancedWalletView === 1,
      });
    };

    const toggleAdvancedView = () => {
      const { customerProfileApi } = getEnv(self) as IApi;

      self.advancedWalletView = !self.advancedWalletView;

      customerProfileApi.toggleAdvancedView(self.advancedWalletView);
    };

    return {
      toggleAdvancedView,
      afterCreate,
      setInitialData,
    };
  });

export interface ICustomerProfileType
  extends Instance<typeof CustomerProfile> {}

export interface ICustomerProfileSnapshotIn
  extends SnapshotIn<typeof CustomerProfile> {}

export default CustomerProfile;
