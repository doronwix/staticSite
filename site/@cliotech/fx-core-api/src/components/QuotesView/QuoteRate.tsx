import React, { FunctionComponent, useRef } from "react";
import { observer } from "mobx-react-lite";
import cn from "classnames";
import { IWebEQuoteStates } from "../../facade/enums/IWebEQuoteStates";
import { IQuoteType } from "../../entities/PresetsAndCategories/quote/Quote";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";

const ANIMATIONS = {
  UP: "up",
  UPR: "up-reanimate",
  DOWN: "down",
  DOWNR: "down-reanimate",
  NC: "not-changed",
  DEFAULT: "",
};

const useComputeAnimation = (state: IWebEQuoteStates) => {
  // think of useRef as returning something OUTSIDE of scope of the function that can be mutated without causing a render
  const animation = useRef(ANIMATIONS.DEFAULT);
  switch (state) {
    case IWebEQuoteStates.Up:
      animation.current === ANIMATIONS.UP
        ? (animation.current = ANIMATIONS.UPR)
        : (animation.current = ANIMATIONS.UP);
      break;
    case IWebEQuoteStates.Down:
      animation.current === ANIMATIONS.DOWN
        ? (animation.current = ANIMATIONS.DOWNR)
        : (animation.current = ANIMATIONS.DOWN);
      break;
    case IWebEQuoteStates.NotChanged:
      animation.current = ANIMATIONS.NC;
      break;
    default:
      animation.current = ANIMATIONS.DEFAULT;
      break;
  }

  return animation.current;
};

interface IQuoteRateProps {
  quote?: IQuoteType;
  quoteKey: keyof IQuoteType;
  instrument: IInstrumentType;
  specialFontStart?: number;
  specialFontLength?: number;
  visible?: boolean;
}

const QuoteRate: FunctionComponent<IQuoteRateProps> = ({
  quote,
  quoteKey,
  instrument,
  specialFontStart,
  specialFontLength,
  visible,
}) => {
  const animationClass = useComputeAnimation(quote?.state);

  const rateCalc = () => {
    const stringValue = quote ? `${quote[quoteKey]}` : "0";
    const sfs = specialFontStart || instrument.instrumentData.SpecialFontStart;
    const sfl =
      specialFontLength || instrument.instrumentData.SpecialFontLength;

    if (sfs && sfl) {
      const specialFonstStartFromLeft = stringValue.length - sfs;
      const first = stringValue.substring(0, specialFonstStartFromLeft);
      const middle = stringValue.substring(
        specialFonstStartFromLeft,
        specialFonstStartFromLeft + sfl
      );
      const last = stringValue.substring(specialFonstStartFromLeft + sfl);
      return {
        label: {
          first: first + middle,
          last,
        },
      };
    }
    return {
      label: {
        first: "0",
        last: "0",
      },
    };
  };
  const rate = rateCalc();

  return quote && quote[quoteKey] ? (
    <a
      // I blame this on the stupid logic in old web ... sorry
      className={cn({
        "rate-button": visible,
        grayText: !visible,
        [`${animationClass}`]: visible,
      })}
    >
      <span>{rate.label.first}</span>
      <span className="tenths">{rate.label.last}</span>
    </a>
  ) : (
    <span />
  );
};

export default observer(QuoteRate);
