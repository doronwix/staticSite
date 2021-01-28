import { types, Instance, getEnv, SnapshotIn } from "mobx-state-tree";
import { IApi } from "../../api";
import { IWebBonusData } from "../../facade/IWebBonusManager";

const Bonus = types
  .model({
    volumeUsd: types.optional(types.number, 0),
    amountBase: types.optional(types.number, 0),
    amountGivenBase: types.optional(types.number, 0),
    startDate: types.optional(types.string, ""),
    endDate: types.optional(types.string, ""),
    accumulatedVolumeUsd: types.optional(types.number, 0),
  })
  .actions((anySelf) => {
    const self = anySelf as IBonusType;
    let unsubscribe: () => void | null;

    const afterCreate = () => {
      self.loadBonusData();
      const { bonusApi } = getEnv(self) as IApi;
      unsubscribe = bonusApi.subscribeToChangeUpdates(
        self.subscriptionFunction
      );
    };

    const loadBonusData = () => {
      const { bonusApi } = getEnv(self) as IApi;
      const data = bonusApi.getBonusData();

      Object.assign(self, data);
    };

    const subscriptionFunction = (bonusData: IWebBonusData) => {
      Object.assign(self, bonusData);
    };

    const onDestroy = () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

    return {
      afterCreate,
      subscriptionFunction,
      onDestroy,
      loadBonusData,
    };
  });

export interface IBonusType extends Instance<typeof Bonus> {}
export interface IBonusSnapshotIn extends SnapshotIn<typeof Bonus> {}

export default Bonus;
