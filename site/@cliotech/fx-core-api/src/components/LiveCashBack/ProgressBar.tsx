import React, { FunctionComponent } from "react";

interface IProgressBarProps {
  minValue: number;
  maxValue: number;
  value: number;
}
export const ProgressBar: FunctionComponent<IProgressBarProps> = ({
  minValue,
  maxValue,
  value,
}) => (
  <div className="cash-simple-progress-bar">
    <div
      className="current-value"
      style={{ width: `${Math.min(value - (maxValue - minValue) * 100)}` }}
    />
  </div>
);

export default ProgressBar;
