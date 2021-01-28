import React from "react";
import { StoreProvider } from "../../context";
import { wrapComponentWithProvider } from "../wrapWithProvider";
import { FunctionComponent, ReactNode } from "react";
import { mount } from "enzyme";
import { IDataStoreType } from "../../store";
jest.mock("../../context", () => {
  // tslint:disable-next-line: no-shadowed-variable
  const StoreProvider = jest.fn<ReactNode, any>(({ children }) => (
    <div id="provider">{children}</div>
  ));
  return {
    StoreProvider,
  };
});

describe("Wrap With Provider", () => {
  it("should call Provider and wrap component with it", () => {
    const MockComp: FunctionComponent = () => <div>Hello World!</div>;
    const MyComponent = () =>
      wrapComponentWithProvider(MockComp, {} as IDataStoreType);
    const wrapper = mount(<MyComponent />);

    expect(StoreProvider).toHaveBeenCalled();
    expect(wrapper.find("#provider").length).toBe(1);
  });
});
