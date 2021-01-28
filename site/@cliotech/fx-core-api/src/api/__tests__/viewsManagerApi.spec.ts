import viewsManagerApi from "../viewsManagerApi";
import { IWebEForms } from "../../facade/enums/IWebEForms";
import { IWebFacade } from "../../facade/IWebFacade";

const RedirectToForm = jest.fn<void, [IWebEForms, any?, (() => any)?]>(
  (_view, _args, _cb) => ({})
);

const SwitchViewVisible = jest.fn<void, [IWebEForms, any?, (() => any)?]>(
  (_view, _args, _cb) => ({})
);

// this double cast object -> partial -> full object. TS hack so we don't have to mock the full facade
const facade = {
  ViewsManager: {
    RedirectToForm,
    SwitchViewVisible,
  },
} as Partial<IWebFacade>;

describe("ViewsManager API", () => {
  it("should call redirectToForm on ViewsManager", () => {
    const api = viewsManagerApi(facade as IWebFacade);
    const cbFunc = () => ({});

    api.redirectToForm(IWebEForms.AccountCardRecords, 12, cbFunc);
    expect(RedirectToForm).toHaveBeenCalledWith(
      IWebEForms.AccountCardRecords,
      12,
      cbFunc
    );
  });

  it("should call switchViewVisible on ViewsManager", () => {
    const api = viewsManagerApi(facade as IWebFacade);
    const cbFunc = () => ({});

    api.switchViewVisible(IWebEForms.AccountCardRecords, 12, cbFunc);
    expect(SwitchViewVisible).toHaveBeenCalledWith(
      IWebEForms.AccountCardRecords,
      12,
      cbFunc
    );
  });
});
