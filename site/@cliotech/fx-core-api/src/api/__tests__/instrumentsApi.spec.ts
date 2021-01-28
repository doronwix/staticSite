import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../facade/IWebFacade";
import instrumentsApi from "../instrumentsApi";
import { mockInstruments } from "../__mocks__/instrumentData";

const facade = mock<IWebFacade>({}, { deep: true });

describe("InstrumentsApi", () => {
  it("getTooltipByInstrumentId should call InstrumentsTranslationsManager with param", () => {
    const api = instrumentsApi(facade);
    const param = 15;
    api.getTooltipByInstrumentId(param);
    expect(
      facade.InstrumentTranslationsManager.GetTooltipByInstrumentId
    ).toHaveBeenCalledWith(param);
  });

  it("getFullInstrumentName should call InstrumentTranslationsManager with param", () => {
    const api = instrumentsApi(facade);
    const param = 15;
    api.getFullInstrumentName(param);
    expect(facade.InstrumentTranslationsManager.Long).toHaveBeenCalledWith(
      param
    );
  });

  it("getInstrumentsFromCache should transform the mocked base instrument info", () => {
    const api = instrumentsApi(facade);

    const mockTranslationInfo = {
      baseSymbolName: "random",
      ccyPairLong: "none",
      ccyPairOriginal: "none",
      ccyPairShort: "none",
      otherSymbolName: "none",
    };
    facade.InstrumentTranslationsManager.GetTranslatedInstrumentById.mockImplementation(
      () => mockTranslationInfo
    );

    facade.InstrumentTranslationsManager.Long.mockImplementation(() => "TEST");
    facade.Customer.prop.hasWeightedVolumeFactor = true;
    facade.Customer.prop.isOvernightOnForex = true;
    facade.SystemInfo.get.mockImplementation(() => mockInstruments);
    const builtInstruments = api.getInstrumentsFromCache();
    const builtInstrumentsIds = Object.keys(builtInstruments);

    // so many assertions to be done - api is really not clean
    expect(builtInstrumentsIds.length).toBe(mockInstruments.length);
    expect(
      builtInstruments[builtInstrumentsIds[0]].instrumentData.symbolName
    ).toBe(mockTranslationInfo.baseSymbolName);
  });

  it("addInstrumentToFavorites should fail or succeed based on response from manager", async () => {
    const goodResponse = `
    {
      "status": 1
    }`;
    const badResponse = `
    {
      "status": 5
    }`;
    const badJsonResponse = `
    {
      "status: 1
    }`;

    facade.FavoriteInstrumentsManager.AddFavoriteInstrument.mockImplementationOnce(
      (num, cb) => {
        cb(goodResponse);
      }
    );

    const api = instrumentsApi(facade);
    const res1 = await api
      .addInstrumentToFavorites(15)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });

    expect(res1).toBe(true);

    facade.FavoriteInstrumentsManager.AddFavoriteInstrument.mockImplementationOnce(
      (nu, cb) => {
        cb(badResponse);
      }
    );

    const res2 = await api
      .addInstrumentToFavorites(15)
      .then(() => {
        return false;
      })
      .catch(() => {
        return true;
      });

    expect(res2).toBe(true);

    facade.FavoriteInstrumentsManager.AddFavoriteInstrument.mockImplementationOnce(
      (nu, cb) => {
        cb(badJsonResponse);
      }
    );

    const res3 = await api
      .addInstrumentToFavorites(15)
      .then(() => {
        return false;
      })
      .catch(() => {
        return true;
      });

    expect(res3).toBe(true);
  });
});
