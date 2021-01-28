import { IWebTDelegate } from "./IWebTDelegate";

export interface IWebCSHolder {
  accountBalance: string;
  equity: string;
  netExposure: string;
  margin: string;
  exposureCoverage: string;
  totalEquity: string;
  openPL: string;
  usedMargin: string;
  marginUtilizationPercentage: string;
  availableMargin: string;
  marginUtilizationStatus: number;
  maintenanceMargin: string;
}

export interface IWebClientStateHolderManager {
  OnChange: IWebTDelegate<IWebCSHolder>;
  CSHolder: IWebCSHolder;
  ProcessData: (data: Array<any>) => void;
}
