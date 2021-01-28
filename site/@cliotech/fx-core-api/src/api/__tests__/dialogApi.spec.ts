import dialogApi from "../dialogApi";
import { IWebDialogType } from "../../facade/enums/IWebDialogType";
import { IWebViewType } from "../../facade/enums/IWebViewType";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const facade = mock<IWebFacade>({}, { deep: true });

describe("Dialog Api tests", () => {
  it("should call `open` on DialogViewModel", () => {
    const api = dialogApi(facade);
    api.open(
      IWebDialogType.AccountCardRecords,
      {},
      IWebViewType.vAccountCardRecords
    );
    expect(facade.DialogViewModel.open).toHaveBeenCalledWith(
      IWebDialogType.AccountCardRecords,
      {},
      IWebViewType.vAccountCardRecords
    );
  });
});
