export interface IWebWalletConfiguration {
  formatConditionalVolume: boolean;
  useAdvancedView: boolean;
  supressDialog?: boolean;
  isVisibleUsedMargin?: boolean;
}

export interface IWebInitialConfiguration {
  WalletConfiguration: IWebWalletConfiguration;
}
