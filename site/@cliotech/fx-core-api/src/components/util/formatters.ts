const getSign = (numericValue: number) => {
  return numericValue === 0 ? "" : numericValue > 0.0 ? "+" : "";
};

export const toPercent = (value: number) => {
  const withTrailingZeroes = value.toFixed(2);

  return `${getSign(value)}${withTrailingZeroes}%`;
};
