import { types } from "mobx-state-tree";

const WalletConfiguration = types.model({
  formatConditionalVolume: types.optional(types.boolean, false),
  useAdvancedView: types.optional(types.boolean, true),
  supressDialog: types.optional(types.boolean, false),
  isVisibleUsedMargin: types.optional(types.boolean, false),
});

export default WalletConfiguration;
