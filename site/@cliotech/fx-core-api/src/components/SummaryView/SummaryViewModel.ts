import { IWebDialogType } from "../../facade/enums/IWebDialogType";
import { IWebEPendingBonusType } from "../../facade/enums/IWebEPendingBonusType";
import { IWebViewType } from "../../facade/enums/IWebViewType";
import { IWebEForms } from "../../facade/enums/IWebEForms";
import useWithSetState from "../../utils/hooks";
import { toNumeric } from "../Currency/currencyHelpers";
import { IWebCustomerType } from "../../facade/enums/IWebCustomerType";
import { IWebGetItemFn } from "../../facade/IWebDictionary";

export interface IViewInjectedProps {
  accountBalance: string;
  advancedWalletView: boolean;
  availableMargin: string;
  cashBackVisibility: boolean;
  equity: string;
  exposureCoverage: string;
  financialSummaryDetailsVisibility: boolean;
  getValue: IWebGetItemFn;
  isActive: boolean;
  isDemo: boolean;
  isValidExposureCoverage: boolean;
  maintenanceMargin: string;
  maintenanceMarginPercentage: number;
  maintenanceMarginVisibility: boolean;
  marginLevel: { value: number; isVisible: boolean };
  marginUtilizationPercentage: string;
  maxExposure: string;
  minPctEQXP: string;
  netExposure: string;
  openPL: string;
  pendingBonusCss: boolean;
  pendingWithdrawals: string;
  pendingWithdrawalsVisibility: boolean;
  showAvailableMargin: () => void;
  showCashBack: () => void;
  showDetailedMarginStatus: (evtName: string) => void;
  showExposureSummary: () => void;
  showUsedMargin: () => void;
  totalEquity: string;
  tradingBonus: string;
  tradingBonusVisibility: boolean;
  usedMargin: string;
  usedMarginVisibility: boolean;
  useRedirectToForm: () => void;
  useSwitchViewVisible: () => void;
  useToggleAdvancedView: () => void;
}

export const useSummaryStoreData = () =>
  useWithSetState<IViewInjectedProps>((self, store) => ({
    get openPL() {
      return store.clientState.openPL;
    },
    get maxExposure() {
      return store.portofolio.maxExposure;
    },
    get marginUtilizationPercentage() {
      return store.clientState.marginUtilizationPercentage;
    },
    get maintenanceMargin() {
      return store.clientState.maintenanceMargin;
    },
    get isActive() {
      return store.portofolio.isActive;
    },
    get isDemo() {
      return store.customer.isDemo;
    },
    getValue: store.dictionary.getValue,
    get equity() {
      return store.clientState.equity;
    },
    get accountBalance() {
      return store.clientState.accountBalance;
    },
    get availableMargin() {
      return store.clientState.availableMargin;
    },
    get totalEquity() {
      return store.clientState.totalEquity;
    },
    get usedMargin() {
      return store.clientState.usedMargin;
    },
    get advancedWalletView() {
      return store.customerProfile.advancedWalletView;
    },
    get marginLevel() {
      const totalEq = toNumeric(self.totalEquity);
      const numericUsedMargin = toNumeric(self.usedMargin);
      let value: number;
      if (totalEq === 0 || numericUsedMargin === 0) {
        value = 0;
      } else {
        value = totalEq / numericUsedMargin;
      }
      return {
        value,
        isVisible: self.advancedWalletView && value > 0,
      };
    },
    useSwitchViewVisible: () => {
      store.dialog.postEvent("trading-event", "summary-pending-withdrawals");
      store.dialog.switchViewVisible(IWebEForms.PendingWithdrawal, {});
    },

    get exposureCoverage() {
      return store.clientState.exposureCoverage;
    },

    get minPctEQXP() {
      return store.customer.minPctEQXP;
    },

    get isValidExposureCoverage() {
      return toNumeric(self.exposureCoverage) > toNumeric(self.minPctEQXP);
    },

    showDetailedMarginStatus: (evtName: string) => {
      store.dialog.open(
        IWebDialogType.MarginStatus,
        {
          title: store.dictionary.getValue("MarginStatus", "dialogsTitles"),
          width: 800,
        },
        IWebViewType.vMarginStatus
      );
      store.dialog.postEvent("trading-event", evtName);
    },
    showAvailableMargin: () => {
      self.showDetailedMarginStatus("summary-available-margin");
    },
    showUsedMargin: () => {
      self.showDetailedMarginStatus("summary-used-margin");
    },
    get netExposure() {
      return store.clientState.netExposure;
    },
    showExposureSummary: () => {
      store.dialog.open(
        IWebDialogType.NetExposuresSummaryDialog,
        {
          title: store.dictionary.getValue(
            "lblExposureTitle",
            "summaryview_exposures"
          ),
          dialogClass: "netexposure fx-dialog",
        },
        IWebViewType.vNetExposure
      );
    },
    useRedirectToForm: () => {
      store.dialog.postEvent("action-source", "FinancialSummaryButton");
      store.dialog.redirectToForm(IWebEForms.Deposit);
    },

    showCashBack: () => {
      store.dialog.open(
        IWebDialogType.CashBackDialog,
        {
          title: store.dictionary.getValue(
            "lblCashBackTitle",
            "deals_CashBack"
          ),
          dialogClass: "cashback fx-dialog",
          width: 850,
        },
        IWebViewType.vCashBack,
        store.bonus.amountBase
      );
      store.dialog.postEvent("trading-event", "cashback-from-wallet");
    },
    useToggleAdvancedView: () => {
      !self.advancedWalletView
        ? store.dialog.postEvent("trading-event", "account-summary-advanced")
        : store.dialog.postEvent("trading-event", "account-summary-simple");
      store.customerProfile.toggleAdvancedView();
    },
    get pendingBonusCss() {
      return self.advancedWalletView
        ? 0 < toNumeric(store.portofolio.pendingBonus)
        : 0 !== toNumeric(store.portofolio.pendingBonus);
    },
    get financialSummaryDetailsVisibility() {
      return store.customer.abTestings &&
        store.customer.abTestings.configuration["account-hub-map"]
        ? store.portofolio.isActive ||
            store.customer.customerType === IWebCustomerType.TradingBonus
        : true;
    },

    get usedMarginVisibility() {
      return !!(
        self.advancedWalletView ||
        store.appConfig.walletConfiguration.isVisibleUsedMargin
      );
    },
    get tradingBonus() {
      return store.portofolio.tradingBonus;
    },
    get tradingBonusVisibility() {
      return !!(
        self.advancedWalletView && toNumeric(store.portofolio.tradingBonus) > 0
      );
    },
    get maintenanceMarginPercentage() {
      return store.customer.maintenanceMarginPercentage;
    },
    get maintenanceMarginVisibility() {
      return !!(
        self.advancedWalletView &&
        store.customer.maintenanceMarginPercentage > 0
      );
    },
    get pendingWithdrawals() {
      return store.portofolio.pendingWithdrawals;
    },
    get pendingWithdrawalsVisibility() {
      const numValue = toNumeric(store.portofolio.pendingWithdrawals);
      return numValue > 0;
    },

    get cashBackVisibility() {
      return (
        store.bonus.amountBase > 0 &&
        store.portofolio.pendingBonusType === IWebEPendingBonusType.cashBack
      );
    },
  }));
