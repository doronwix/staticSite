import { IWebStateObject } from "../facade/IWebStateObjectStore";
import { IWebDealerParams } from "../facade/IWebDealerParams";
import { IWebUserFlow } from "../facade/IWebUserFlow";
import { IWebFacade } from "../facade/IWebFacade";
import { IWebStateObjectTopics } from "../facade/enums/IWebStateObjectTopics";
import { omitBy, isNil } from "lodash-es";

export interface IStateObjectApi {
  getDealerParams: () => IWebStateObject<IWebDealerParams>;
  getUserFlow: () => IWebUserFlow | undefined;
  subScribeToUserFlow: (cb: (data?: IWebUserFlow) => void) => () => void;
}

const parseUserFlow = (data?: IWebUserFlow): IWebUserFlow | undefined => {
  if (data) {
    const newData = omitBy<IWebUserFlow>(data, isNil);
    return newData as IWebUserFlow;
  } else return undefined;
};

const stateObjectApi = ({ StateObject }: IWebFacade): IStateObjectApi => {
  const getDealerParams = () => {
    return StateObject.DealerParams;
  };

  const getUserFlow = () => {
    return parseUserFlow(
      StateObject.UserFlow.get(IWebStateObjectTopics.UserFlowChanged)
    );
  };

  const subScribeToUserFlow = (cb: (data?: IWebUserFlow) => void) => {
    return StateObject.UserFlow.subscribe(
      IWebStateObjectTopics.UserFlowChanged,
      (data) => cb(parseUserFlow(data))
    );
  };

  return {
    getDealerParams,
    subScribeToUserFlow,
    getUserFlow,
  };
};

export default stateObjectApi;
