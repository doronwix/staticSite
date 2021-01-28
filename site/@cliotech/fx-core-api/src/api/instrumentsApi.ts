import { Dictionary } from "lodash";
import { IInstrumentSnapshotIn } from "../entities/PresetsAndCategories/instrument/instrument";
import { IWebEInstrumentMap } from "../facade/enums/IWebEInstrumentMap";
import { IWebFacade } from "../facade/IWebFacade";
import { IWebPresetsManagerData } from "../facade/IWebPresetsManager";
import { IWebSysInfoInstrument } from "../facade/IWebSysInfoInstrument";
import { IWebLimit } from "../facade/IWebLimit";
import { IWebEAssetType } from "../facade/enums/IWebEAssetType";
import { IWebEInstrumentType } from "../facade/IWebPresetsDefinitions";

export interface IInstrumentData {
  id: number;
  ccyPair?: string;
  amountGroupId?: string;
  factor?: number;
  isTradable?: boolean;
  hasSignal?: boolean;
  signalName?: string;
  dealMinMaxAmounts?: number[];
  defaultDealSize?: number;
  maxDeal?: string;
  SLMinDistance?: number;
  TPMinDistance?: number;
  DecimalDigit?: number;
  PipDigit?: number;
  SpecialFontStart?: number;
  SpecialFontLength?: number;
  instrumentTypeId?: number;
  assetTypeId?: number;
  expirationDate?: string;
  isFuture?: boolean;
  isShare?: boolean;
  isForex?: boolean;
  isStock?: boolean;
  futureValueData?: number;
  baseSymbol?: number;
  otherSymbol?: number;
  baseSymbolName?: string;
  otherSymbolName?: string;
  exchangeInstrumentName?: string;
  exchange?: string;
  contractMonthAndYear?: string;
  instrumentEnglishName?: string;

  weightedVolumeFactor?: number;
  eventDate?: string;
  eventAmount?: string;
  marketPriceTolerance?: number;
  // TODO: maybe boolean, check
  isOvernightOnForex?: boolean;
  tooltip?: string;
  longName?: string;
  isRtl: boolean; // default false
  fullText?: string;
  symbolName?: string;
}

