import { IWebSysInfoInstrument } from "../../facade/IWebSysInfoInstrument";

const inst1: IWebSysInfoInstrument = [
  45616,
  "99",
  1,
  0,
  "MANU/USD",
  1,
  510,
  "",
  "100,000.00",
  4.8,
  4.8,
  3,
  2,
  3,
  2,
  3,
  "",
  4,
  946,
  47,
  "",
  "",
  "",
  "Manchester United",
  "1",
  "",
  "",
  0,
];

const inst2: IWebSysInfoInstrument = [
  20759,
  "99",
  1,
  0,
  "ITOCHU/JPY",
  1,
  470,
  "",
  "94,000.00",
  5.7,
  5.7,
  1,
  0,
  4,
  2,
  3,
  "",
  4,
  849,
  23,
  "",
  "",
  "",
  "ITOCHU",
  "1",
  "",
  "",
  2.3,
];

const inst3: IWebSysInfoInstrument = [
  46094,
  "99",
  1,
  0,
  "FER/EUR",
  1,
  400,
  "",
  "80,000.00",
  5.6,
  5.6,
  3,
  2,
  3,
  2,
  3,
  "",
  4,
  180,
  14,
  "FER",
  "Bolsa de Madrid",
  "",
  "Ferrovial",
  "1",
  "",
  "",
  2.2,
];

export const mockInstruments: IWebSysInfoInstrument[] = [inst1, inst2, inst3];