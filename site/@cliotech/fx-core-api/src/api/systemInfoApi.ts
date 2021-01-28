import { IWebFacade } from "../facade/IWebFacade";

export interface ISystemInfoApi {
  get: <T>(key: string, defaultValue?: T) => T;
  save: <T>(key: string, value: T) => void;
}

const systemInfoApi = (facet: IWebFacade): ISystemInfoApi => ({
  get: facet.SystemInfo.get,
  save: facet.SystemInfo.save,
});

export default systemInfoApi;