export const createInstrumentObject = (
  instrument: IWebSysInfoInstrument,
  isOvernightOnForex?: boolean,
  hasWeightedVolumeFactor?: boolean
): IInstrumentData => ({
  id: instrument[IWebEInstrumentMap.id],
  DecimalDigit: instrument[IWebEInstrumentMap.DecimalDigit],
  PipDigit: instrument[IWebEInstrumentMap.PipDigit],
  SLMinDistance: instrument[IWebEInstrumentMap.SLMinDistance],
  SpecialFontLength: instrument[IWebEInstrumentMap.SpecialFontLength],
  SpecialFontStart: instrument[IWebEInstrumentMap.SpecialFontStart],
  TPMinDistance: instrument[IWebEInstrumentMap.TPMinDistance],
  amountGroupId: instrument[IWebEInstrumentMap.amountGroupId],
  assetTypeId: instrument[IWebEInstrumentMap.assetTypeId],
  baseSymbol: instrument[IWebEInstrumentMap.baseSymbolId],
  baseSymbolName: instrument[IWebEInstrumentMap.ccyPair]
    .toString()
    .split(/\//g)[0],
  ccyPair: instrument[IWebEInstrumentMap.ccyPair],
  contractMonthAndYear: instrument[IWebEInstrumentMap.contractMonthAndYear],
  // TODO: need to compute this, might not even need to do it in the initializer
  dealMinMaxAmounts: [0, 0],
  defaultDealSize: instrument[IWebEInstrumentMap.defaultDealSize],
  eventAmount: instrument[IWebEInstrumentMap.eventAmount],
  eventDate: instrument[IWebEInstrumentMap.eventDate],
  exchange: instrument[IWebEInstrumentMap.exchange],
  exchangeInstrumentName: instrument[IWebEInstrumentMap.exchangeInstrumentName],
  expirationDate: instrument[IWebEInstrumentMap.expirationDate],
  factor: instrument[IWebEInstrumentMap.factor],
  hasSignal: instrument[IWebEInstrumentMap.hasSignals] === 1,
  instrumentEnglishName: instrument[IWebEInstrumentMap.instrumentEnglishName],
  instrumentTypeId: instrument[IWebEInstrumentMap.instrumentTypeId],
  isForex: instrument[IWebEInstrumentMap.assetTypeId] === IWebEAssetType.Forex,
  isFuture:
    instrument[IWebEInstrumentMap.assetTypeId] === IWebEAssetType.Future,
  isOvernightOnForex,
  isShare: instrument[IWebEInstrumentMap.assetTypeId] === IWebEAssetType.Share,
  isStock:
    instrument[IWebEInstrumentMap.instrumentTypeId] ===
    IWebEInstrumentType.Stocks,
  isTradable: instrument[IWebEInstrumentMap.tradable] === 1,
  marketPriceTolerance: instrument[IWebEInstrumentMap.marketPriceTolerance],
  maxDeal: instrument[IWebEInstrumentMap.maxDeal],
  otherSymbol: instrument[IWebEInstrumentMap.otherSymbolId],
  otherSymbolName: instrument[IWebEInstrumentMap.ccyPair]
    .toString()
    .split(/\//g)[1],
  signalName: instrument[IWebEInstrumentMap.signalName],
  weightedVolumeFactor: hasWeightedVolumeFactor
    ? parseFloat(instrument[IWebEInstrumentMap.weightedVolumeFactor])
    : 1,
  isRtl: false,
});

export interface IInstrumentsApi {
  getInstrumentsFromCache: () => Dictionary<IInstrumentSnapshotIn>;
  getPresetsWithInstruments: () => IWebPresetsManagerData;
  subscribeToPriceAlerts: (
    cb: (limits: Dictionary<IWebLimit>) => any
  ) => () => void;

  getTooltipByInstrumentId: (id: number) => string;
  getFullInstrumentName: (id: number) => string;
  addInstrumentToFavorites: (instrumentId: number) => Promise<void>;
  removeInstrumentFromFavorites: (instrumentId: number) => Promise<void>;
}

function instrumentsApi({
  SystemInfo,
  PresetsManager,
  Customer,
  InstrumentTranslationsManager,
  SystemConsts,
  ActiveLimitsManager,
  FavoriteInstrumentsManager,
}: IWebFacade): IInstrumentsApi {
  const getTooltipByInstrumentId = (id: number) => {
    return InstrumentTranslationsManager.GetTooltipByInstrumentId(id);
  };

  const getFullInstrumentName = (id: number) => {
    return InstrumentTranslationsManager.Long(id);
  };

  const getTranslatedInstrument = (id: number) => {
    return InstrumentTranslationsManager.GetTranslatedInstrumentById(id);
  };

  const getFullTextLatinized = (id: number) => {
    return InstrumentTranslationsManager.GetFullTextLatinized(id);
  };
  const isRtlText = (text: string) => {
    return SystemConsts.cArabicChars.test(text);
  };

  const getHasPriceAlert = (instrumentId: number) => {
    return ActiveLimitsManager.HasPriceAlerts(instrumentId);
  };

  const addTranslationsInfo = (
    instrument: IInstrumentData
  ): IInstrumentSnapshotIn => {
    const longName = getFullInstrumentName(instrument.id);

    return {
      instrumentData: {
        ...instrument,
        tooltip: getTooltipByInstrumentId(instrument.id),
        fullText: getFullTextLatinized(instrument.id),
        symbolName: getTranslatedInstrument(instrument.id).baseSymbolName,
        longName,
        isRtl: isRtlText(longName),
      },
      id: instrument.id,
      hasPriceAlert: getHasPriceAlert(instrument.id),
    };
  };

  const getInstrumentsFromCache = () => {
    const sysInfoInstruments = SystemInfo.get<IWebSysInfoInstrument[]>(
      "instruments"
    );
    const { hasWeightedVolumeFactor, isOvernightOnForex } = Customer.prop;

    const instrumentList: Dictionary<IInstrumentSnapshotIn> = {};

    sysInfoInstruments.forEach((instrument) => {
      const builtInstrument = createInstrumentObject(
        instrument,
        isOvernightOnForex,
        hasWeightedVolumeFactor
      );
      instrumentList[builtInstrument.id] = addTranslationsInfo(builtInstrument);
    });

    return instrumentList;
  };

  const getPresetsWithInstruments = () => {
    return PresetsManager.GetPresetInstruments();
  };

  const isFavoriteSaved = (response: string) => {
    try {
      const text: { status: number } = JSON.parse(response);
      if (text.status === 1) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const addInstrumentToFavorites = (instrumentId: number) => {
    return new Promise<void>((resolve, reject) => {
      FavoriteInstrumentsManager.AddFavoriteInstrument(
        instrumentId,
        (response) => {
          if (isFavoriteSaved(response)) {
            resolve();
          } else {
            reject();
          }
        }
      );
    });
  };

  const removeInstrumentFromFavorites = (instrumentId: number) => {
    return new Promise<void>((resolve, reject) => {
      FavoriteInstrumentsManager.RemoveFavoriteInstrument(
        instrumentId,
        (response) => {
          if (isFavoriteSaved(response)) {
            resolve();
          } else {
            reject();
          }
        }
      );
    });
  };

  const subscribeToPriceAlerts = (
    cb: (limits: Dictionary<IWebLimit>) => any
  ) => {
    ActiveLimitsManager.OnPriceAlert.Add(cb);

    return () => ActiveLimitsManager.OnPriceAlert.Remove(cb);
  };

  return {
    getFullInstrumentName,
    getInstrumentsFromCache,
    getPresetsWithInstruments,
    getTooltipByInstrumentId,
    subscribeToPriceAlerts,
    addInstrumentToFavorites,
    removeInstrumentFromFavorites,
  };
}

export default instrumentsApi;
