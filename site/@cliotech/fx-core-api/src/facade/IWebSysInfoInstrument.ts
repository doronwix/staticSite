import { IWebEInstrumentMap } from "./enums/IWebEInstrumentMap";

export interface IWebSysInfoInstrument extends Array<number | string> {
  [IWebEInstrumentMap.id]: number;
  [IWebEInstrumentMap.amountGroupId]: string;
  [IWebEInstrumentMap.factor]: number;
  [IWebEInstrumentMap.hasSignals]: number;
  [IWebEInstrumentMap.ccyPair]: string;
  [IWebEInstrumentMap.tradable]: number;
  [IWebEInstrumentMap.defaultDealSize]: number;
  [IWebEInstrumentMap.signalName]: string;
  [IWebEInstrumentMap.maxDeal]: string;
  [IWebEInstrumentMap.SLMinDistance]: number;
  [IWebEInstrumentMap.TPMinDistance]: number;
  [IWebEInstrumentMap.DecimalDigit]: number;
  [IWebEInstrumentMap.PipDigit]: number;
  [IWebEInstrumentMap.SpecialFontStart]: number;
  [IWebEInstrumentMap.SpecialFontLength]: number;
  [IWebEInstrumentMap.assetTypeId]: number;
  [IWebEInstrumentMap.expirationDate]: string;
  [IWebEInstrumentMap.instrumentTypeId]: number;
  [IWebEInstrumentMap.baseSymbolId]: number;
  [IWebEInstrumentMap.otherSymbolId]: number;
  [IWebEInstrumentMap.exchangeInstrumentName]: string;
  [IWebEInstrumentMap.exchange]: string;
  [IWebEInstrumentMap.contractMonthAndYear]: string;
  [IWebEInstrumentMap.instrumentEnglishName]: string;
  [IWebEInstrumentMap.weightedVolumeFactor]: string;
  [IWebEInstrumentMap.eventDate]: string;
  [IWebEInstrumentMap.eventAmount]: string;
  [IWebEInstrumentMap.marketPriceTolerance]: number;
}
