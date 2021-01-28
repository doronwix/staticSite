import React from "react";
import useWithSetState from "../../utils/hooks";
import { observer } from "mobx-react-lite";

interface IAccountSummaryProps {
  onClick: (_e: React.MouseEvent<Element, MouseEvent>) => void;
  getValue: (key: string, context?: string) => string;
  ctaText?: string;
}

const useAccountSummaryViewModel = () =>
  useWithSetState<IAccountSummaryProps>((_self, store) => ({
    ctaText: store.userFlow.ctaText,
    onClick: store.userFlow.onClick,
    getValue: store.dictionary.getValue,
  }));

const AccountSummaryNotActive = () => {
  const { ctaText, onClick, getValue } = useAccountSummaryViewModel();

  return (
    <div className="accountSummaryNotActive">
      <div className="wallet">
        <a>
          <span className="ico-wb ico-wb-wallet-summary"></span>
        </a>
      </div>
      <div className="notActiveText">
        <span
          className="notActiveTextInner"
          dangerouslySetInnerHTML={{
            __html: getValue(
              "txtAccountNotactivated",
              "summaryview_accountsummary"
            ),
          }}
        />
      </div>
      <div className="CTAButton">
        <a id="btnAccountSummaryCTA" className="btn action" onClick={onClick}>
          <p>{ctaText ? getValue(ctaText, "account_hub") : null}</p>
        </a>
      </div>
    </div>
  );
};

export default observer(AccountSummaryNotActive);
