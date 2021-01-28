import { IWebFacade } from "../facade/IWebFacade";
import {
  buildCategoriesAndPresets,
  buildAdditionalPresetInfo,
} from "./presetsApi/methods";
import { IWebPresetsManagerData } from "../facade/IWebPresetsManager";
import { IPresetsAndCategoriesSnapshotIn } from "../entities/PresetsAndCategories/PresetsAndCategories";
import { IPresetSnapshotIn } from "../entities/PresetsAndCategories/preset/preset";

export interface IPresetsApi {
  getFavoriteInstruments: () => number[];
  getInitialSelectedPreset: () => number | undefined;
  subscribeToPresetManager: (
    cb: (presetData: IWebPresetsManagerData, presetList: number[]) => any
  ) => () => void;
  loadInitialPresetData: () => IPresetsAndCategoriesSnapshotIn | null;
  buildPresetInfo: (
    presets: number[]
  ) => {
    [key: number]: IPresetSnapshotIn;
  };
  FAVORITES_PRESET_ID: number;
}

export default (facade: IWebFacade): IPresetsApi => {
  const FAVORITES_PRESET_ID = 0;
  /**
   * this is the subscription function for DELTA updates
   * it can call getCurrentPresetData to get loaded preset list ids
   * and compare it with new data to compute delta
   */
  const subscribeToPresetManager = (
    cb: (presetData: IWebPresetsManagerData, presetList: number[]) => any
  ) => {
    facade.PresetsManager.OnPresetsUpdated.Add(cb);

    return () => facade.PresetsManager.OnPresetsUpdated.Remove(cb);
  };

  const buildPresetInfo = (presets: number[]) => {
    const newPresetInfo = buildAdditionalPresetInfo(
      facade.PresetsDefinitions,
      presets,
      facade.PresetTypes
    );

    return newPresetInfo;
  };

  /**
   * on initial load with START from preset definitions -> output full structure for entity
   */
  const loadInitialPresetData = () => {
    const presetList = facade.PresetsManager.GetPresetInstruments();
    if (presetList && Object.keys(presetList).length > 0) {
      return buildCategoriesAndPresets(
        facade.PresetsDefinitions,
        presetList,
        facade.PresetTypes,
        FAVORITES_PRESET_ID
      );
    }
    return null;
  };
  /**
   * get initial selected preset from initialdatamanager
   */
  const getInitialSelectedPreset = () => {
    return facade.InitialDataManager.prop.initialScreen.screenId;
  };

  const getFavoriteInstruments = () => {
    return facade.InitialDataManager.prop.customQuotesUIOrder.map(
      (instrument) => instrument[0]
    );
  };

  return {
    getInitialSelectedPreset,
    buildPresetInfo,
    loadInitialPresetData,
    subscribeToPresetManager,
    getFavoriteInstruments,
    FAVORITES_PRESET_ID,
  };
};
