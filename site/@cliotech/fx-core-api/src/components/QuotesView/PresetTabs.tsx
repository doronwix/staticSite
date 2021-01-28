import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import cn from "classnames";

import { usePresetsData } from "./PresetTabsViewModel";
import Translate from "../Translate/Translate";
import PresetDropDown from "./PresetDropdown";
import SearchComponent from "./SearchBar";

interface IPresetTabsProps {
  tableRef: React.RefObject<HTMLDivElement>;
  selectedRowRef: React.MutableRefObject<number | undefined>;
}

const PresetTabs: FunctionComponent<IPresetTabsProps> = ({
  tableRef,
  selectedRowRef,
}) => {
  const data = usePresetsData();

  return (
    <div id="presetsContainer">
      <div className="arrow-navigation-container">
        <ul className="main-list arrow-navigation-list">
          <li className="left-arrow hidden">
            <div className="left-arrow-icon"></div>
          </li>

          {data.visibleCategories.map((category) => (
            <li className="list-item" key={category.id}>
              <Translate
                value={category.label}
                el="a"
                className={cn({
                  active: data.selectedCategoryId === category.id,
                })}
                id={category.id}
                context="PresetsCategories"
                onClick={category.select}
              />
            </li>
          ))}

          <li className="right-arrow hidden">
            <div className="right-arrow-icon"></div>
          </li>
        </ul>
      </div>

      <div className="slave-list">
        <div id="fx-component-dropdown-presets">
          <PresetDropDown />
        </div>

        <SearchComponent
          items={data.searchInstruments}
          tableRef={tableRef}
          selectedRowRef={selectedRowRef}
          placeholder={data.placeholder}
        />
      </div>
    </div>
  );
};

export default observer(PresetTabs);
