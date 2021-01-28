const toNumericMock = jest.fn().mockImplementation((str?: string): number => {
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
});

const toNumberWithCurrencyMock = jest
  .fn()
  .mockImplementation((value: string, _options?: Format.IFormatOptions) => {
    const numValue = toNumericMock(value);
    return {
      positive: numValue > 0,
      value,
    };
  });

export const toNumeric = toNumericMock;
export const toNumberWithCurrency = toNumberWithCurrencyMock;
