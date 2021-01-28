import {
  types,
  Instance,
  SnapshotIn,
  getEnv,
  IArrayType,
} from "mobx-state-tree";
import { PresetCategory } from "../category/PresetCategory";
import { PresetSubCategory } from "../subCategory/PresetSubCategory";
import { WithRefsModelType } from "../../util";
import { IApi } from "../../../api";
import { Instrument } from "../instrument/instrument";
import { IWebERegistrationListName } from "../../../facade/enums/IWebERegistrationListName";

export const Preset = types
  .model({
    id: types.identifierNumber,
    name: types.string,
    instrumentType: types.number,
    category: types.reference(types.late((): any => PresetCategory)),
    subCategory: types.reference(types.late((): any => PresetSubCategory)),
    categoryOrder: types.number,
    presetsOrder: types.number,
    isSearchPreset: types.boolean,
    instruments: types.array(
      types.reference(types.late((): any => Instrument))
    ),
  })
  .views((self) => ({
    get isFavoritesPreset() {
      return self.id === 0;
    },
  }))
  .actions((self) => {
    const _self = self as IPresetType;

    const onDestroy = () => {
      /**
       * if we somehow DELETE a preset (via delta updates) but it happens to be selected
       * we let the category handle it - see implementation of `handleSelectedPresetDeleted` on category
       */
      if (_self.category.lastSelectedPreset === _self.id) {
        _self.category.handleSelectedPresetDeleted();
      }
    };

    const propagateSelectionToWeb = () => {
      const { customerProfileApi, registrationApi } = getEnv<IApi>(self);
      registrationApi.update(
        IWebERegistrationListName.QuotesTable,
        _self.instruments.map((instrument) => [instrument.id])
      );
      customerProfileApi.setLastSelectedPreset(_self.id);
    };

    const select = () => {
      _self.propagateSelectionToWeb();
    };

    const directSelect = () => {
      _self.category.selectFromPreset(_self.id);
      _self.propagateSelectionToWeb();
    };

    return {
      onDestroy,
      select,
      directSelect,
      propagateSelectionToWeb,
    };
  });

interface IRefs {
  category: typeof PresetCategory;
  subCategory: typeof PresetSubCategory;
  instruments: IArrayType<typeof Instrument>;
}

export interface IPresetType
  extends Instance<WithRefsModelType<typeof Preset, IRefs>> {}

export interface IPresetSnapshotIn extends SnapshotIn<typeof Preset> {}
