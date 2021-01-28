import { IPresetCategoryType } from "../../entities/PresetsAndCategories/category/PresetCategory";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";
import useWithSetState from "../../utils/hooks";

interface IPresetTabsData {
  selectedCategory?: IPresetCategoryType;
  searchInstruments: Array<IInstrumentType>;

  visibleCategories: IPresetCategoryType[];
  selectedCategoryId: string | undefined;
  placeholder: string;
}

export const usePresetsData = () =>
  useWithSetState<IPresetTabsData>((_self, store) => ({
    get selectedCategory() {
      return store.presetsAndCategories.selectedCategory;
    },
    get searchInstruments() {
      return store.presetsAndCategories.searchInstruments;
    },

    get visibleCategories() {
      return store.presetsAndCategories.categories.filter(
        (category) => category.presets.length > 0
      );
    },

    get placeholder() {
      return store.dictionary.getValue("SearchLabel", "dialogsTitles");
    },

    get selectedCategoryId() {
      return store.presetsAndCategories.selectedCategory?.id;
    },
  }));
