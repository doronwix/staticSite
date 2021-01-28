import React, { FunctionComponent, useMemo } from "react";
import cn from "classnames";
import Tooltip from "../Tooltip/Tooltip";
import { observer } from "mobx-react-lite";
import useWithSetState from "../../utils/hooks";

interface ISummaryInjectedProps {
  getValue: (key: string, context?: string) => string;
}

interface ISummaryActionItemProps {
  head?: boolean;
  id: string;
  text: string;
  toolTip?: string;
  plusAction?: () => void;
  plusActionDisabled?: boolean;
  rightAction?: () => void;
}

const useSummaryActionItemModel = () =>
  useWithSetState<ISummaryInjectedProps>((_self, stores) => ({
    getValue: stores.dictionary.getValue,
  }));

const SummaryActionItem: FunctionComponent<ISummaryActionItemProps> = ({
  head,
  id,
  text,
  toolTip,
  plusAction,
  plusActionDisabled,
  rightAction,
}) => {
  const { getValue } = useSummaryActionItemModel();

  const renderedTooltip = useMemo(() => {
    return toolTip ? (
      <span dangerouslySetInnerHTML={{ __html: toolTip }} />
    ) : (
      undefined
    );
  }, [toolTip]);

  return (
    <div className="info-wrapper">
      <span
        id={id}
        dangerouslySetInnerHTML={{ __html: text }}
        className={cn({
          bold: head,
        })}
      />{" "}
      <React.Fragment>
        {" "}
        <div className="icon-wrapper">
          {renderedTooltip ? (
            <Tooltip content={renderedTooltip}>
              <i
                data-automation={`tooltip-${id}`}
                className="ico-wb-tooltip "
              />
            </Tooltip>
          ) : null}
          {plusAction ? (
            <React.Fragment>
              {" "}
              <i
                className="ico-wb-more-info"
                data-automation={`button-1-${id}`}
                title={getValue("tooltipMoreInfo")}
                onClick={!plusActionDisabled ? plusAction : undefined}
              />
            </React.Fragment>
          ) : null}
          {rightAction ? (
            <React.Fragment>
              {" "}
              <i
                className="ico-wb-link"
                onClick={rightAction}
                data-automation={`button-2-${id}`}
                title={getValue("tooltipViewAll")}
              />
            </React.Fragment>
          ) : null}
        </div>
      </React.Fragment>
    </div>
  );
};

export default observer(SummaryActionItem);
