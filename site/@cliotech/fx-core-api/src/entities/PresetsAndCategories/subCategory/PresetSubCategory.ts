import { types, Instance, SnapshotIn } from "mobx-state-tree";
import { Preset } from "../preset/preset";

export const PresetSubCategory = types.model({
  id: types.identifier,
  columnId: types.number,
  label: types.string,
  order: types.number,
  sortAlphabetically: types.optional(types.boolean, false),
  presets: types.array(types.safeReference(types.late(() => Preset))),
});

export interface IPresetSubCategoryType
  extends Instance<typeof PresetSubCategory> {}
export interface IPresetSubCategorySnapshotIn
  extends SnapshotIn<typeof PresetSubCategory> {}
