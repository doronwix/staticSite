import presetsApi from "../presetsApi";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../facade/IWebFacade";
import { IWebPresetsManager } from "../../facade/IWebPresetsManager";

const facade = mock<IWebFacade>();

const PresetsManagerMock = mock<IWebPresetsManager>({}, { deep: true });
facade.PresetsManager = PresetsManagerMock;
jest.mock("../presetsApi/methods");
describe("Presets Api", () => {
  it("subscribeToPresetsManager should subscribe via manager and return an unsub fn", () => {
    const api = presetsApi(facade);
    const cbFn = () => ({});
    const unsub = api.subscribeToPresetManager(cbFn);
    expect(PresetsManagerMock.OnPresetsUpdated.Add).toHaveBeenCalledWith(cbFn);

    unsub();
    expect(PresetsManagerMock.OnPresetsUpdated.Remove).toHaveBeenCalledWith(
      cbFn
    );
  });

  it("loadInitialPresetData should take presets from PresetsManager", () => {
    const api = presetsApi(facade);
    const parsedData = api.loadInitialPresetData();
    expect(PresetsManagerMock.GetPresetInstruments).toHaveBeenCalled();

    // we have no data, expect build not to have happened
    expect(parsedData).toBe(null);
  });

  it("loadInitalPresetData should return data when presets manager has data", () => {
    const api = presetsApi(facade);
    PresetsManagerMock.GetPresetInstruments.mockImplementationOnce(() => ({}));
  });
});
