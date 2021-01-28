/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React, { useState } from "react";
import { runInAction, transaction, extendObservable } from "mobx";
import { IDataStoreType } from "../store";
import { storeContext } from "../context";

function wrapInTransaction(fn: Function, context: object) {
  return (...args: unknown[]) => {
    return transaction(() => fn.apply(context, args));
  };
}

function isPlainObject(value: any): value is object {
  if (!value || typeof value !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}

function useWithSetState<T>(
  dataSelector: (self: T, store: IDataStoreType) => T
): T {
  const context = React.useContext(storeContext);

  if (!context) {
    throw new Error();
  }

  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily

  return useState<T>(() => {
    const local: T = {} as T;
    extendObservable(local, dataSelector(local, context));

    if (isPlainObject(local)) {
      runInAction(() => {
        Object.keys(local).forEach((key) => {
          // @ts-ignore No idea why ts2536 is popping out here
          const value = local[key];
          if (typeof value === "function") {
            // @ts-ignore No idea why ts2536 is popping out here
            local[key] = wrapInTransaction(value, local);
          }
        });
      });
    }
    return local;
  })[0];
}

export default useWithSetState;
