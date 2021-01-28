import React from "react";
import { mount } from "enzyme";
import { IfCondition } from "../IfConditions";

describe("IfCondition Component", () => {
  it("should render content for condition = true", () => {
    const x1 = mount(<IfCondition condition={true}>Stuff</IfCondition>);
    expect(x1.html()).toBe("Stuff");
  });

  it("should not render content for condition = false", () => {
    const x2 = mount(<IfCondition condition={false}>Other</IfCondition>);
    expect(x2.html()).toBe(null);
  });

  it("should evaluate condition if it is a function", () => {
    const condition = jest.fn(() => false);
    const x3 = mount(<IfCondition condition={condition}>New</IfCondition>);
    expect(condition).toHaveBeenCalled();
    expect(x3.html()).toBe(null);
  });
});
