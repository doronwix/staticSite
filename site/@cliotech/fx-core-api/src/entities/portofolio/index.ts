import { getEnv, Instance, SnapshotIn, types } from "mobx-state-tree";
import { IApi } from "../../api";
import { IWebPortofolio } from "../../facade/IWebPortofolioStaticManager";

const Portofolio = types
  .model({
    amlStatus: types.optional(types.number, 0),
    cddStatus: types.optional(types.number, 0),
    isActive: types.optional(types.boolean, false),
    isDemo: types.optional(types.boolean, false),
    kycReviewStatus: types.optional(types.number, 0),
    kycStatus: types.optional(types.number, 0),
    maxExposure: types.optional(types.string, "0"),
    pendingBonus: types.optional(types.string, "0"),
    pendingBonusType: types.optional(types.number, 0),
    pendingWithdrawals: types.optional(types.string, "0"),
    pepStatus: types.optional(types.number, 0),
    securities: types.optional(types.string, "0"),
    spreadDiscountVolumePercentage: types.optional(types.number, 0),
    tradingBonus: types.optional(types.string, "0"),
  })
  .actions((anySelf) => {
    const self = anySelf as IPortofolioType;

    let unsubscribe: () => void | null;

    const afterCreate = () => {
      const { portofolioApi } = getEnv(self) as IApi;

      self.updatePortofolioData(portofolioApi.getPortofolioData());

      unsubscribe = portofolioApi.subscribeToChangeUpdates(
        self.updatePortofolioData
      );
    };

    const updatePortofolioData = (portofolio?: IWebPortofolio) => {
      Object.assign(self, portofolio);
    };

    const onDestroy = () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

    return {
      afterCreate,
      onDestroy,
      updatePortofolioData,
    };
  });

export interface IPortofolioType extends Instance<typeof Portofolio> {}
export interface IPortofolioSnapshotIn extends SnapshotIn<typeof Portofolio> {}

export default Portofolio;
