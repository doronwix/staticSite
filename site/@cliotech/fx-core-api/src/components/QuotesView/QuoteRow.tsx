import React, { FunctionComponent, Fragment } from "react";
import cn from "classnames";
import FormatedQuoteValue from "./FormattedQuoteValue";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";
import { useQuoteRowData } from "./QuoteRowViewModel";
import { IWebEOrderDir } from "../../facade/enums/IWebEOrderDir";
import { IWebENewDealTool } from "../../facade/enums/IWebENewDealTool";
import { useDrag, useDrop } from "react-dnd";
import InstrumentIcon from "../InstrumentIcon/InstrumentIcon";
import PriceAlert from "./PriceAlert";
import { IQuoteType } from "../../entities/PresetsAndCategories/quote/Quote";
import QuoteRate from "./QuoteRate";
import { observer, useObserver } from "mobx-react-lite";
import { IWebEHighLowStates } from "../../facade/enums/IWebEHighLowStates";
import Translate from "../Translate/Translate";

interface IQuoteRowProps {
  id: number;
  instrument: IInstrumentType;
  findRow: (id: number) => { index: number; instrument: IInstrumentType };
  moveRow: (id: number, atIndex: number) => void;
  quote?: IQuoteType;
  favoritePreset: boolean;
}

interface IItem {
  id: number;
  type: string;
}

const QuoteRow: FunctionComponent<IQuoteRowProps> = ({
  id,
  instrument,
  findRow,
  moveRow,
  favoritePreset,
}) => {
  const data = useQuoteRowData(instrument);

  const originalIndex = findRow(id).index;

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: "QUOTE_ROW", id: instrument.id, originalIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),

    begin: (_monitor) => {
      data.postEvent("favorite-instruments-reorder-drag", instrument.id);
    },
    end: (dropResult, monitor) => {
      const { id: droppedId, originalIndex } = monitor.getItem();
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveRow(droppedId, originalIndex);
      }
    },
  });

  const [, drop] = useDrop({
    accept: "QUOTE_ROW",
    canDrop: () => false,
    hover({ id: draggedId }: IItem) {
      if (draggedId !== id) {
        const { index: overIndex } = findRow(id);
        moveRow(draggedId, overIndex);
      }
    },
  });

  return (
    <tr
      id={`quote-row-${instrument.id}`}
      tabIndex={-1}
      className={cn("real-row", {
        [`instrument-row-${instrument.id}`]: true,
        "ui-sortable-placeholder-react": isDragging,
      })}
      onKeyDown={data.handleRowEnterPress}
      ref={(node) => preview(drop(node))}
    >
      <td className="favorite" onClick={data.toggleFavorite}>
        <i
          className={cn("star-outline", {
            favorite: instrument.isFavorite,
          })}
          title={data.getValue(
            instrument.isFavorite ? "tooltipRemoveFavorite" : "tooltipFavorite"
          )}
        />
      </td>
      <td
        className="instrument ccpairs"
        onClick={data.openNewDealOrLimit(IWebEOrderDir.None)}
      >
        <div className="aside symbolWrap">
          <InstrumentIcon
            instrument={instrument}
            customClassName="middle-content"
          />
        </div>
        <div
          className="instrument-name-wrapper"
          title={instrument.instrumentData.tooltip}
          // TODO: investigate this setDialogPos
          // data-bind="setDialogPos: $.extend({ dialogOptions: $viewModelsManager.VmDialog.getOptions }, $viewModelsManager.VmQuotes.getDialogPos)"
        >
          <span
            className={cn({
              ltr: !instrument.instrumentData.isRtl,
            })}
          >
            {instrument.instrumentData.longName}
          </span>
        </div>

        <div className="aside instrument-buttons">
          <ul className="middleContent">
            {data.isCashBackIconVisible && (
              <li className="cashBackHolder">
                <a
                  className="cashBack"
                  title={data.getValue("gridCashBackIconTooltip")}
                  // data-bind="balloon: {
                  //                             tooltipClass: 'tooltip tooltipBottom cashback-tooltip',
                  //                             position: { my: 'center bottom', at: 'center+8 top-11' }
                  //                         },
                  //                         attr: { title: '%tooltip' },
                  //                         formattedText: [Format.toRoundNumber((weightedVolumeFactor() - 1) * 100)],
                  //                         encodeHTML: true,
                  //                         useAttr: 'title',
                  //                         contentKey: 'gridCashBackIconTooltip'"
                />
                <span>{`X${instrument.instrumentData.weightedVolumeFactor}`}</span>
              </li>
            )}
            {instrument.instrumentData.hasSignal && (
              <li>
                <a
                  className="signalArrow"
                  title={data.getValue("tooltipSignals")}
                  onClick={data.openNewDealOrLimit(
                    IWebEOrderDir.None,
                    IWebENewDealTool.Signals
                  )}
                />
              </li>
            )}
            <li>
              <PriceAlert instrument={instrument} />
            </li>
          </ul>
        </div>
      </td>
      <td
        className="rate bidWidth"
        onClick={data.openNewDealOrLimit(
          instrument.instrumentData.isStock
            ? IWebEOrderDir.None
            : IWebEOrderDir.Sell
        )}
      >
        <QuoteRate
          quote={data.quote}
          quoteKey={"bid"}
          instrument={instrument}
          visible={data.isAvailable && !instrument.instrumentData.isStock}
        />
      </td>
      <td
        className="rate askWidth ask-column"
        onClick={data.openNewDealOrLimit(IWebEOrderDir.Buy)}
      >
        <QuoteRate
          quote={data.quote}
          quoteKey={"ask"}
          instrument={instrument}
          visible={data.isAvailable}
        />
      </td>

      <td
        className={cn(
          "rate",
          "ltr",
          "changePercentWidth",
          data.formattedChange.stylingClass
        )}
        onClick={data.openNewDealOrLimit()}
        // data-bind="setDialogPos: $viewModelsManager.VmQuotes.getDialogPos"
      >
        {data.quote ? <span>{data.formattedChange.value}</span> : <span />}
      </td>

      <td className="rate highLow-column" onClick={data.openNewDealOrLimit()}>
        {useObserver(() => {
          switch (data.quote?.highLowState) {
            case IWebEHighLowStates.NA:
              return <Translate el="span" value="highLowNA" />;
            case IWebEHighLowStates.MarketClosed:
              return (
                <Translate
                  el="span"
                  value="highLowMarketClosed"
                  className="grayText"
                />
              );
            case IWebEHighLowStates.Active:
            default:
              return data.quote?.highBid && data.quote?.lowAsk ? (
                <Fragment>
                  <FormatedQuoteValue
                    instrument={instrument}
                    value={data.quote?.highBid}
                  />
                  <span> / </span>
                  <FormatedQuoteValue
                    instrument={instrument}
                    value={data.quote?.lowAsk}
                  />
                </Fragment>
              ) : null;
          }
        })}
      </td>

      {favoritePreset && (
        <td className="re-order" ref={drag} id={`ui-drag-${instrument.id}`}>
          <i className="ico-font drag-up-down" />
        </td>
      )}
    </tr>
  );
};

export default observer(QuoteRow);
