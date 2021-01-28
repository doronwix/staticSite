import ClientState from "../index";
import { IClientStateApi } from "../../../api/clientStateApi";
import { IWebCSHolder } from "../../../facade/IWebClientStateHolderManager";

const unsubFunc = jest.fn();

const clientStateApi: IClientStateApi = {
  getClientStateData: jest.fn(),
  subscribeToChangeUpdates: jest.fn((_subFn: (data: IWebCSHolder) => void) => {
    return unsubFunc;
  }),
};

describe("ClientState Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should subscribe via clientStateApi on creation", () => {
    const clientStore = ClientState.create({}, { clientStateApi });
    expect(clientStateApi.subscribeToChangeUpdates).toHaveBeenCalledWith(
      clientStore.setClientStateData
    );
  });

  it("should unsubscribe onDestroy", () => {
    const clientStore = ClientState.create({}, { clientStateApi });
    expect(unsubFunc).toHaveBeenCalledTimes(0);
    clientStore.onDestroy();
    expect(unsubFunc).toHaveBeenCalledTimes(1);
  });

  it("should update data when received via sub function", () => {
    const clientStore = ClientState.create({}, { clientStateApi });
    clientStore.setClientStateData({
      accountBalance: "1000",
    } as IWebCSHolder);
    expect(clientStore.accountBalance).toBe("1000");
  });
});
