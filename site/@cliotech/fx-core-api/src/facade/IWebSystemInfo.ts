export interface IWebSystemInfo {
  get: <T>(key: string, defaultValue?: T) => T;
  save: <T>(key: string, value: T) => T;
}
