type IWebAddInstrumentCBFn = (response: string) => void;

export interface IWebFavoriteInstrumentsManager {
  AddFavoriteInstrument: (
    instrumentId: number,
    cb: IWebAddInstrumentCBFn
  ) => void;

  RemoveFavoriteInstrument: (
    instrumentId: number,
    cb: IWebAddInstrumentCBFn
  ) => void;
}
