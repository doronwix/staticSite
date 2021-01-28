import React, { FunctionComponent, useMemo } from "react";
import { isFunction } from "lodash-es";
import { observer } from "mobx-react-lite";

interface IIfConditionProps {
  condition: (() => boolean) | boolean;
  children: React.ReactNode | string;
}

export const IfCondition: FunctionComponent<IIfConditionProps> = ({
  condition,
  children,
}) => {
  const evalCondition = useMemo(
    () => (isFunction(condition) ? condition() : condition),
    [condition]
  );

  return evalCondition ? <>{children}</> : null;
};

export default observer(IfCondition);
