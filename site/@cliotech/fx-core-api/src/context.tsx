import React, { FunctionComponent } from "react";
import { IDataStoreType } from "./store";

export const storeContext = React.createContext<IDataStoreType | null>(null);

export const StoreProvider: FunctionComponent<{ store: IDataStoreType }> = ({
  children,
  store,
}) => {
  return (
    <storeContext.Provider value={store}>{children}</storeContext.Provider>
  );
};
