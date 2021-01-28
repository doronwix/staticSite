import { Instance, SnapshotIn, types } from "mobx-state-tree";
import AppConfig from "./entities/appConfig";
import ClientState from "./entities/clientState";
import Customer from "./entities/customer";
import Portofolio from "./entities/portofolio";
import CustomerProfile from "./entities/profile";
import Bonus from "./entities/bonus";
import Dictionary from "./entities/dictionary/Dictionary";
import Dialog from "./entities/dialog/Dialog";
import SystemInfo from "./entities/systemInfo";
import UserFlow from "./entities/userFlow/UserFlow";
import { PresetsAndCategories } from "./entities/PresetsAndCategories/PresetsAndCategories";
import ClientStateFlags from "./entities/clientStateFlags/clientStateFlags";
import DirectApi from "./entities/directApi";

const Store = types.model({
  appConfig: AppConfig,
  clientState: ClientState,
  customer: Customer,
  customerProfile: CustomerProfile,
  portofolio: Portofolio,
  bonus: Bonus,
  dictionary: Dictionary,
  dialog: Dialog,
  systemInfo: SystemInfo,
  userFlow: UserFlow,
  presetsAndCategories: PresetsAndCategories,
  clientStateFlags: ClientStateFlags,
  directApi: DirectApi,
});

export interface IDataStoreType extends Instance<typeof Store> {}
export interface IDataStoreSnapshotIn extends SnapshotIn<typeof Store> {}

export default Store;
