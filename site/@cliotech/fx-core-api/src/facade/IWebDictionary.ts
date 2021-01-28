export type IWebGetItemFn = (
  key: string,
  resourceName?: string,
  defaultValue?: string
) => string;

export interface IWebDictionary {
  AddResource: (resourceName: string, content: string) => void;
  GetItem: IWebGetItemFn;
  GetAllKeys: (resourceName: string) => Array<string>;
  GetAllItemsForResource: (resourceName: string) => string;
  GetGlobalItem: (key: string, defaultValue?: string) => string;
  GetTemplate: (key: string) => string;
  ValueIsEmpty: (key: string, resourceName: string) => boolean;
}
