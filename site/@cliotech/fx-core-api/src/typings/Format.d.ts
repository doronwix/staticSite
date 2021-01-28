/**
 * this is the Format module in Web, we define it's interface here
 * define as required, at current time of writing this comment only the below methods are used
 */

declare namespace Format {
  interface IFormatOptions {
    decimals?: number;
    useGrouping?: boolean;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    currencyId?: number;
  }
  function toNumberWithCurrency(
    value: number,
    formatOptions: IFormatOptions
  ): string;
  function toPercent(value: number): string;
}
