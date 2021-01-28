import { IWebInBetweenQuote } from "../facade/IWebAmountConverter";
import { IWebFacade } from "../facade/IWebFacade";

export interface IAmountConverterApi {
  convert: (
    amount: number,
    inBetweenQuote?: IWebInBetweenQuote,
    useMidRate?: boolean
  ) => number | undefined;
}

const amountConverterApi = (facade: IWebFacade): IAmountConverterApi => ({
  convert: (amount, inBetweenQuote, useMidRate) => {
    return facade.AmountConverter.Convert(amount, inBetweenQuote, useMidRate);
  },
});

export default amountConverterApi;
