import { IWebInBetweenQuote } from "./IWebAmountConverter";

export interface IWebBuilderForInBetweenQuote {
  GetInBetweenQuote: (
    fromCurreny: number,
    toCurrency: number
  ) => Promise<IWebInBetweenQuote>;
}
