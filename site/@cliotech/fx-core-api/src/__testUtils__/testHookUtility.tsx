/**
 * this file WILL NOT BE MOCKED if you use jest.autoMock
 * this is a test utility for testing custom hooks
 * we'll probably use it a lot for testing hooks that get data into components
 */

import React from "react";
import { mount } from "enzyme";
import { IDataStoreType } from "../store";
import { StoreProvider } from "../context";

/**
 * Just an empty react component in which we'll inject our hook
 *
 */

function TestHook({ callback }: { callback: () => void }) {
  callback();
  return null;
}

/**
 * @example
 * let myHookReturn: T | undefined
 * // you might have to cast it manually because typescript won't know it's populated - it'll happen in a callback
 * myHookReturn = myHookReturn as T;
 *
 * const wrapper = testHook(() => {
 *  myHookReturn = useCustomHookThatYouReTesting()
 * })
 *
 * // you can now assert on wrapper - an empty component
 * // and on myHookReturn - actual hook data
 */

/**
 * the hook also takes a 2nd parameter that injects a store
 * store can be a plain object, but I'd advise wrapping it in an observer
 * so we can test updates to it in hooks that use observable data
 */
function testHook<T>(callback: () => void, store?: IDataStoreType) {
  if (store !== undefined) {
    return mount(
      <StoreProvider store={store}>
        <TestHook callback={callback} />
      </StoreProvider>
    );
  }
  return mount(<TestHook callback={callback} />);
}

export default testHook;
