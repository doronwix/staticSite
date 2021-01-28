import cn from "classnames";
import React, { FunctionComponent, memo } from "react";
import styles from "./Icon.less";

export type IIconTypes = "more-info" | "tooltip" | "link" | "plus" | "remove";

export interface IIconProps {
  icon: IIconTypes;
  className?: string;
}

/**
 * Typescript way to declare conditional props
 * withTooltip = true - tooltip must be defined and string, withTooltip?: false | undefined .. no need for tooltip
 * we make a intersection of these when defining
 * one downside of it we can't use destructuring in function
 */

const Icon: FunctionComponent<IIconProps> = (props) => {
  return (
    <i
      className={cn(
        styles.icon,
        styles[`ico-ss-${props.icon}`],
        props.className
      )}
    />
  );
};

export default memo(Icon);
