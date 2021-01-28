import { IWebDictionary } from "../facade/IWebDictionary";
import { IWebFacade } from "../facade/IWebFacade";

export type IDictionaryApi = IWebDictionary;

const dictionaryApi = (facet: IWebFacade) => {
  return facet.Dictionary;
};

export default dictionaryApi;
