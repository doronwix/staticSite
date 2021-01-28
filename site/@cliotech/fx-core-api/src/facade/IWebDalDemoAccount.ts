export interface IWebDalDemoAccount {
  processDemoDeposit: (onComplete: (result: string) => void) => void;
}
