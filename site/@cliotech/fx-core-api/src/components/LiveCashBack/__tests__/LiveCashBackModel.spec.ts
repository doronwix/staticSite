import testHook from "../../../__testUtils__/testHookUtility";
import {
  useCashBackData,
  ILiveCashBackProps,
  useAnimateCashback,
} from "../LiveCashBackModel";
import { act } from "react-dom/test-utils";
import StoreApi from "../../../index";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../../facade/IWebFacade";
import { IDataStoreSnapshotIn } from "../../../store";

jest.mock("../../../index");
jest.mock("../../../api/index");

/**
 * this test uses another testing strategy where we actually MOCK the provided store
 */

// we use jest to control setTimeout & any timers of this sort
jest.useFakeTimers();

const facade = mock<IWebFacade>();
const mockInitData = mock<IDataStoreSnapshotIn>();

describe("CashBackModel & Hooks", () => {
  it("Should act on store data changes", () => {
    const store = StoreApi.createStore(mockInitData, facade);
    let myData: ILiveCashBackProps | undefined;
    myData = myData as ILiveCashBackProps;
    // we create a fake store that useObservableData will get data from, just a plain observable
    // we get the data and the rendered component wrapper
    const _wrapper = testHook(() => {
      myData = useCashBackData();
    }, store);
    // first set of assertions, initial state
    expect(myData.isAdvancedView).toBe(
      store.customerProfile.advancedWalletView
    );
    expect(myData.cashBack).toBe(1500);
    /**
     * we put it in an act because
     * when we update this, the useAnimateCashBack will trigger
     * in that hook we have a reacton that triggers a setState - `setAnimate`
     * it will work without an act just that react will cry that we use setState in an async action without telling it
     */
    act(() => {
      store.bonus.amountBase = 16000;
    });
    // we force a rerender so the hook reruns and our callback gets called
    // new set of assertions
    expect(myData.cashBack).toBe(16000);
  });
});
