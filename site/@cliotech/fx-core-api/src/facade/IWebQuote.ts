import { IWebEQuoteStates } from "./enums/IWebEQuoteStates";

export interface IWebQuote {
  id: number;
  bid: string;
  ask: string;
  open: string;
  high?: string;
  low?: string;
  highBid: string;
  lowAsk: string;
  tradeTime: string;
  change: number;
  changePips: number;
  state: IWebEQuoteStates;
  close: string;
}
