import { IWebTDelegate } from "./IWebTDelegate";
import { IWebQuote } from "./IWebQuote";
import { IWebHashTable } from "./IWebHashTable";

export interface IWebQuotesManager {
  OnChange: IWebTDelegate<[number[]]>;
  Quotes: IWebHashTable<IWebQuote>;
}
