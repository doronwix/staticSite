import {
  IWebPresetsCategoryData,
  IWebPresetsCategoryPresetInfo,
  IWebEPresetOrder,
  IWebEPresetTypes,
  IWebPresetSubCategory,
} from "../../facade/IWebPresetsDefinitions";
import { findKey, filter, map, uniqBy, find, keys, reduce } from "lodash-es";

import { IPresetSubCategorySnapshotIn } from "../../entities/PresetsAndCategories/subCategory/PresetSubCategory";
import { IPresetSnapshotIn } from "../../entities/PresetsAndCategories/preset/preset";
import { IPresetsAndCategoriesSnapshotIn } from "../../entities/PresetsAndCategories/PresetsAndCategories";
import { IWebPresetsManagerData } from "../../facade/IWebPresetsManager";
import { IInstrumentSnapshotIn } from "../../entities/PresetsAndCategories/instrument/instrument";

// equivalent to `isSearchPreset` in QuotesPresetViewModel
const setIsSearch = (categoryData: IWebPresetsCategoryData, presetId: number) =>
  categoryData.searchPresetIds.includes(presetId);

const setPresetOrder = (
  categoryData: IWebPresetsCategoryData,
  presetId: number
) => {
  if (
    categoryData.ascOrderPresetIds &&
    categoryData.ascOrderPresetIds.includes(presetId)
  ) {
    return IWebEPresetOrder.Ascending;
  }

  if (
    categoryData.descOrderPresetIds &&
    categoryData.descOrderPresetIds.includes(presetId)
  ) {
    return IWebEPresetOrder.Descending;
  }

  return IWebEPresetOrder.None;
};

const setPresetName = (presetTypes: IWebEPresetTypes, presetId: number) => {
  return findKey(presetTypes, (preset) => preset === presetId) || "";
};

/**
 * because we want SUBCATEGORIES to be unique in our MST tree
 * we create a UNIQUE ID for them based on their label and category they're in
 */
const buildUniqueSubCategoryId = (
  categoryName: string,
  subCategory: IWebPresetSubCategory
) => categoryName + subCategory.label;

const buildPreset = (
  categoryData: IWebPresetsCategoryData,
  presetInfo: IWebPresetsCategoryPresetInfo,
  presetTypes: IWebEPresetTypes
): IPresetSnapshotIn => {
  return {
    id: presetInfo.id,
    name: setPresetName(presetTypes, presetInfo.id),
    instrumentType: categoryData.instrumentType,
    category: categoryData.categoryName,
    subCategory: buildUniqueSubCategoryId(
      categoryData.categoryName,
      presetInfo.subCategory
    ),
    categoryOrder: categoryData.presetOrder,
    presetsOrder: setPresetOrder(categoryData, presetInfo.id),
    isSearchPreset: setIsSearch(categoryData, presetInfo.id),
  };
};

export const linkSubCategoryWithPresets = (
  presets: IWebPresetsCategoryPresetInfo[]
) => (
  subCategory: IPresetSubCategorySnapshotIn
): IPresetSubCategorySnapshotIn => {
  const presetsForThisSubCategory = filter(
    presets,
    (preset) => preset.subCategory.label === subCategory.label
  ).map((preset) => preset.id);

  return {
    ...subCategory,
    presets: presetsForThisSubCategory,
  };
};

export const buildSubCategories = (
  categoryName: string,
  filteredPresets: IWebPresetsCategoryPresetInfo[]
) => {
  const subCategories = uniqBy(
    // we use lodash map cause it can iterate over collections, we add unique ID to subcategory per category
    map(filteredPresets, (preset) => ({
      ...preset.subCategory,
      id: buildUniqueSubCategoryId(categoryName, preset.subCategory),
    })),
    (subCategory) => subCategory.label
  );

  // we then LINK (by id) preset to subcategory
  const subCategoriesWithPresets = subCategories.map(
    linkSubCategoryWithPresets(filteredPresets)
  );

  return subCategoriesWithPresets;
};

