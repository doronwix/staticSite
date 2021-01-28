import React, { FunctionComponent, Fragment } from "react";
import { observer } from "mobx-react-lite";
import cn from "classnames";
import { groupBy, map } from "lodash-es";
import Tooltip from "../Tooltip/Tooltip";
import Translate from "../Translate/Translate";
import useWithSetState from "../../utils/hooks";
import { Dictionary } from "lodash";
import { IPresetSubCategoryType } from "../../entities/PresetsAndCategories/subCategory/PresetSubCategory";
import { IPresetCategoryType } from "../../entities/PresetsAndCategories/category/PresetCategory";

interface IPresetDropDownData {
  selectedCategory?: IPresetCategoryType;
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  handleBlur: () => void;
  isPresetActive: (presetId: number) => boolean;
  toggleVisibility: () => void;
  categoriesByColumns?: Dictionary<IPresetSubCategoryType[]>;
  dropdownVisibility: boolean;
  presetCount: number;
}

const usePresetDropDownData = () =>
  useWithSetState<IPresetDropDownData>((self, store) => ({
    isOpen: false,
    get selectedCategory() {
      return store.presetsAndCategories.selectedCategory;
    },
    setIsOpen: (value: boolean) => {
      self.isOpen = value;
    },
    toggleVisibility: () => {
      self.setIsOpen(!self.isOpen);
    },
    isPresetActive: (presetId: number) => {
      return (
        store.presetsAndCategories.selectedCategory?.lastSelectedPreset.id ===
        presetId
      );
    },
    handleBlur: () => {
      self.isOpen && self.setIsOpen(false);
    },
    get presetCount() {
      return self.selectedCategory ? self.selectedCategory.presets.length : 0;
    },
    get categoriesByColumns() {
      return (
        store.presetsAndCategories.selectedCategory &&
        groupBy(
          store.presetsAndCategories.selectedCategory.subCategories,
          (subCategory) => subCategory.columnId
        )
      );
    },

    get dropdownVisibility() {
      return (
        store.presetsAndCategories.selectedCategory !== undefined &&
        store.presetsAndCategories.selectedCategory.presets.length > 1
      );
    },
  }));

const PresetDropDown: FunctionComponent = () => {
  const data = usePresetDropDownData();

  return (
    <div
      className={cn(
        "preset-dropdown center-items head",
        data.selectedCategory && data.selectedCategory.label.toLowerCase()
      )}
      data-automation="dropdown-presets"
    >
      {data.dropdownVisibility && (
        <dl
          className={cn({
            dropdown: true,
            focus: data.isOpen,
          })}
          data-count={data.presetCount}
        >
          <dt
            tabIndex={-1}
            onClick={data.toggleVisibility}
            onBlur={data.handleBlur}
          >
            <a className="active">
              {data.selectedCategory ? (
                <Translate
                  el="span"
                  value={data.selectedCategory?.lastSelectedPreset.name}
                  context={"PresetsCategories"}
                />
              ) : (
                <span>{"<<select an item>>"}</span>
              )}
            </a>
          </dt>
          <dd>
            {data.isOpen && (
              <div
                className={cn({
                  hidden: !data.isOpen,
                  "column-container": true,
                })}
              >
                {map(data.categoriesByColumns, (column, index) => {
                  return (
                    <ul
                      key={index}
                      className={cn({
                        "slave-list": true,
                        [`column${index}`]: true,
                      })}
                    >
                      {column.map((subCategory) => {
                        return (
                          <Fragment key={subCategory.id}>
                            <li className="subcategory">
                              <Translate
                                el="span"
                                value={subCategory.label}
                                context={"PresetsCategories"}
                              />
                            </li>
                            <li className="presets-list">
                              {subCategory.presets.map((preset) => {
                                return (
                                  preset && (
                                    <a
                                      key={preset.id}
                                      className={cn({
                                        active: data.isPresetActive(preset.id),
                                      })}
                                      onMouseDown={preset.directSelect}
                                    >
                                      <Translate
                                        el="span"
                                        value={preset.name}
                                        context={"PresetsCategories"}
                                      />
                                    </a>
                                  )
                                );
                              })}
                            </li>
                          </Fragment>
                        );
                      })}
                    </ul>
                  );
                })}
              </div>
            )}
          </dd>
        </dl>
      )}

      {data.dropdownVisibility && (
        <Tooltip
          content={<Translate el="span" value={"SubPresets_Tooltip"} />}
          maxWidth={450}
        >
          <i className={cn("ico-wb-tooltip")} />
        </Tooltip>
      )}
    </div>
  );
};

export default observer(PresetDropDown);
