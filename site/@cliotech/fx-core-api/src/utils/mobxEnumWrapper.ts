import { types } from "mobx-state-tree";
import { $enum } from "ts-enum-util";

type StringKeyOf<T> = Extract<keyof T, string>;

export const mobxNumericEnum = <T extends Record<StringKeyOf<T>, number>>(
  myEnum: T
) => types.union(...$enum(myEnum).map(types.literal));

export const mobxStringEnum = <T extends Record<StringKeyOf<T>, string>>(
  myEnum: T
) => types.union(...$enum(myEnum).map(types.literal));
