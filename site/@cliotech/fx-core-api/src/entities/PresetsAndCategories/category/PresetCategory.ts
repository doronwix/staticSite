import { types, Instance, SnapshotIn, getParentOfType } from "mobx-state-tree";

import { PresetSubCategory } from "../subCategory/PresetSubCategory";
import { Preset } from "../preset/preset";
import { PresetsAndCategories } from "../PresetsAndCategories";
import { WithRefsModelType } from "../../util";

export const PresetCategory = types
  .model({
    id: types.identifier,
    /**
     * !IMPORTANT: we use `safeReference` for Presets, to allow MST to assist in cleanup
     * if we somehow delete a preset that was `safeReferenced` here, mobx will handle removing it from array
     */
    presets: types.array(types.safeReference(types.late((): any => Preset))),
    // label goes to views and we use dictionary
    label: types.string,

    /**
     * same as above
     * TODO: investigate `safeReference` api, I suspect MST will have an API to tell how to handle safeReferences in case of deletion
     * in which case we won't have to handle deletion of selected preset in the actual preset, but here, where the reference is assigned
     */
    lastSelectedPreset: types.maybe(
      types.safeReference(types.late((): any => Preset))
    ),
    subCategories: types.array(PresetSubCategory),
  })
  .actions((self) => {
    const _self = self as IPresetCategoryType;

    /**
     * this is called by a child preset if it's being deleted while being selected
     * our default behaviour is to select the first preset on this category
     * TODO: if that's not possible, no presets available on category, we need to change selected category
     * we could use `getParentOfType` getParentOfType(self, PresetsAndCategories)
     * and call the update selected category there
     */
    const handleSelectedPresetDeleted = () => {
      self.presets[0].select();
    };

    const select = () => {
      const presetsAndCategories = getParentOfType(_self, PresetsAndCategories);

      if (
        presetsAndCategories.selectedCategory &&
        presetsAndCategories.selectedCategory.id === _self.id
      ) {
        return;
      }

      if (_self.lastSelectedPreset) {
        _self.lastSelectedPreset.select();
      } else {
        _self.lastSelectedPreset = _self.presets[0].id;
        _self.presets[0].select();
      }

      presetsAndCategories.updateSelectedCategory(_self.id);
    };

    const selectFromPreset = (presetId: number) => {
      _self.lastSelectedPreset = presetId as any;

      const presetsAndCategories = getParentOfType(_self, PresetsAndCategories);

      if (
        presetsAndCategories.selectedCategory &&
        presetsAndCategories.selectedCategory.id === _self.id
      ) {
        return;
      }

      presetsAndCategories.updateSelectedCategory(_self.id);
    };

    return {
      handleSelectedPresetDeleted,
      select,
      selectFromPreset,
    };
  });

interface IRefs {
  lastSelectedPreset: typeof Preset;
}

export interface IPresetCategoryType
  extends Instance<WithRefsModelType<typeof PresetCategory, IRefs>> {}
export interface IPresetCategorySnapshotIn
  extends SnapshotIn<typeof PresetCategory> {}
