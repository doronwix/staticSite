import useWithSetState from "../../utils/hooks";
import { IPresetType } from "../../entities/PresetsAndCategories/preset/preset";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";

const MAX_TABLE_ROWS = 9;

interface IQuotesTableData {
  findInstrument: (
    id: number
  ) => { instrument: IInstrumentType; index: number };
  moveInstrument: (id: number, atIndex: number) => void;
  selectedPreset: IPresetType;
  fakeInstrumentCount: number;
  isFavoritePreset: boolean;
  instrumentCount: number;
  showFavoritesPlacerholder: boolean;
}

const useQuotesTableData = () =>
  useWithSetState<IQuotesTableData>((self, store) => ({
    findInstrument: store.presetsAndCategories.findInstrument,
    moveInstrument: store.presetsAndCategories.moveInstrument,
    get selectedPreset() {
      return store.presetsAndCategories.selectedCategory
        ?.lastSelectedPreset as IPresetType;
    },
    get fakeInstrumentCount() {
      if (
        self.selectedPreset &&
        self.selectedPreset.instruments.length < MAX_TABLE_ROWS
      ) {
        return MAX_TABLE_ROWS - self.selectedPreset?.instruments.length;
      }
      return 0;
    },
    get isFavoritePreset() {
      return self.selectedPreset?.id === 0;
    },
    get instrumentCount() {
      return self.selectedPreset ? self.selectedPreset.instruments.length : 0;
    },
    get showFavoritesPlacerholder() {
      return (
        self.selectedPreset &&
        self.selectedPreset.instruments.length === 0 &&
        self.selectedPreset?.id === 0
      );
    },
  }));

export default useQuotesTableData;
