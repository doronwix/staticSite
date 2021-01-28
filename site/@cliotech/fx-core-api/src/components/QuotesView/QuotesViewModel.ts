import useWithSetState from "../../utils/hooks";
import { IPresetType } from "../../entities/PresetsAndCategories/preset/preset";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";

interface IQuotesInjectedProps {
  selectedPreset: IPresetType;

  findInstrument: (
    instrumentId: number
  ) => {
    instrument: IInstrumentType;
    index: number;
  };
  moveInstrument: (instrumentId: number, atIndex: number) => void;
}

export const useQuotesData = () => {
  return useWithSetState<IQuotesInjectedProps>((_self, store) => ({
    selectedPreset:
      store.presetsAndCategories.selectedCategory &&
      store.presetsAndCategories.selectedCategory.lastSelectedPreset,
    findInstrument: store.presetsAndCategories.findInstrument,
    moveInstrument: store.presetsAndCategories.moveInstrument,
  }));
};
