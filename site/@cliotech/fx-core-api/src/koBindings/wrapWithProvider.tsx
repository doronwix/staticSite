import React from "react";
import { StoreProvider } from "../context";
import { IDataStoreType } from "../store";

export function wrapComponentWithProvider(
  MyComponent: React.ComponentType<{}>,
  passedStore: IDataStoreType
) {
  return (
    <StoreProvider store={passedStore}>
      <MyComponent />
    </StoreProvider>
  );
}
