import { IWebEUploadDocumentStatus } from "./enums/IWebEUploadDocumentStatus";
import { IWebEUSerFlowSteps } from "./enums/IWebEUSerFlowSteps";
import { IWebEUserStatus } from "./enums/IWebEUserStatus";
import { IWebECta } from "./enums/IWebECta";
import { IWebEStepStatus } from "./enums/IWebEStepStatus";

export interface IWebUserFlow {
  ctaText: string;
  documentProofOfResidenceStatus: IWebEUploadDocumentStatus;
  documentProofOfIDStatus: IWebEUploadDocumentStatus;
  currentStep: IWebEUSerFlowSteps;
  userStatus: IWebEUserStatus;
  daysCounter: number;
  maxDaysCounter: number;
  userMessage: string;
  cta: IWebECta;
  userFlowStepsStatuses: Array<IWebEStepStatus>;
  activationRequired: false;
}

export interface IWebUserFlowCTA {
  getUserFlowAction: (cta: IWebECta) => () => void;
}
