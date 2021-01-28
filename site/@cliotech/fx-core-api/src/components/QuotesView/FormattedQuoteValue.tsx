import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";

interface IFormattedQuoteValueProps {
  value?: string;
  instrument: IInstrumentType;
  specialFontStart?: number;
  specialFontLength?: number;
}

const FormatedQuoteValue: FunctionComponent<IFormattedQuoteValueProps> = ({
  value,
  instrument,
  specialFontStart,
  specialFontLength,
}) => {
  const rate = useMemo(() => {
    const stringValue = `${value}`;
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
  }, [
    instrument.instrumentData.SpecialFontLength,
    instrument.instrumentData.SpecialFontStart,
    specialFontLength,
    specialFontStart,
    value,
  ]);

  return value ? (
    <span>
      <span>{rate.label.first}</span>
      <span className="tenths">{rate.label.last}</span>
    </span>
  ) : (
    <span />
  );
};

export default observer(FormatedQuoteValue);
