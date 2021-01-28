import { useRef, useEffect } from "react";

import useWithSetState from "../../utils/hooks";
import { autorun } from "mobx";

export interface ILiveCashBackProps {
  isAdvancedView: boolean;
  maxCashBack: number;
  volumeUsd: number;
  accumulatedVolumeUsd: number;
  cashBack: number;
  animate: boolean;
  setAnimate: (val: boolean) => void;
}

export const useCashBackData = () =>
  useWithSetState<ILiveCashBackProps>((self, store) => ({
    get isAdvancedView() {
      return store.customerProfile.advancedWalletView;
    },
    get maxCashBack() {
      return store.bonus.amountBase;
    },
    get volumeUsd() {
      return store.bonus.volumeUsd;
    },
    get accumulatedVolumeUsd() {
      return store.bonus.accumulatedVolumeUsd;
    },
    get cashBack() {
      return (self.accumulatedVolumeUsd / self.volumeUsd) * self.maxCashBack;
    },
    animate: false,
    setAnimate: (val: boolean) => {
      self.animate = val;
    },
  }));

export const useAnimateCashback = (data: ILiveCashBackProps) => {
  // we use this to store a reference to previous cashback value
  // we don't need to instantiate as useEffect set it anyway
  const oldCashBack = useRef<number>();

  const autoRunner = autorun(() => {
    // we determine if to animate when we have a 'old' cashback value and is different than new cashback
    const shouldAnimate =
      oldCashBack.current && oldCashBack.current !== data.cashBack;
    if (shouldAnimate) {
      // if we should animate, we set the property to true and set a timeout for setting it back to false
      data.setAnimate(true);
      setTimeout(() => {
        data.setAnimate(false);
      }, 2000);

      // we update the old value with the latest before the effect ends
      oldCashBack.current = data.cashBack;
    }
    // we update it as well even if we should not animate
    oldCashBack.current = data.cashBack;
  });

  useEffect(() => autoRunner);
};
