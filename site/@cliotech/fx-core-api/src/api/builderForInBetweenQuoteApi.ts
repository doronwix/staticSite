import { IWebInBetweenQuote } from "../facade/IWebAmountConverter";
import { IWebFacade } from "../facade/IWebFacade";

export interface IBuilderForInBetweenQuoteApi {
  getInBetweenQuote: (
    fromCurrency: number,
    toCurrency: number
  ) => Promise<IWebInBetweenQuote>;
}

const builderForInBetweenQuoteApi = (facet: IWebFacade) => ({
  getInBetweenQuote: (fromCurrency: number, toCurrency: number) => {
    return facet.BuilderForInBetweenQuote.GetInBetweenQuote(
      fromCurrency,
      toCurrency
    );
  },
});

export default builderForInBetweenQuoteApi;
