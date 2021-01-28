import { IPresetsAndCategoriesSnapshotIn } from "../PresetsAndCategories";
import { LoadingState } from "../../../utils/loadingState";

export const PresetsAndCategoriesData: IPresetsAndCategoriesSnapshotIn = {
  categoryList: {},
  presetList: {},
  selectedCategory: 1,
  loading: LoadingState.FINISHED,
  instrumentList: {},
  quoteList: {},
  searchInput: "",
};
