import {
  IArrayType,
  Instance,
  IReferenceType,
  IAnyComplexType,
  IAnyModelType,
  IModelType,
  IMSTArray,
} from "mobx-state-tree";

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

type ExtendRefs<K> = {
  [P in keyof K]: null extends K[P]
    ? never
    : K[P] extends IArrayType<infer O>
    ? IMSTArray<IReferenceType<O>>
    : K[P] extends IAnyComplexType
    ? Instance<IReferenceType<K[P]>>
    : never;
};

export type WithRefsModelType<
  T extends IAnyModelType,
  OTHERS
> = T extends IModelType<infer P, infer O, infer C, infer S>
  ? IModelType<Without<P, keyof OTHERS>, ExtendRefs<OTHERS> & O, C, S>
  : never;
