import { Dictionary } from "lodash";

type FieldOrT<T> = T extends object ? keyof T : T;

export interface IWebHashTable<T> {
  RemoveItem: (key: string | number) => void;
  GetItem: (key: string | number) => T | undefined;
  ForEach: (delegate: (item: T) => any) => void;
  Filter: (cb: (item: T) => boolean) => IWebHashTable<T>;
  // this is the actual implementation in old web, think it's wrong, it should return T | undefined
  Find: (cb: (item: T) => boolean) => IWebHashTable<T>;

  SetItem: (key: string | number, value: T) => void;
  OverrideItem: (key: string | number, value: T) => void;
  firstItem: () => T | null;
  HasItem: (key: string | number) => boolean;
  hasItems: () => boolean;
  Clear: () => void;
  count: () => number;
  // the sort function is a bug waiting to happen, as it assumes only OBJECTS can be placed on a hashtable
  // the interface below covers both, however the implemented function will only work for `T extends object`
  // also, it returns an array and not hashtable
  Sort: (field: FieldOrT<T>) => T[];
  Container: Dictionary<T>;
}
