import React, { ReactHTML } from "react";

import useWithSetState from "../../utils/hooks";
import { observer } from "mobx-react-lite";
import { IWebDictionary } from "../../facade/IWebDictionary";

interface ITranslateInjectedProps {
  getValue: IWebDictionary["GetItem"];
}

interface ITranslateProps<T> {
  el?: T;
  value: string;
  context?: string;
  defaultValue?: string;
  "data-automation-id"?: string;
}

const useTranslateViewModel = () =>
  useWithSetState<ITranslateInjectedProps>((_self, store) => ({
    getValue: store.dictionary.getValue,
  }));

type ITranslateFC<T extends keyof ReactHTML> = ITranslateProps<T> &
  React.ComponentProps<T>;

function Translate<T extends keyof ReactHTML>({
  el,
  value,
  context,
  defaultValue,
  ...props
}: ITranslateFC<T>) {
  const { getValue } = useTranslateViewModel();
  return React.createElement(el ? el : "div", {
    dangerouslySetInnerHTML: {
      __html: getValue(value, context, defaultValue),
    },
    ...props,
  });
}

export default observer(Translate);
