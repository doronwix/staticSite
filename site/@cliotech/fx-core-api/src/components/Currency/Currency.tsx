import cn from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import {
  toNumberWithCurrency,
  toPercent,
  toppedPercentage,
} from "./currencyHelpers";

import styles from "./Currency.less";

import useWithSetState from "../../utils/hooks";

interface ICurrencyProps {
  id?: string;
  className?: string;
  children: string;
  showPercent?: boolean;
  toppedPercent?: boolean;
  decorate?: boolean;
  decimals?: number;
}

interface ICurrencyInjectedProps {
  currencyId?: number;
}

const useCurrencyViewModel = () =>
  useWithSetState<ICurrencyInjectedProps>((self, store) => ({
    currencyId: store.customer.selectedCcyId,
  }));

export const Currency: FunctionComponent<ICurrencyProps> = ({
  children,
  className,
  showPercent,
  toppedPercent,
  decorate,
  id,
  decimals = 2,
}) => {
  const { currencyId } = useCurrencyViewModel();

  const currency = useMemo(() => {
    let value = children;
    let positive = true;

    if (toppedPercent) {
      value = toppedPercentage(children);
    } else if (showPercent) {
      value = toPercent(children);
    } else {
      const values = toNumberWithCurrency(children, {
        currencyId: currencyId,
        decimals,
      });
      value = values.value;
      positive = values.positive;
    }
    return { value, positive };
  }, [children, currencyId, decimals, showPercent, toppedPercent]);

  return (
    <span
      id={id}
      className={cn(
        {
          [styles.positive]: decorate && currency.positive,
          [styles.negative]: decorate && !currency.positive,
        },
        className
      )}
      dangerouslySetInnerHTML={{ __html: currency.value }}
    />
  );
};

export default observer(Currency);
