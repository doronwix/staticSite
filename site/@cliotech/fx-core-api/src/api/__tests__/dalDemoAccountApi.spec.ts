import dalDemoAccountApi from "../dalDemoAccountApi";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";
import { IWebDalDemoAccount } from "../../facade/IWebDalDemoAccount";

const facade = mock<IWebFacade>();

const DalDemoAccountMock = mock<IWebDalDemoAccount>();
DalDemoAccountMock.processDemoDeposit.mockImplementationOnce((cb) => {
  cb(`{"isSuccesfull": true}`);
});

facade.DalDemoAccount = DalDemoAccountMock;

describe("DalDemoAccount API tests", () => {
  it("should resolve if data is json and result has key isSuccesfull", async () => {
    const api = dalDemoAccountApi(facade as IWebFacade);

    await api.processDemoDeposit();
    expect(DalDemoAccountMock.processDemoDeposit).toHaveBeenCalled();
  });
});
