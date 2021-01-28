import React, { memo } from "react";
import Tippy, { TippyProps } from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
// import cn from "classnames";
import { FunctionComponent } from "react";
import cn from "classnames";

import styles from "./Tooltip.less";

const TooltipWrapper: FunctionComponent<TippyProps> = ({
  children,
  ...props
}) => (
  <Tippy
    {...props}
    maxWidth={props.maxWidth || 383}
    className={cn(styles.tooltip, props.className)}
  >
    {children}
  </Tippy>
);

export default memo(TooltipWrapper);
