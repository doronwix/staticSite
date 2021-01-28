import React, { FunctionComponent, useEffect } from "react";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useDemoIconViewModel } from "./FxComponentDemoIconViewModel";
import IfCondition from "../IfCondition/IfConditions";
import Tooltip from "../Tooltip/Tooltip";

const FxComponentDemoIcon: FunctionComponent = () => {
  const data = useDemoIconViewModel();

  // useEffect with observables https://mobx-react.js.org/recipes-effects
  useEffect(
    () =>
      reaction(
        () => data.selectedCcyId,
        () => {
          if (data.selectedCcyId) {
            data.getInBetweenQuote();
          }
        },
        {
          fireImmediately: true,
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <IfCondition
      condition={
        data.isCustomerDemo &&
        (data.isEligableToDemoDeposit || data.isProcessing)
      }
    >
      <div className="equity-demo-deposit">
        <IfCondition condition={data.isEligableToDemoDeposit}>
          <Tooltip content={data.tooltipMessage}>
            <i
              className="icon-equity"
              onClick={data.depositClick}
              data-automation={"demodeposit-button"}
            />
          </Tooltip>
        </IfCondition>

        <IfCondition condition={data.isProcessing}>
          <div className="equity-spinner" />
        </IfCondition>
      </div>
    </IfCondition>
  );
};

/**
 * wrap every component that uses store data in an observer
 * mobx will then control the rendering process optimizing it
 */

export default observer(FxComponentDemoIcon);
