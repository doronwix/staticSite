import React from "react";
import useWithSetState from "../../utils/hooks";
import { toNumeric } from "../Currency/currencyHelpers";
import { IWebInBetweenQuote } from "../../facade/IWebAmountConverter";
import { isFunction } from "lodash";

interface IFxComponentDemoIconProps {
  isCustomerDemo: boolean;
  depositClick: (_e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  isEligableToDemoDeposit: boolean;
  isProcessing: boolean;
  selectedCcyId: number | undefined;
  getInBetweenQuote: () => void;
  getValue: (val: string, res?: string, defaultValue?: string) => string;
  quotePending: boolean;
  usdCCy: number;
  depositMade: boolean;
  amountToDeposit: number;
  maxAmount: number;
  onDepositSuccess: () => void;
  onDepositFail: () => void;
  computeAndSetAmounts: (quote: IWebInBetweenQuote) => void;
  getQuoteSuccess: (quote: IWebInBetweenQuote) => void;
  getQuoteFailure: (_error: Error) => void;
  tooltipMessage: JSX.Element;
}

export const useDemoIconViewModel = () =>
  useWithSetState<IFxComponentDemoIconProps>((self, store) => ({
    get isCustomerDemo() {
      return store.customer.isDemo;
    },
    get selectedCcyId() {
      return store.customer.selectedCcyId;
    },
    getValue: store.dictionary.getValue,
    quotePending: false,
    usdCCy: 47,
    isProcessing: false,
    depositMade: false,
    amountToDeposit: 0,
    maxAmount: 0,
    // eslint-disable-next-line react/display-name
    get tooltipMessage() {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: String.format(
              store.dictionary.getValue("demoDepositToolTip"),
              Format.toNumberWithCurrency(self.amountToDeposit || 0, {
                currencyId: self.selectedCcyId,
              })
            ),
          }}
        />
      );
    },
    get isEligableToDemoDeposit() {
      if (self.depositMade === true) {
        return false;
      }
      if (self.isProcessing) {
        return false;
      }

      if (self.quotePending) {
        return false;
      }

      return toNumeric(store.clientState.equity) < self.maxAmount;
    },

    getInBetweenQuote: () => {
      if (self.selectedCcyId && !self.quotePending) {
        self.quotePending = true;
        store.directApi
          .getInBetweenQuote(self.usdCCy, self.selectedCcyId)
          .then(self.getQuoteSuccess, self.getQuoteFailure);
      }
    },
    getQuoteSuccess: (quote: IWebInBetweenQuote) => {
      const parsedQuote = {
        ask: isFunction(quote.ask) ? quote.ask() : quote.ask,
        bid: isFunction(quote.bid) ? quote.bid() : quote.bid,
        instrumentFactor: quote.instrumentFactor,
        isOppositeInstrumentFound: quote.isOppositeInstrumentFound,
      };
      self.computeAndSetAmounts(parsedQuote);
      self.quotePending = false;
    },
    getQuoteFailure: (_error: Error) => {
      self.quotePending = false;
    },
    computeAndSetAmounts: (quote: IWebInBetweenQuote) => {
      let amountToDeposit = 0;
      let maxAmount = 0;

      if (store.customerProfile.demoDepositAmount)
        amountToDeposit =
          store.directApi.convertAmount(
            store.customerProfile.demoDepositAmount,
            quote
          ) || 0;
      maxAmount =
        store.directApi.convertAmount(
          store.systemInfo.get<{ MaxEquityForDemoDepositInUsd: number }>(
            "config"
          ).MaxEquityForDemoDepositInUsd,
          quote
        ) || 0;
      self.maxAmount = maxAmount;
      self.amountToDeposit = amountToDeposit;
    },
    depositClick: (_e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      self.isProcessing = true;
      store.directApi
        .processDemoDeposit()
        .then(self.onDepositSuccess)
        .catch(self.onDepositFail);
    },
    onDepositSuccess: () => {
      self.depositMade = true;
      self.isProcessing = false;
    },

    onDepositFail: () => {
      self.isProcessing = false;
    },
  }));
