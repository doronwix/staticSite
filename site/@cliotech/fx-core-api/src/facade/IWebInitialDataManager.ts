export interface IWebInitialDataManager {
  prop: {
    initialScreen: {
      screenId?: number;
    };
    customQuotesUIOrder: Array<[number, string]>;
  };
}
