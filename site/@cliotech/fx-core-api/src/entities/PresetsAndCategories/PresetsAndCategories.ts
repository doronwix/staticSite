import { types, Instance, SnapshotIn, getEnv } from "mobx-state-tree";

import { PresetCategory, IPresetCategoryType } from "./category/PresetCategory";
import { Preset, IPresetSnapshotIn } from "./preset/preset";
import { IApi } from "../../api";
import { forEach, without } from "lodash-es";
import { IWebPresetsManagerData } from "../../facade/IWebPresetsManager";
import {
  Instrument,
  IInstrumentSnapshotIn,
  IInstrumentType,
} from "./instrument/instrument";
import { Quote, IQuoteSnapshotIn } from "./quote/Quote";
import { Dictionary } from "lodash";
import { identity, pickBy } from "lodash-es";
import { LoadingState } from "../../utils/loadingState";
import { IWebLimit } from "../../facade/IWebLimit";
import { IWebELimitMode } from "../../facade/enums/IWebELimitMode";

export const PresetsAndCategories = types
  .model({
    categoryList: types.map(PresetCategory),
    presetList: types.map(Preset),
    selectedCategory: types.maybe(types.reference(PresetCategory)),
    loading: types.optional(
      types.enumeration(Object.values(LoadingState) as LoadingState[]),
      LoadingState.NONE
    ),
    instrumentList: types.map(Instrument),
    quoteList: types.map(Quote),
    searchInput: types.optional(types.string, ""),
  })
  .views((self) => ({
    get categories() {
      return Array.from(self.categoryList.values());
    },
    get favoritesPreset() {
      return self.presetList.get("0");
    },

    get searchInstruments() {
      return Array.from(self.instrumentList.values());
    },
  }))
  .actions((_self) => {
    const self = _self as IPresetsAndCategoriesType;

    let unsubscribeToPresets: (() => void) | undefined;
    let unsubscribeToQuotes: (() => void) | undefined;
    let unsubscribeToPriceAlerts: (() => void) | undefined;
    let loadingHandler: number | undefined;

    const saveAddFavorite = (instrument: IInstrumentType) => {
      if (self.favoritesPreset) {
        instrument.setFavorite(true);
        self.favoritesPreset.instruments.unshift(instrument.id);
      }
    };

    const saveRemoveFavorite = (instrument: IInstrumentType) => {
      instrument.setFavorite(false);
      if (self.favoritesPreset) {
        self.favoritesPreset.instruments.remove(instrument);
      }
    };

    const addInstrumentToFavorites = (instrumentId: number) => {
      const instrument = self.instrumentList.get(`${instrumentId}`);
      if (instrument) {
        const { instrumentsApi } = getEnv<IApi>(self);
        instrumentsApi
          .addInstrumentToFavorites(instrumentId)
          .then(() => {
            self.saveAddFavorite(instrument);
          })
          .catch();
      }
    };

    const removeInstrumentFromFavorites = (instrumentId: number) => {
      const instrument = self.instrumentList.get(`${instrumentId}`);
      if (instrument) {
        const { instrumentsApi } = getEnv<IApi>(self);
        instrumentsApi
          .removeInstrumentFromFavorites(instrumentId)
          .then(() => {
            self.saveRemoveFavorite(instrument);
          })
          .catch();
      }
    };

    const findInstrument = (instrumentId: number) => {
      const instrument = self.favoritesPreset?.instruments.find(
        (instr) => instr.id === instrumentId
      ) as IInstrumentType; // we cast here cause there is no way instrument is not in there

      return {
        instrument,
        index: self.favoritesPreset?.instruments.indexOf(instrument) as number,
      };
    };

    const moveInstrument = (instrumentId: number, atIndex: number) => {
      const { instrument, index } = self.findInstrument(instrumentId);
      if (index !== undefined && index !== -1) {
        self.favoritesPreset?.instruments.splice(index, 1);
        self.favoritesPreset?.instruments.splice(atIndex, 0, instrument);
      }
    };

    const afterCreate = () => {
      const { presetsApi, quotesApi, instrumentsApi } = getEnv<IApi>(self);

      unsubscribeToQuotes = quotesApi.subscribeToQuotesManager(
        self.handleQuoteUpdates
      );
      /**
       * when created we load initial data, this will start from presetDefinitions
       * and enrich itself with data from PresetsManager
       * this will build ALL CATEGORIES & SUBCATEGORIES, regardless of presets present or not
       */
      self.loadInitialData();

      /**
       * for the subscription we do the reverse, as all categories/subcategories are built
       * if there are presets updated we build them and add them to the correct category, subcategory
       * we pass 2 callbacks, 1 that allows the API to get the loaded presetInfo & one to call with the new data
       */
      unsubscribeToPresets = presetsApi.subscribeToPresetManager(
        self.handleSubsequentUpdates
      );

      unsubscribeToPriceAlerts = instrumentsApi.subscribeToPriceAlerts(
        self.handlePriceAlertUpdates
      );
    };

    // initial load is handled in the instrumentsApi
    const handlePriceAlertUpdates = (limits: Dictionary<IWebLimit>) => {
      forEach(limits, ({ instrumentID, mode }) => {
        const instr = _self.instrumentList.get(`${instrumentID}`);
        if (instr) {
          instr.setPriceAlert(mode === IWebELimitMode.PriceAlert);
        }
      });
    };

    function handleQuoteUpdates(quotes: Dictionary<IQuoteSnapshotIn>) {
      if (Object.keys(quotes).length > 0) {
        for (const quoteId in quotes) {
          const safeQuote = pickBy(
            quotes[quoteId],
            identity
          ) as IQuoteSnapshotIn;

          const foundQuote = self.quoteList.get(`${quoteId}`);
          if (foundQuote) {
            foundQuote.update(safeQuote);
          } else {
            self.quoteList.set(`${quoteId}`, safeQuote);
          }
        }
      }
    }

    /**
     * we handle the initial load and selection of categorydata & presets
     */
    const handleSuccesfulInitialLoad = (
      data: IPresetsAndCategoriesSnapshotIn
    ) => {
      const { presetsApi } = getEnv<IApi>(self);

      self.setInitialData(data);
      self.setFavoriteInstruments();
      self.setInitialPresetSelection(presetsApi.getInitialSelectedPreset());
      self.loading = LoadingState.FINISHED;
    };

    const setFavoriteInstruments = () => {
      const { presetsApi } = getEnv<IApi>(self);

      const favoriteInstrumentIds = presetsApi.getFavoriteInstruments();
      const favoritePreset = self.presetList.get(
        `${presetsApi.FAVORITES_PRESET_ID}`
      );
      if (favoritePreset) {
        favoriteInstrumentIds.forEach((instrumentId) => {
          const instrument = _self.instrumentList.get(`${instrumentId}`);
          if (instrument) {
            favoritePreset.instruments.push(instrumentId);
            instrument.setFavorite(true);
          }
        });
      }
    };

    /**
     * load initial data, there's a failsafe to retry every 100ms in case this gets triggered before data actually gets in PresetsManager
     * this is up for discusion in terms of retry timer
     */

    const loadInitialData = () => {
      const { presetsApi } = getEnv<IApi>(self);
      const data = presetsApi.loadInitialPresetData();
      self.loading = LoadingState.LOADING;
      if (data !== null) {
        if (loadingHandler) {
          clearTimeout(loadingHandler);
        }
        self.handleSuccesfulInitialLoad(data);
      } else {
        loadingHandler = window.setTimeout(self.loadInitialData, 100);
      }
    };

    /**
     * utility function to get id's of currently loaded presets, used to compute the delta (new,removed presets)
     * on updates from PresetsManager
     */
    const getCurrentPresetData = () =>
      Array.from(self.presetList.values()).map((preset) => preset.id);

    /**
     * handle DELTA updates, we only get the NEW presets in here
     * can also handle REMOVED presets altough doubt the current OLD WEB supports that
     */
    const handleSubsequentUpdates = (
      _presetData: IWebPresetsManagerData,
      presetList: number[]
    ) => {
      /**
       * if we get an update before we load initial data or
       * when we're in the middle of loading it, we ignore it
       * it'll be picked up by initial load, no loss
       */
      if (self.loading !== LoadingState.FINISHED) {
        return;
      } else {
        const { presetsApi } = getEnv<IApi>(self);
        const loadedPresets = self.getCurrentPresetData();
        const removedPresets = without(loadedPresets, ...presetList);
        const newPresets = without(presetList, ...loadedPresets);

        const presets = presetsApi.buildPresetInfo(newPresets);

        self.cleanupData(removedPresets);
        self.updateNewData(presets);
      }
    };

    /**
     * because the category data is static (presetDefinitions) we never remove categories
     * so we only handle possible removal of presets
     */
    const cleanupData = (removedPresets: number[]) => {
      const {
        presetsApi: { FAVORITES_PRESET_ID },
      } = getEnv<IApi>(self);
      // the presets we get from the server on subsequent updates don't include favorites preset id
      // to make sure it doesn't get removed on delta - we filter the presets to be removed of it
      const withoutFavorites = removedPresets.filter(
        (presetId) => presetId !== FAVORITES_PRESET_ID
      );
      withoutFavorites.forEach((presetId) => {
        self.presetList.delete(`${presetId}`);
      });
    };

    /**
     * actually updating the state with the new data
     * we iterate over the `new` presets, add them to the preset list
     * we then update the category/subcategory they belong to by adding it to them
     */

    const updateNewData = (presetInfo: {
      [key: number]: IPresetSnapshotIn;
    }) => {
      forEach(presetInfo, (preset) => {
        self.presetList.put(preset);
        const category = self.categoryList.get(`${preset.category}`);
        /**
         * if we follow business logic category is never undefined
         * but TS cannot infer our businesslogic - that category was already fully built
         */
        if (category) {
          /**
           * add it to respective category
           */
          category.presets.push(preset.id);
          /**
           * if we had a category without presets before delta
           * in case of an addition of preset & never having lastSelectedPreset
           * we set it with the first one, subsequent calls won't do anything because we would have set lastSelectedPreset
           */
          if (!category.lastSelectedPreset) {
            category.lastSelectedPreset = preset.id;
          }
          const subCategory = category.subCategories.find(
            (subCategory) => subCategory.id === preset.subCategory
          );
          if (subCategory) {
            /* same with subcategory */
            subCategory.presets.push(preset.id);
          }
        }
      });
    };

    const getFirstCategory = (): IPresetCategoryType => {
      return self.categoryList.values().next().value;
    };

    /**
     * on initial build we set the selectedPreset & Category
     */
    const setInitialPresetSelection = (selectedPresetId?: number) => {
      const selectedPreset = self.presetList.get(`${selectedPresetId}`);

      if (selectedPreset) {
        // if a selected preset is provided we select it
        selectedPreset.directSelect();
      } else {
        // if the initial selected preset doesn't exist we just set category
        // every category sets the lastSelectedPreset by default as the first one if not instructed otherwise
        const firstCategory = getFirstCategory();
        if (firstCategory) {
          firstCategory.select();
        }
      }
    };

    /**
     * actually assigning the data to the state
     */
    const setInitialData = (data: IPresetsAndCategoriesSnapshotIn) => {
      if (data.instrumentList) {
        const { instrumentsApi } = getEnv<IApi>(self);

        const populatedInstruments = instrumentsApi.getInstrumentsFromCache();

        forEach(data.instrumentList, (instrument) => {
          const aggInstrument = pickBy(
            {
              ...populatedInstruments[instrument.id],
              ...instrument,
            },
            identity
          ) as IInstrumentSnapshotIn;
          self.instrumentList.put(aggInstrument);
        });
      }
      if (data.presetList) {
        // we use lodash `forEach` because it can iterate over collections
        forEach(data.presetList, (preset) => {
          self.presetList.put(preset);
        });
      }
      if (data.categoryList) {
        forEach(data.categoryList, (categoryData) => {
          self.categoryList.put(categoryData);
        });
      }
    };

    const updateSelectedCategory = (id: string) => {
      self.selectedCategory = id as any;
    };

    /**
     * on destroy we unsubscribe from presetsManager, if subscription exists
     */
    const onDestroy = () => {
      if (unsubscribeToPresets) {
        unsubscribeToPresets();
      }
      if (unsubscribeToQuotes) {
        unsubscribeToQuotes();
      }
      if (unsubscribeToPriceAlerts) {
        unsubscribeToPriceAlerts();
      }
    };

    return {
      afterCreate,
      setInitialData,
      onDestroy,
      setInitialPresetSelection,
      loadInitialData,
      handleSuccesfulInitialLoad,
      cleanupData,
      handleSubsequentUpdates,
      getCurrentPresetData,
      updateNewData,
      handleQuoteUpdates,
      updateSelectedCategory,
      setFavoriteInstruments,
      addInstrumentToFavorites,
      removeInstrumentFromFavorites,
      findInstrument,
      moveInstrument,
      handlePriceAlertUpdates,
      saveAddFavorite,
      saveRemoveFavorite,
    };
  });

export interface IPresetsAndCategoriesType
  extends Instance<typeof PresetsAndCategories> {}
export interface IPresetsAndCategoriesSnapshotIn
  extends SnapshotIn<typeof PresetsAndCategories> {}

export default PresetsAndCategories;
