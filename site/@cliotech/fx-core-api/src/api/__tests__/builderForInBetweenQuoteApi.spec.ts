import builderApi from "../builderForInBetweenQuoteApi";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";
import { IWebBuilderForInBetweenQuote } from "../../facade/IWebBuilderForInBetweenQuote";

const BuilderForInBetweenQuoteMock = mock<IWebBuilderForInBetweenQuote>();

const facade = mock<IWebFacade>();
facade.BuilderForInBetweenQuote = BuilderForInBetweenQuoteMock;

describe("Builder API tests", () => {
  it("should call the facade with the same args", async () => {
    const api = builderApi(facade);
    await api.getInBetweenQuote(12, 14);
    expect(BuilderForInBetweenQuoteMock.GetInBetweenQuote).toHaveBeenCalledWith(
      12,
      14
    );
  });
});
