import { types, getEnv, Instance } from "mobx-state-tree";
import { IWebInBetweenQuote } from "../../facade/IWebAmountConverter";
import { IApi } from "../../api";

const DirectApi = types.model({}).actions((self) => {
  const convertAmount = (
    amount: number,
    inBetweenQuote?: IWebInBetweenQuote,
    useMidRate?: boolean
  ) => {
    const { amountConverterApi } = getEnv<IApi>(self);
    return amountConverterApi.convert(amount, inBetweenQuote, useMidRate);
  };

  const getInBetweenQuote = (usdCcy: number, selectedCcyId: number) => {
    const { builderForInBetweenQuoteApi } = getEnv<IApi>(self);

    return builderForInBetweenQuoteApi.getInBetweenQuote(usdCcy, selectedCcyId);
  };

  const processDemoDeposit = () => {
    const { dalDemoAccountApi } = getEnv<IApi>(self);
    return dalDemoAccountApi.processDemoDeposit();
  };

  return {
    convertAmount,
    getInBetweenQuote,
    processDemoDeposit,
  };
});

export interface IDirectApiType extends Instance<typeof DirectApi> {}

export default DirectApi;
