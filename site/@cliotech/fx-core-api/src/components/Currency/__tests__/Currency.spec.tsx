import React from "react";
import styles from "../Currency.less";
import {
  toppedPercentage,
  toPercent,
  toNumberWithCurrency,
} from "../currencyHelpers";

import { Currency } from "../Currency";
import { mount } from "enzyme";

jest.mock("../../../utils/hooks", () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => ({ currencyId: 1 })),
}));

jest.mock("../currencyHelpers.ts", () => ({
  toppedPercentage: jest.fn(() => 14),
  toPercent: jest.fn(() => 14),
  toNumberWithCurrency: jest.fn(() => 14),
  toNumeric: jest.fn(() => 14),
}));

describe("Currency Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("shoudld call toNumberWithCurrency with only value passed", () => {
    const wrapper = mount(<Currency>14</Currency>);
    expect(toNumberWithCurrency).toHaveBeenCalledWith("14", {
      currencyId: 1,
      decimals: 2,
    });
    expect(wrapper.find("span").hasClass(styles.positive)).toBe(false);
    expect(wrapper.find("span").hasClass(styles.negative)).toBe(false);
  });

  it("should apply classes to components when decorate = true", () => {
    const wrapper = mount(<Currency decorate={true}>14</Currency>);
    expect(toNumberWithCurrency).toHaveBeenCalledWith("14", {
      currencyId: 1,
      decimals: 2,
    });

    expect(wrapper.find("span").hasClass(styles.positive)).toBe(false);
    expect(wrapper.find("span").hasClass(styles.negative)).toBe(true);
  });

  it("should call toPercent if showPercent is passed", () => {
    const wrapper = mount(<Currency showPercent={true}>14</Currency>);
    expect(toPercent).toHaveBeenCalledWith("14");
    expect(wrapper.find("span").hasClass(styles.positive)).toBe(false);
    expect(wrapper.find("span").hasClass(styles.negative)).toBe(false);
  });

  it("should call toPercent if showPercent is passed", () => {
    const wrapper = mount(<Currency toppedPercent={true}>14</Currency>);
    expect(toppedPercentage).toHaveBeenCalledWith("14");
    expect(wrapper.find("span").hasClass(styles.positive)).toBe(false);
    expect(wrapper.find("span").hasClass(styles.negative)).toBe(false);
  });
});
