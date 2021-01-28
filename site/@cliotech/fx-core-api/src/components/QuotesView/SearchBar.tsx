import React, { useMemo, useState, useCallback } from "react";
import cn from "classnames";

import { useCombobox } from "downshift";
import { IPresetType } from "../../entities/PresetsAndCategories/preset/preset";
import Translate from "../Translate/Translate";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";

import { observer } from "mobx-react-lite";
import { QueryResult } from "ndx-query";
import InstrumentIcon from "../InstrumentIcon/InstrumentIcon";
import FoundItemName from "./FoundItemName";
import createDocumentIndex from "../../entities/PresetsAndCategories/instrument/ndxSearch";
import { IInstrumentData } from "../../api/instrumentsApi";
import { each } from "lodash-es";

interface IBaseSearchItem {
  id: number | string;
  longName?: string;
  preset?: IPresetType;
}

interface ISearchComponentProps<T extends IBaseSearchItem> {
  placeholder?: string;
  items: Array<T>;

  tableRef: React.RefObject<HTMLDivElement>;
  selectedRowRef: React.MutableRefObject<number | undefined>;
}

let index:
  | {
      add: (doc: IInstrumentData, key: IInstrumentType) => void;
      search: (q: string) => QueryResult<IInstrumentType>[];
    }
  | undefined;

const getSearchIndex = (instrumentList: Array<IInstrumentType>) => {
  if (index) {
    return index;
  } else {
    index = createDocumentIndex<IInstrumentData, IInstrumentType>([
      { key: "longName", boost: 8 },
      { key: "symbolName", boost: 4 },
      { key: "tooltip", boost: 2 },
      { key: "fullText", boost: 1 },
    ]);
    each(instrumentList, (instrument) => {
      index?.add(instrument.instrumentData, instrument);
    });

    return index;
  }
};

function SearchComponent({
  placeholder,
  tableRef,
  selectedRowRef,
  items,
}: ISearchComponentProps<IInstrumentType>) {
  const searchIndex = getSearchIndex(items);

  const [results, setResults] = useState<QueryResult<IInstrumentType>[]>([]);

  const onItemClick = useCallback(
    (item: QueryResult<IInstrumentType>) => () => {
      if (item.key.id !== undefined) {
        selectedRowRef.current = item.key.id;
        const el = document.getElementById(`quote-row-${item.key.id}`);
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
      item.key.preset.directSelect();
    },
    [tableRef, selectedRowRef]
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    inputValue,
  } = useCombobox<QueryResult<IInstrumentType>>({
    items: results,
    onInputValueChange: ({ inputValue }) => {
      const results = searchIndex.search(inputValue || "");

      if (results) {
        setResults(results);
      }
    },

    stateReducer: (state, actionChanges) => {
      switch (actionChanges.type) {
        case useCombobox.stateChangeTypes.InputBlur:
          return {
            ...actionChanges.changes,
            isOpen: false,
            inputValue: "",
          };
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
          onItemClick(actionChanges.changes.selectedItem)();
          return {
            ...actionChanges.changes,
            isOpen: false,
            inputValue: "",
          };

        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...actionChanges.changes,
            isOpen: false,
            inputValue: "",
          };
        default:
          return actionChanges.changes;
      }
    },

    itemToString: (item) => item.key.instrumentData?.longName || "",
  });

  const showDropDown = useMemo(() => {
    return isOpen && inputValue.length > 1;
  }, [inputValue, isOpen]);

  return (
    <div className={"autocomplete-container"}>
      <input
        {...getInputProps({
          className: "ui-autocomplete-input",
        })}
        autoComplete="off"
        placeholder={placeholder}
        type="text"
      />
      {showDropDown && (
        <div
          {...getMenuProps({
            className:
              "autocomplete-search-wrapper preset-search-wrapper with-react",
            style: {
              display: "block",
            },
          })}
        >
          <ul className="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content">
            {results.length > 0 ? (
              results.map((item, index) => (
                <li
                  key={item.key.id}
                  {...getItemProps({
                    item,
                    index,
                    className: cn("ui-menu-item", {
                      "ui-state-focus": highlightedIndex === index,
                    }),
                    onClick: onItemClick(item),
                  })}
                >
                  <div className="instr-wrapper">
                    <InstrumentIcon instrument={item.key} />
                  </div>

                  <div className="text-holder instrument-name found-results">
                    <FoundItemName
                      text={item.key.instrumentData.longName}
                      searchString={inputValue}
                    />
                    <br />
                    <Translate
                      el="span"
                      className="category-name"
                      value={item.key.preset?.name || ""}
                      context={"PresetsCategories"}
                    />
                  </div>

                  <div className="text-holder">
                    <span className="tick"></span>
                  </div>
                </li>
              ))
            ) : (
              <Translate
                el="li"
                value="no_results"
                className="noresults ui-menu-item"
              />
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default observer(SearchComponent);