/**
 * create a category with presets built and attached to it
 */

const buildCategory = (
  availablePresets: number[],
  presetTypes: IWebEPresetTypes
) => (category: IWebPresetsCategoryData) => {
  /**
   * from the presetDefinition.category.presetInfo we only extract the ones that we got info on
   */
  const filteredPresets = filter(category.presets, (preset) =>
    availablePresets.includes(preset.id)
  );
  const presets = map(filteredPresets, (preset) =>
    buildPreset(category, preset, presetTypes)
  );

  const subCategories = buildSubCategories(
    category.categoryName,
    filteredPresets
  );

  return {
    id: category.categoryName,
    label: category.categoryName,
    presets,
    subCategories,
  };
};

/*
 * This is used for building additional presets
 * on initial load we build all category/and subcategory data as we start from categoryData and enrich
 * on subsequent calls we don't create aditional categories, subcategories
 * instead we just MAYBE create additional presets and assign them to categories
 */
export const buildAdditionalPresetInfo = (
  categoriesData: IWebPresetsCategoryData[],
  presets: number[],
  presetTypes: IWebEPresetTypes
): { [key: number]: IPresetSnapshotIn } => {
  const builtPresets = presets.reduce((newPresets, presetId) => {
    const presetCategory = find(
      categoriesData,
      (category) =>
        findKey(category.presets, (preset) => preset.id === presetId) !==
        undefined
    );
    // if no category found it means there's no category data for it - might be error
    if (!presetCategory) {
      return newPresets;
    }
    const presetInfo = find(
      presetCategory.presets,
      (preset) => preset.id === presetId
    ) as IWebPresetsCategoryPresetInfo; // we cast it because we know from presetCategory find it was found, TS cannot infer it
    return {
      ...newPresets,
      [presetId]: buildPreset(presetCategory, presetInfo, presetTypes),
    };
  }, {});

  return builtPresets;
};

/**
 * this does the FULL initial load, it starts from presetDefinitions and enriches it
 * with preset data
 */
export const buildCategoriesAndPresets = (
  categoriesData: IWebPresetsCategoryData[],
  presetList: IWebPresetsManagerData,
  presetTypes: IWebEPresetTypes,
  favoritesPresetId: number
): IPresetsAndCategoriesSnapshotIn => {
  const availablePresets = map(keys(presetList), (key) => parseInt(key));
  // add favorite preset - ID = 0
  availablePresets.unshift(favoritesPresetId);
  // we start with preset definitions
  const allData = categoriesData
    // sort by sorting order
    .sort((catA, catB) => catA.presetOrder - catB.presetOrder)
    // for every category, we create a category object with presets & subCategories
    .map(buildCategory(availablePresets, presetTypes));

  return {
    categoryList: allData.reduce(
      (categories, category) => ({
        ...categories,
        [category.id]: {
          ...category,
          presets: category.presets.map((preset) => preset.id),
        },
      }),
      {}
    ),
    presetList: allData.reduce(
      (allPresets, category) => ({
        ...allPresets,
        ...category.presets.reduce(
          (presets, preset) => ({
            ...presets,
            [preset.id]: {
              ...preset,
              instruments: map(
                presetList[preset.id],
                (instrument) => instrument[0]
              ),
            },
          }),
          {}
        ),
      }),
      {}
    ),
    instrumentList: reduce<
      IWebPresetsManagerData,
      { [key: number]: IInstrumentSnapshotIn }
    >(
      presetList,
      (agg, presetInstruments, presetId) => {
        const instruments = presetInstruments.reduce(
          (aggregate, instrument) => {
            return {
              ...aggregate,
              [instrument[0]]: {
                id: instrument[0],
                dealAmount: instrument[1],
                preset: parseInt(presetId),
              },
            };
          },
          {}
        );
        return {
          ...agg,
          ...instruments,
        };
      },
      {}
    ),
  };
};
