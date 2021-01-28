export interface IWebInBetweenQuote {
  ask: (() => number) | number;
  bid: (() => number) | number;
  instrumentFactor: number;
  isOppositeInstrumentFound: boolean;
}

export interface IWebAmountConverter {
  Convert: (
    amount: number,
    inBetweenQuote?: IWebInBetweenQuote,
    useMidRate?: boolean
  ) => number | undefined;
}
