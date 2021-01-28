import { IWebEOrderDir } from "./enums/IWebEOrderDir";
import { IWebElimitType } from "./enums/IWebELimitType";
import { IWebELimitMode } from "./enums/IWebELimitMode";

export interface IWebLimit {
  orderId: string;
  instrumentID: number;
  positionNumber: string;
  orderDir: IWebEOrderDir;
  orderRate: string;
  buySymbolId: number;
  buyAmount: string;
  sellSymbolId: number;
  sellAmount: string;
  type: IWebElimitType;
  mode: IWebELimitMode;
  expirationDate: string;
  entryTime: string;
  slRate: string;
  tpRate: string;
  otherLimitID: string;
  status?: string;
}
