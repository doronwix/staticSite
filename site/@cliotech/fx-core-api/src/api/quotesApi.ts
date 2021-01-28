import { IWebFacade } from "../facade/IWebFacade";
import { reduce } from "lodash-es";
import { IQuoteSnapshotIn } from "../entities/PresetsAndCategories/quote/Quote";
import { Dictionary } from "lodash";

export interface IQuotesApi {
  subscribeToQuotesManager: (
    cb: (quotes: Dictionary<IQuoteSnapshotIn>) => void
  ) => () => void;
}

export default ({ QuotesManager }: IWebFacade): IQuotesApi => ({
  subscribeToQuotesManager: (
    cb: (quotes: Dictionary<IQuoteSnapshotIn>) => void
  ) => {
    let first = true;
    const cbFunc = (quoteIds: number[]) => {
      const populatedQuotes = reduce<number, Dictionary<IQuoteSnapshotIn>>(
        quoteIds,
        (quotesWithData, qid) => {
          const qmQuote = QuotesManager.Quotes.GetItem(qid);
          if (qmQuote) {
            quotesWithData[qid] = qmQuote;
          }
          return quotesWithData;
        },
        {}
      );

      cb(populatedQuotes);
    };

    if (first) {
      first = false;
      cb(QuotesManager.Quotes.Container);
    }

    QuotesManager.OnChange.Add(cbFunc);
    return () => QuotesManager.OnChange.Remove(cbFunc);
  },
});
