jest.enableAutomock();
jest.unmock("../Translate");
jest.unmock("../../../utils/hooks");
jest.unmock("../../../context");
import React from "react";
import Translate from "../Translate";
import { observable } from "mobx";

import { mount } from "enzyme";
import { StoreProvider } from "../../../context";
import { IDataStoreType } from "../../../store";

describe("Translate Component", () => {
  it("should run as expected", () => {
    const getValueMock = jest.fn();
    // TODO: need to create that store mock to proparly fix this
    const mockStore = (observable({
      dictionary: {
        getValue: getValueMock,
      },
    }) as unknown) as IDataStoreType;

    const mockProps = {
      value: "test",
      context: "test",
      defaultValue: "test",
    };

    const wrapper = mount(
      <StoreProvider store={mockStore}>
        <Translate el="div" {...mockProps} />
      </StoreProvider>
    );

    expect(wrapper.find("div").length).toBe(1);
    expect(getValueMock).toHaveBeenCalledWith(
      mockProps.value,
      mockProps.context,
      mockProps.defaultValue
    );
  });
});
