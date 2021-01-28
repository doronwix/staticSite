jest.enableAutomock();
jest.unmock("../LiveCashBack");
jest.unmock("../../IfCondition/IfConditions");
jest.unmock("../ProgressBar");

import React from "react";
import { mocked } from "ts-jest/utils";

import { mount } from "enzyme";

import { LiveCashBack } from "../LiveCashBack";
import { useCashBackData, useAnimateCashback } from "../LiveCashBackModel";
import { mockData } from "../__mocks__/LiveCashBackModel";
import ProgressBar from "../ProgressBar";

const useCashBack = mocked(useCashBackData);
const useAnimate = mocked(useAnimateCashback);

describe("LiveCashBack", () => {
  it("should mount", () => {
    const wrapper = mount(<LiveCashBack />);

    expect(wrapper.length).toBe(1);
  });

  it("cashback-icon should not animate for simple view & animate", () => {
    useCashBack.mockImplementationOnce(() => ({
      ...mockData,
      isAdvancedView: false,
    }));
    useAnimate.mockImplementationOnce(() => false);

    const wrapper = mount(<LiveCashBack />);
    expect(wrapper.find("span.icon").hasClass("animating")).toBe(false);
  });

  it("should show ProgressBar in advanced view", () => {
    const wrapper = mount(<LiveCashBack />);
    expect(wrapper.find(ProgressBar).length).toBe(1);
  });
});
