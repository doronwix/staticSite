import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";
import { useDrop } from "react-dnd";
import cn from "classnames";

import QuoteRow from "./QuoteRow";
import Translate from "../Translate/Translate";
import FakeQuoteRow from "./FakeQuoteRow";

import useQuotesTableData from "./QuotesTableViewModel";

const FavoritesPlaceholder = () => (
  <table id="QuotesTable">
    <tbody className="empty-quotes-table">
      <tr>
        <td className="no-favorites" colSpan={8}>
          <i className="star-full"></i>
          <Translate
            el="div"
            className="no-favorites-message"
            value={"lblNoFavorites"}
            context={"lblNoFavorites"}
            data-automation-id={"no-favorites-message"}
          />
        </td>
      </tr>
    </tbody>
  </table>
);

const QuotesTable = ({
  tableRef,
  selectedRowRef,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
  selectedRowRef: React.MutableRefObject<number | undefined>;
}) => {
  const localStore = useQuotesTableData();

  const [, dropLocation] = useDrop({ accept: "QUOTE_ROW" });

  useEffect(() => {
    if (selectedRowRef && selectedRowRef.current !== undefined) {
      const el = document.getElementById(`quote-row-${selectedRowRef.current}`);
      if (el && tableRef.current) {
        if (tableRef.current.scrollTo) {
          tableRef.current?.scrollTo({
            top: el.offsetTop,
            behavior: "smooth",
          });
        } else {
          tableRef.current.scrollTop = el.offsetTop;
        }

        selectedRowRef.current = undefined;
        el.focus();
      }
    }
  });

  return (
    <div id="QuotesTableWrapper">
      <div
        id="QuotesTableScroll"
        ref={tableRef}
        className={cn({
          "no-header": localStore.showFavoritesPlacerholder,
        })}
      >
        <div className="theadBg" />
        {localStore.showFavoritesPlacerholder ? (
          <FavoritesPlaceholder />
        ) : (
          <table id="QuotesTable">
            <thead>
              <tr>
                <th className="favorite">
                  <div />
                </th>
                <th className="instrument">
                  <div>
                    <Translate
                      value={"colCCY"}
                      context={"summaryview_quotesgrid"}
                      el="span"
                      id="colCCY"
                    />
                  </div>
                </th>
                <th className="rate bidWidth">
                  <div>
                    <Translate
                      value={"colBid"}
                      el="span"
                      id="colBid"
                      context={"summaryview_quotesgrid"}
                    />
                  </div>
                </th>
                <th className="rate askWidth ask-column">
                  <div>
                    <Translate
                      value={"colAsk"}
                      el="span"
                      id="colAsk"
                      context={"summaryview_quotesgrid"}
                    />
                  </div>
                </th>
                <th className="rate change-percent changePercentWidtw">
                  <div>
                    <Translate
                      value={"colChange"}
                      el="span"
                      id="colChange"
                      context={"summaryview_quotesgrid"}
                    />
                  </div>
                </th>
                <th className="rate highLow-column">
                  <div>
                    <Translate value={"highLowColumn"} el="span" />
                  </div>
                </th>

                {localStore.isFavoritePreset && (
                  <th className="re-order">
                    <div />
                  </th>
                )}
              </tr>
            </thead>

            <tbody
              id="QuotesTable-data-area"
              className={cn({
                favorites: localStore.isFavoritePreset,
              })}
              ref={dropLocation}
            >
              {localStore.selectedPreset &&
                localStore.selectedPreset.instruments.map((instrument) => (
                  <QuoteRow
                    id={instrument.id}
                    key={instrument.id}
                    instrument={instrument}
                    findRow={localStore.findInstrument}
                    moveRow={localStore.moveInstrument}
                    favoritePreset={localStore.isFavoritePreset}
                  />
                ))}
              {[...Array(localStore.fakeInstrumentCount)].map((_val, index) => (
                <FakeQuoteRow
                  key={index}
                  isFavorite={localStore.isFavoritePreset}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default observer(QuotesTable);
