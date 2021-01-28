import { IAnyModelType } from "mobx-state-tree";
import { Dictionary } from "lodash";

export const mockEntity = <T extends IAnyModelType>(
  entity: T,
  actions: Dictionary<() => any>
): T => {
  const MockedEntity = entity.actions(() => actions);
  return MockedEntity as T;
};
