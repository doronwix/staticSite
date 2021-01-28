/* eslint-disable react/display-name */
/*
 * By default we use jest automock to mock ALL dependencies
 */
jest.enableAutomock();
// we unmock the actual component

jest.unmock("../SummaryView");
jest.unmock("../../IfCondition/IfConditions");

import React from "react";
import { mount } from "enzyme";

/**
 * if using the default that is wrapped with 'observer(SummaryView)' enzyme will not be able to control the rendering
 */
import { SummaryView } from "../SummaryView";
import { baseMockData } from "../__mocks__/SummaryViewModel";
import { useSummaryStoreData, IViewInjectedProps } from "../SummaryViewModel";

const useSummaryStoreDataMock = useSummaryStoreData as jest.Mock<
  IViewInjectedProps,
  any
>;

describe("SummaryView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should render for a default set of props", () => {
    const wrapper = mount(<SummaryView />);
    expect(wrapper.length).toBe(1);
  });

  it('should not render ".accountSummaryMode" and ".overview" for financialSummaryDetailsVisibility = false', () => {
    useSummaryStoreDataMock.mockImplementation(() => ({
      ...baseMockData,
      financialSummaryDetailsVisibility: false,
    }));

    const wrapper = mount(<SummaryView />);

    expect(wrapper.find("div.accountSummaryMode").length).toBe(0);
    expect(wrapper.find("div.overview").length).toBe(0);
  });

  it('should render ".accountSummaryMode" and ".overview" for financialSummaryDetailsVisibility = true', () => {
    useSummaryStoreDataMock.mockImplementation(() => ({
      ...baseMockData,
      financialSummaryDetailsVisibility: true,
    }));

    const wrapper = mount(<SummaryView />);

    expect(wrapper.find("div.accountSummaryMode").length).toBe(1);
    expect(wrapper.find("div.overview").length).toBe(1);
  });

  it("should render simple/advanced button based on advancedWalletView", async () => {
    /**
     * we mock two calls for useSummaryViewModel to test with true & false
     */
    useSummaryStoreDataMock
      .mockImplementationOnce(() => ({
        ...baseMockData,
        advancedWalletView: true,
      }))
      .mockImplementationOnce(() => ({
        ...baseMockData,
        advancedWalletView: false,
      }));

    const wrapper = mount(<SummaryView />);

    expect(wrapper.find("a#ASExpend").length).toBe(0);
    expect(wrapper.find("a#ASCollapse").length).toBe(1);
    /**
     * we force a re render by setting a new set of empty props ( our component doesn't take any props)
     * on re render we expect our summaryViewModel mock to have been caled again so .. twice
     * and to have the new html
     */
    wrapper.setProps({});

    expect(useSummaryStoreDataMock).toHaveBeenCalledTimes(2);
    expect(wrapper.find("a#ASExpend").length).toBe(1);
    expect(wrapper.find("a#ASCollapse").length).toBe(0);
  });
});
