jest.enableAutomock();
jest.unmock("../FxComponentDemoIcon");

import React from "react";
import FxComponentDemoIcon from "../FxComponentDemoIcon";
import { useDemoIconViewModel } from "../FxComponentDemoIconViewModel";
import { mount } from "enzyme";

const useDemoIconViewModelMock = useDemoIconViewModel as jest.Mock;

describe("FxComponentDemoIcon", () => {
  it("should render without exploding", () => {
    useDemoIconViewModelMock.mockImplementationOnce(() => ({
      isCustomerDemo: true,
      isEligableToDemoDeposit: true,
      isProcessing: false,
      tooltipMessage: "other",
      onClick: jest.fn(),
    }));
    const wrapper = mount(<FxComponentDemoIcon />);
    expect(wrapper.length).toBe(1);
  });
});
