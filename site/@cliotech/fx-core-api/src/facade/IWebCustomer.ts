export interface IWebABTestings {
  configuration: { [key: string]: boolean };
  groupsNames: Array<string>;
  testsNames: Array<string>;
}

export interface IWebCustomerProps {
  maintenanceMarginPercentage: number;
  userName: string;
  accountNumber: number;
  abTestings: IWebABTestings;
  customerType: number;
  minPctEQXP: string;
  selectedCcyId: KnockoutObservable<number>;
  isDemo: boolean;
  hasWeightedVolumeFactor?: boolean;
  isOvernightOnForex?: boolean;
}

export interface IWebCustomer {
  prop: IWebCustomerProps;
}
