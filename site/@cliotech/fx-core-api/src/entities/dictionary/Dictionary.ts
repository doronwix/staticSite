import { types, Instance, getEnv } from "mobx-state-tree";
import { IApi } from "../../api";

const Dictionary = types.model({}).actions((self) => {
  const getValue = (key: string, context?: string, defaultValue?: string) => {
    const { dictionaryApi } = getEnv(self) as IApi;
    return dictionaryApi.GetItem(key, context, defaultValue);
  };

  return {
    getValue,
  };
});

export interface IDictionaryType extends Instance<typeof Dictionary> {}

export default Dictionary;
