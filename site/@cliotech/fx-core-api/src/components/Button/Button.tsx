import React, { FunctionComponent } from "react";
import cn from "classnames";
import styles from "./Button.less";
import Icon from "../Icon/Icon";
import { IIconTypes } from "../Icon/Icon";

interface IButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  btnSize: "small" | "medium" | "large";
  btnStyle: "normal" | "ghost";
  withIcon?: boolean;
  icon?: IIconTypes;
  iconPosition: "left" | "right";
}

const Button: FunctionComponent<IButtonProps> = ({
  withIcon,
  children,
  className,
  icon,
  ...props
}) => {
  return (
    <button className={cn(styles.button, className)} {...props}>
      {children} {withIcon && icon ? <Icon icon={icon} /> : null}
    </button>
  );
};

export default Button;
