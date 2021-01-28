import dictionaryApi from "../dictionaryApi";
import { IWebFacade } from "../../facade/IWebFacade";
import { mock } from "jest-mock-extended";

const facade = mock<IWebFacade>();

// test is fairly simple, most of the logic to be tested would reside on the actual dictionary module
// api is just a wrapper
describe("Dictionary Api", () => {
  it("should return Dictionary on facet", () => {
    const api = dictionaryApi(facade);
    expect(api).toStrictEqual(facade.Dictionary);
  });
});
