import { IClientStateFlagsSnapshotIn } from "../entities/clientStateFlags/clientStateFlags";
import { IWebFacade } from "../facade/IWebFacade";

export interface IClientStateFlagsApi {
  subscribeToCSFlagManager: (
    cb: (data: IClientStateFlagsSnapshotIn) => void
  ) => () => void;
  getCsFlags: () => IClientStateFlagsSnapshotIn;
}

export default ({
  ClientStateFlagsManager,
}: IWebFacade): IClientStateFlagsApi => {
  const subscribeToCSFlagManager = (
    cb: (data: IClientStateFlagsSnapshotIn) => void
  ) => {
    ClientStateFlagsManager.OnChange.Add(cb);
    return () => ClientStateFlagsManager.OnChange.Remove(cb);
  };

  const getCsFlags = () => {
    return ClientStateFlagsManager.CSFlags;
  };

  return {
    subscribeToCSFlagManager,
    getCsFlags,
  };
};
