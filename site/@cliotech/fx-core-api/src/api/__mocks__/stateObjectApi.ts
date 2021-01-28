import { mock } from "jest-mock-extended";
import { IStateObjectApi } from "../stateObjectApi";

import { IWebDealerParams } from "../../facade/IWebDealerParams";
import { IWebStateObject } from "../../facade/IWebStateObjectStore";
import { IWebUserFlow } from "../../facade/IWebUserFlow";
import { IWebECta } from "../../facade/enums/IWebECta";
import { IWebEUSerFlowSteps } from "../../facade/enums/IWebEUSerFlowSteps";
import { IWebEUploadDocumentStatus } from "../../facade/enums/IWebEUploadDocumentStatus";
import { IWebEUserStatus } from "../../facade/enums/IWebEUserStatus";

const stateObjectApi = mock<IStateObjectApi>();

const dealerParams: IWebDealerParams = {
  dealerCurrency: "USD",
  dealerAdvancedWalletView: false,
};

const userFlow: IWebUserFlow = {
  activationRequired: false,
  cta: IWebECta.None,
  ctaText: "1231",
  currentStep: IWebEUSerFlowSteps.None,
  daysCounter: 13,
  documentProofOfIDStatus: IWebEUploadDocumentStatus.None,
  documentProofOfResidenceStatus: IWebEUploadDocumentStatus.None,
  maxDaysCounter: 15,
  userFlowStepsStatuses: [],
  userMessage: "this was fun",
  userStatus: IWebEUserStatus.Active,
};

const dealerParamMock = mock<IWebStateObject<IWebDealerParams>>();
dealerParamMock.get.mockImplementation((key) => dealerParams[key]);

stateObjectApi.getDealerParams.mockImplementation(() => dealerParamMock);
stateObjectApi.getUserFlow.mockImplementation(() => {
  return userFlow;
});

export default () => stateObjectApi;
