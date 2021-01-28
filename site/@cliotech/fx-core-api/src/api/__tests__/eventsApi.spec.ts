import eventsApi from "../eventsApi";
import { mock } from "jest-mock-extended";

const ko = mock<KnockoutStatic>({}, { deep: true });

window.ko = ko;

describe("Events API tests", () => {
  it("should call ko.postbox.publish", () => {
    const api = eventsApi();
    api.postEvent("1", "2");
    expect(ko.postbox.publish).toHaveBeenCalledWith("1", "2");
  });
});
