import stateObjectApi from "../stateObjectApi";
import { IWebStateObject } from "../../facade/IWebStateObjectStore";
import { IWebDealerParams } from "../../facade/IWebDealerParams";
import { IWebFacade } from "../../facade/IWebFacade";

const DealerParamsSO = jest.fn<IWebStateObject<IWebDealerParams>, any>();

const StateObject = {
  DealerParams: new DealerParamsSO(),
};

const facet = {
  StateObject,
} as IWebFacade;

describe("StateObjectApi", () => {
  it("getDealerParams should return DealerParams", () => {
    const api = stateObjectApi(facet);

    expect(api.getDealerParams()).toStrictEqual(StateObject.DealerParams);
  });
});
