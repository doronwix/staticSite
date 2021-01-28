import { getEnv, types, SnapshotIn, Instance } from "mobx-state-tree";
import { IApi } from "../../api";

const SystemInfo = types.model({}).actions((_self) => {
  const { systemInfoApi } = getEnv<IApi>(_self);
  const get = systemInfoApi.get;

  const save = systemInfoApi.save;

  return {
    get,
    save,
  };
});

export interface ISystemInfoSnapshotIn extends SnapshotIn<typeof SystemInfo> {}

export interface ISystemInfoType extends Instance<typeof SystemInfo> {}

export default SystemInfo;
