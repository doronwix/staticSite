export interface IWebEPresetTypes {
  [key: string]: number;
}

export enum IWebEPresetOrder {
  None = 0,
  Ascending = 1,
  Descending = 2,
}

export enum IWebEInstrumentType {
  Mixed = 0, // Main Tab
  Currencies = 1,
  Commodities = 2,
  Indices = 3,
  Shares = 4,
  ETF = 8,
  Crypto = 9,
  Stocks = 10,
}

export interface IWebPresetSubCategory {
  label: string;
  order: number;
  columnId: number;
  sortAlphabetically?: boolean;
}

export interface IWebPresetsCategoryPresetInfo {
  id: number;
  subCategory: IWebPresetSubCategory;
}

export interface IWebPresetsCategoryData {
  presets: {
    [P in keyof IWebEPresetTypes]: IWebPresetsCategoryPresetInfo;
  };

  ascOrderPresetIds: number[];
  descOrderPresetIds: number[];
  categoryName: string;
  presetOrder: number;
  sortPresetsAlphabetically?: boolean;
  instrumentType: IWebEInstrumentType;
  searchPresetIds: number[];
}
