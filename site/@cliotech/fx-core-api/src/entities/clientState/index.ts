import { getEnv, Instance, SnapshotIn, types } from "mobx-state-tree";
import { IApi } from "../../api";
import { IWebCSHolder } from "../../facade/IWebClientStateHolderManager";

const ClientState = types
  .model({
    accountBalance: types.optional(types.string, "0"),
    equity: types.optional(types.string, "0"),
    netExposure: types.optional(types.string, "0"),
    margin: types.optional(types.string, "0"),
    exposureCoverage: types.optional(types.string, "0"),
    totalEquity: types.optional(types.string, "0"),
    openPL: types.optional(types.string, "0"),
    usedMargin: types.optional(types.string, "0"),
    marginUtilizationPercentage: types.optional(types.string, "0"),
    availableMargin: types.optional(types.string, "0"),
    marginUtilizationStatus: types.optional(types.number, 0),
    maintenanceMargin: types.optional(types.string, "0"),
  })
  .actions((anySelf) => {
    const self = anySelf as IClientStateType;
    let unsubscribe: () => void | null;

    const afterCreate = () => {
      const { clientStateApi } = getEnv(self) as IApi;

      self.setClientStateData(clientStateApi.getClientStateData());

      unsubscribe = clientStateApi.subscribeToChangeUpdates(
        self.setClientStateData
      );
    };

    const setClientStateData = (clientState?: IWebCSHolder) => {
      if (clientState) {
        Object.assign(self, clientState);
      }
    };

    const onDestroy = () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    return {
      afterCreate,
      onDestroy,
      setClientStateData,
    };
  });

export interface IClientStateType extends Instance<typeof ClientState> {}
export interface IClientStateSnapshotIn
  extends SnapshotIn<typeof ClientState> {}

export default ClientState;
