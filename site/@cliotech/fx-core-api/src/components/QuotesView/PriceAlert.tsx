import React, { FunctionComponent } from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";

import { IWebDialogType } from "../../facade/enums/IWebDialogType";
import { IWebViewType } from "../../facade/enums/IWebViewType";
import { IWebETransactionSwitcher } from "../../facade/enums/IWebETransactionSwitcher";
import { IWebEOrderDir } from "../../facade/enums/IWebEOrderDir";
import useWithSetState from "../../utils/hooks";

interface IPriceAlertData {
  getValue: (
    key: string,
    context?: string | undefined,
    defaultValue?: string | undefined
  ) => string;

  openNewPriceAlert: () => void;
}

const usePriceAlertData = (instrument: IInstrumentType) =>
  useWithSetState<IPriceAlertData>((_self, store) => ({
    getValue: store.dictionary.getValue,
    openNewPriceAlert: () => {
      store.dialog.open(
        IWebDialogType.NewPriceAlert,
        {
          title: "",
          customTitle: "TransactionDropDown",
          width: 700,
          dragStart: () => {
            store.dialog.postEvent("new-deal-dragged", {});
          },
          persistent: false,
          dialogClass: "deal-slip",
        },
        IWebViewType.vNewPriceAlert,
        {
          instrumentId: instrument.id,
          orderDir: IWebEOrderDir.None,
          transactionType: IWebETransactionSwitcher.NewPriceAlert,
        }
      );
    },
  }));

const PriceAlert: FunctionComponent<{ instrument: IInstrumentType }> = ({
  instrument,
}) => {
  const data = usePriceAlertData(instrument);

  return (
    <a
      href="javascript:void(0)"
      onClick={data.openNewPriceAlert}
      className={cn("priceAlert", {
        priceAlertOn: instrument.hasPriceAlert,
        priceAlertOff: !instrument.hasPriceAlert,
      })}
      title={data.getValue("tooltipPriceAlert")}
    ></a>
  );
};

export default observer(PriceAlert);
