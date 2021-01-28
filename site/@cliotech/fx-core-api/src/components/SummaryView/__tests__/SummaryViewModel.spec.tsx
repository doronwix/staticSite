// jest.enableAutomock();

import { mock } from "jest-mock-extended";
import StoreAPI from "../../../index";
import { useSummaryStoreData, IViewInjectedProps } from "../SummaryViewModel";
import { IWebFacade } from "../../../facade/IWebFacade";
import { IDataStoreSnapshotIn } from "../../../store";
import testHook from "../../../__testUtils__/testHookUtility";

jest.mock("../../../index");
jest.mock("../../../api/index");

/**
 * We cast the import function as the mock - it's mocked anyway since it's in __mocks__
 * it's so typescript knows it's actually a mock and won't throw when trying to access mocked instance properties like `mockImplementation`
 */

const facade = mock<IWebFacade>();
const mockFakeData = mock<IDataStoreSnapshotIn>();

// we can use ReturnType to assert what the view model returns without having to retype it

describe("Sumary View Model", () => {
  it("marginLevel should be true/false based on input from store data", async () => {
    const store = StoreAPI.createStore(mockFakeData, facade);

    let myData: IViewInjectedProps | undefined;
    /**
     * we have to do a little type juggling here as TS cannot know that the call back actually ran
     * so we cast mydata as 'defined' of type otherwise TS would see it as undefined when asserting on it
     */
    myData = myData as IViewInjectedProps;

    const _wrapper = testHook(() => {
      myData = useSummaryStoreData();
    }, store);

    // we make our first assertions based on the data
    expect(myData.marginLevel).toStrictEqual({
      value: 1,
      isVisible: true,
    });

    // the mock store is unprotected, we can mutate stuff in the store without actions
    store.customerProfile.advancedWalletView = false;

    // we now assert on the data again
    expect(myData.marginLevel).toStrictEqual({
      value: 1,
      isVisible: false,
    });
  });

  it("useSwitchViewVisible should call postEvent and switchViewVisible in the store", () => {
    const store = StoreAPI.createStore(mockFakeData, facade);
    let myData: IViewInjectedProps | undefined;

    myData = myData as IViewInjectedProps;

    /**
     * as the mock store is unprotected
     * we can put mocks directly on the actions
     */

    store.dialog.postEvent = jest.fn();
    store.dialog.switchViewVisible = jest.fn();

    testHook(() => {
      myData = useSummaryStoreData();
    }, store);

    myData.useSwitchViewVisible();

    expect(store.dialog.postEvent).toHaveBeenCalled();
    expect(store.dialog.switchViewVisible).toHaveBeenCalled();
  });
});
