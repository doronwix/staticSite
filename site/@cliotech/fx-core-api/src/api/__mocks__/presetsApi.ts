import { mock } from "jest-mock-extended";
import { IPresetsApi } from "../presetsApi";

// TODO: for this one we 100% will need to mock some implementations and data
const presetsApi = mock<IPresetsApi>();

presetsApi.loadInitialPresetData.mockImplementation(() => ({
  categoryList: {},
  instrumentList: {},
  presetList: {},
  quoteList: {},
}));

export default () => presetsApi;
