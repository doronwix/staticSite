import React, { FunctionComponent, useMemo } from "react";
import cn from "classnames";
import { IInstrumentType } from "../../entities/PresetsAndCategories/instrument/instrument";
import { observer } from "mobx-react-lite";

interface IInstrumentIconProps {
  instrument: IInstrumentType;
  customClassName?: string;
}

const InstrumentIcon: FunctionComponent<IInstrumentIconProps> = ({
  instrument,
  customClassName,
}) => {
  const firstInstrumentChar = useMemo(() => {
    if (
      instrument.instrumentData.instrumentEnglishName &&
      instrument.instrumentData.instrumentEnglishName.length > 0
    ) {
      return instrument.instrumentData.instrumentEnglishName.substring(0, 1);
    }
    return "***";
  }, [instrument.instrumentData.instrumentEnglishName]);
  return (
    <div
      className={cn("instr-symbol", customClassName, `instr-${instrument.id}`)}
      title={instrument.instrumentData.instrumentEnglishName}
    >
      <i className={`base currency _${instrument.instrumentData.baseSymbol}`}>
        <span className="default">{firstInstrumentChar}</span>
      </i>
      <i
        className={`other currency _${instrument.instrumentData.otherSymbol}`}
      ></i>
    </div>
  );
};

export default observer(InstrumentIcon);
