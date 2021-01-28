import amountConverterApi from "../amountConverterApi";
import {
  IWebInBetweenQuote,
  IWebAmountConverter,
} from "../../facade/IWebAmountConverter";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const AmountConverterMock = mock<IWebAmountConverter>();
AmountConverterMock.Convert.mockImplementation(() => 12);
const facade = mock<IWebFacade>();
facade.AmountConverter = AmountConverterMock;

describe("AmountConverter API tests", () => {
  it("should call the amount converter on the facade", () => {
    const api = amountConverterApi(facade);
    const args: [number, IWebInBetweenQuote, boolean] = [
      14,
      {
        ask: 1,
        bid: 1,
        isOppositeInstrumentFound: false,
        instrumentFactor: 12,
      },
      false,
    ];
    api.convert(...args);
    expect(AmountConverterMock.Convert).toHaveBeenCalledWith(...args);
  });
});
