import {
  toNumeric,
  toppedPercentage,
  toNumberWithCurrency,
  toPercent,
} from "../currencyHelpers";

const globalAny: any = global;

const fm = {
  toPercent: jest.fn(),
  toNumberWithCurrency: jest.fn(),
};

globalAny.Format = fm;

describe("CurrencyHelpers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("toPercet should call Format.toPercent", () => {
    toPercent("14");
    expect(fm.toPercent).toHaveBeenCalledWith(14);
  });

  it("toNumberWithCurrency should call Format.toNumberWithCurrency", () => {
    toNumberWithCurrency("14", { currencyId: 1 });
    expect(fm.toNumberWithCurrency).toHaveBeenCalledWith(14, {
      currencyId: 1,
    });
  });

  it("toppedPercentage should return 0 for no value", () => {
    const val = toppedPercentage();
    expect(val).toBe("0");
  });

  it("toppedPercentage should return >100% for value > 100", () => {
    const val = toppedPercentage("101");
    expect(val).toBe(">100%");
  });

  it("toppedPercentage should call Format.toPercentage via toPercent for value < 100", () => {
    toppedPercentage("100");
    expect(fm.toPercent).toHaveBeenCalledWith(100);
  });

  it("toNumeric should convert string to number", () => {
    const val1 = toNumeric("100");
    expect(val1).toBe(100);
    const val2 = toNumeric("100,00");
    expect(val2).toBe(10000);
    const val3 = toNumeric("100,33.64");
    expect(val3).toBe(10033.64);
  });
});
