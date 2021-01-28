import React from "react";
import { observer } from "mobx-react-lite";
import IfCondition from "../IfCondition/IfConditions";
import cn from "classnames";

import Currency from "../Currency/Currency";
import ProgressBar from "./ProgressBar";

import { useAnimateCashback, useCashBackData } from "./LiveCashBackModel";

export const LiveCashBack = () => {
  const data = useCashBackData();

  useAnimateCashback(data);
  return (
    <React.Fragment>
      <IfCondition condition={!data.isAdvancedView}>
        <div className="cashback-icon left">
          <span
            className={cn({
              icon: true,
              static: !data.animate,
              animating: data.animate,
            })}
          ></span>
        </div>
      </IfCondition>
      <span className="greenText right ltr">
        <Currency decimals={0}>{`${data.cashBack}`}</Currency>
        {"/"}
        <Currency decimals={0}>{`${data.maxCashBack}`}</Currency>
      </span>
      <IfCondition condition={!data.isAdvancedView}>
        <ProgressBar
          minValue={0}
          maxValue={data.maxCashBack}
          value={data.cashBack}
        />
      </IfCondition>
    </React.Fragment>
  );
};

export default observer(LiveCashBack);
