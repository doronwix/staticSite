export interface IWebInstrumentTranslationsManager {
  GetTooltipByInstrumentId: (id: number) => string;
  Long: (id: number) => string;
  GetTranslatedInstrumentById: (id: number) => IWebInstrumentTranslation;
  GetFullTextLatinized: (id: number) => string;
}

export interface IWebInstrumentTranslation {
  ccyPairLong: string;
  ccyPairShort: string;
  ccyPairOriginal: string;
  baseSymbolName: string;
  otherSymbolName: string;
}
