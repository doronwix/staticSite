import { IQuoteType } from "../../entities/PresetsAndCategories/quote/Quote";
import useWithSetState from "../../utils/hooks";
import { IWebDialogType } from "../../facade/enums/IWebDialogType";
import { IWebViewType } from "../../facade/enums/IWebViewType";
import { IWebEPendingBonusType } from "../../facade/enums/IWebEPendingBonusType";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";
import { toNumeric } from "../Currency/currencyHelpers";
import { toPercent } from "../util/formatters";
import { IWebETransactionSwitcher } from "../../facade/enums/IWebETransactionSwitcher";
import { IWebEOrderDir } from "../../facade/enums/IWebEOrderDir";
import { IWebENewDealTool } from "../../facade/enums/IWebENewDealTool";
import { IWebEQuoteStates } from "../../facade/enums/IWebEQuoteStates";

interface IQuoteData {
  postEvent: (event: string, cat: any) => void;
  openTransactionSwitcherDialog: (params: {
    instrumentId: number | undefined;
    orderDir: IWebEOrderDir;
    tab: IWebENewDealTool | undefined;
    transactionType: IWebETransactionSwitcher;
  }) => void;
  openNewDeal: (orderDir: IWebEOrderDir, tab?: IWebENewDealTool) => void;
  openNewLimit: (orderDir: IWebEOrderDir, tab?: IWebENewDealTool) => void;
  handleRowEnterPress: (
    event: React.KeyboardEvent<HTMLTableRowElement>
  ) => void;

  toggleFavorite: (
    event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>
  ) => void;

  getValue(value: string, context?: string): string | undefined;
  openNewDealOrLimit(
    orderDir?: IWebEOrderDir,
    tab?: IWebENewDealTool
  ): () => void;

  isCashBackIconVisible: boolean;
  isAvailable: boolean | undefined;
  formattedChange: any;
  readonly quote: IQuoteType | undefined;
}

export const useQuoteRowData = (instrument: IInstrumentType) =>
  useWithSetState<IQuoteData>((self, store) => ({
    postEvent: store.dialog.postEvent,
    getValue: store.dictionary.getValue,
    get quote() {
      return store.presetsAndCategories.quoteList.get(`${instrument.id}`);
    },
    openTransactionSwitcherDialog: (params) => {
      store.dialog.open(
        IWebDialogType.TransactionSwitcher,
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
        IWebViewType.vTransactionSwitcher,
        params
      );
    },
    toggleFavorite: () => {
      if (instrument.isFavorite) {
        store.presetsAndCategories.removeInstrumentFromFavorites(instrument.id);
      } else {
        store.presetsAndCategories.addInstrumentToFavorites(instrument.id);
      }
    },
    handleRowEnterPress: (evt) => {
      if (evt.keyCode === 10 || evt.keyCode === 13) {
        self.openNewDealOrLimit();
      }
    },
    openNewLimit: (orderDir, tab) => {
      const params = {
        instrumentId: self.quote && self.quote.id,
        orderDir,
        tab,
        transactionType: IWebETransactionSwitcher.NewLimit,
      };
      self.openTransactionSwitcherDialog(params);
    },
    openNewDeal: (orderDir, tab) => {
      const params = {
        instrumentId: self.quote && self.quote.id,
        orderDir,
        tab,
        transactionType: IWebETransactionSwitcher.NewDeal,
      };
      self.openTransactionSwitcherDialog(params);
    },
    openNewDealOrLimit: (orderDir = IWebEOrderDir.None, tab) => () => {
      if (
        store.customer.brokerAllowLimitsOnNoRates &&
        ((self.quote && self.quote.state === IWebEQuoteStates.Disabled) ||
          store.clientStateFlags.isMarketCLosed)
      ) {
        self.openNewLimit(orderDir, tab);
      } else {
        self.openNewDeal(orderDir, tab);
      }
    },

    get isCashBackIconVisible() {
      return (
        instrument.instrumentData.weightedVolumeFactor !== undefined &&
        instrument.instrumentData.weightedVolumeFactor > 1 &&
        store.portofolio.pendingBonusType === IWebEPendingBonusType.cashBack &&
        toNumeric(store.portofolio.pendingBonus) > 0
      );
    },
    get isAvailable() {
      return (
        self.quote &&
        self.quote.isActive &&
        !store.clientStateFlags.isMarketCLosed
      );
    },
    get formattedChange() {
      const value = toPercent((self.quote && self.quote.twoDigitChange) || 0);
      let stylingClass = "";

      if (self.quote && self.quote.twoDigitChange !== undefined) {
        self.quote.twoDigitChange === 0
          ? (stylingClass = "")
          : self.quote.twoDigitChange > 0
          ? (stylingClass = "greenText")
          : (stylingClass = "redText");
      }

      return {
        value,
        stylingClass,
      };
    },
  }));
