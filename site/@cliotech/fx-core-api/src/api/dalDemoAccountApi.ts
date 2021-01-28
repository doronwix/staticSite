import { IWebFacade } from "../facade/IWebFacade";

export interface IDalDemoAccountApi {
  processDemoDeposit: () => Promise<void>;
}

const dalDemoAccountApi = (facet: IWebFacade) => ({
  processDemoDeposit: () => {
    return new Promise<void>((resolve, reject) => {
      facet.DalDemoAccount.processDemoDeposit((result) => {
        try {
          const data: { isSuccesfull: boolean } = JSON.parse(result);
          if (data.isSuccesfull === true) {
            resolve();
          } else {
            reject(new Error("Operation not returned as succesfull"));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  },
});

export default dalDemoAccountApi;
