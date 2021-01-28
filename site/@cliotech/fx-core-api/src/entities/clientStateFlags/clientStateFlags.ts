import {
  types,
  ISimpleType,
  Instance,
  SnapshotIn,
  getEnv,
  applySnapshot,
} from "mobx-state-tree";
import { IWebECSFlagStates } from "../../facade/enums/IWebECSFlagStates";
import { mobxNumericEnum } from "../../utils/mobxEnumWrapper";
import { IApi } from "../../api";
import { pickBy, identity } from "lodash-es";

const ClientStateFlags = types
  .model({
    exposureCoverage: types.maybe<ISimpleType<IWebECSFlagStates>>(
      mobxNumericEnum(IWebECSFlagStates)
    ),
    equityAlert: types.maybe(types.number),
    exposureAlert: types.maybe<ISimpleType<IWebECSFlagStates>>(
      mobxNumericEnum(IWebECSFlagStates)
    ),
    marketState: types.maybe<ISimpleType<IWebECSFlagStates>>(
      mobxNumericEnum(IWebECSFlagStates)
    ),
    systemMode: types.maybe(types.number),
    limitMultiplier: types.maybe(types.string),
  })
  .views((self) => ({
    get isMarketCLosed() {
      return self.marketState === IWebECSFlagStates.NotActive;
    },
  }))
  .actions((self) => {
    const _self = self as IClientStateFlagsType;
    let unsubscribe: (() => void) | undefined;

    const afterCreate = () => {
      const { clientStateFlagsApi } = getEnv<IApi>(_self);

      _self.loadInitialData();

      unsubscribe = clientStateFlagsApi.subscribeToCSFlagManager(
        _self.handleUpdates
      );
    };

    const loadInitialData = () => {
      const { clientStateFlagsApi } = getEnv<IApi>(_self);
      const csFlags = clientStateFlagsApi.getCsFlags();
      applySnapshot(_self, pickBy(csFlags, identity));
    };

    const handleUpdates = (csFlags: IClientStateFlagsSnapshotIn) => {
      applySnapshot(_self, csFlags);
    };

    const onDestroy = () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

    return {
      afterCreate,
      onDestroy,
      loadInitialData,
      handleUpdates,
    };
  });

export interface IClientStateFlagsType
  extends Instance<typeof ClientStateFlags> {}
export interface IClientStateFlagsSnapshotIn
  extends SnapshotIn<typeof ClientStateFlags> {}

export default ClientStateFlags;
