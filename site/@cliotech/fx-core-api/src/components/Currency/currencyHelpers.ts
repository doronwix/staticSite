export const toNumeric = (str?: string): number => {
  const newstr = [];

  if (!str) {
    return 0;
  }

  for (let i = 0; i < str.length; i++) {
    const s = str.substr(i, 1);

    if (s !== ",") {
      newstr.push(s);
    }
  }

  return parseFloat(newstr.join(""));
};

export const toPercent = (value: string) => Format.toPercent(toNumeric(value));

export const toppedPercentage = (value?: string) => {
  if (value) {
    return parseFloat(value) > 100 ? ">100%" : toPercent(value);
  }

  return "0";
};

export const toNumberWithCurrency = (
  value: string,
  options?: Format.IFormatOptions
) => {
  const numValue = toNumeric(value);
  return {
    positive: numValue >= 0,
    value: Format.toNumberWithCurrency(toNumeric(value), options || {}),
  };
};
