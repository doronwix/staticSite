import React from "react";
import Icon from "../Icon";
import { mount } from "enzyme";
import styles from "../Icon.less";

describe("Icon Component", () => {
  it("should render and add the appropriate icon classname", () => {
    const iconName = "remove";
    const wrapper = mount(<Icon icon={iconName} />);
    expect(wrapper.find("i").hasClass(styles[`ico-ss-${iconName}`])).toBe(true);
  });
});
