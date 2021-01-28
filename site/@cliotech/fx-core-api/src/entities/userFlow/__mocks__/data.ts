import { IUserFlowSnapshotIn } from "../UserFlow";
import { IWebECta } from "../../../facade/enums/IWebECta";
import { IWebEUSerFlowSteps } from "../../../facade/enums/IWebEUSerFlowSteps";
import { IWebEUploadDocumentStatus } from "../../../facade/enums/IWebEUploadDocumentStatus";
import { IWebEStepStatus } from "../../../facade/enums/IWebEStepStatus";
import { IWebEUserStatus } from "../../../facade/enums/IWebEUserStatus";

export const userFlowData: IUserFlowSnapshotIn = {
  activationRequired: false,
  cta: IWebECta.None,
  ctaText: "Hi",
  currentStep: IWebEUSerFlowSteps.None,
  daysCounter: 1,
  documentProofOfIDStatus: IWebEUploadDocumentStatus.None,
  documentProofOfResidenceStatus: IWebEUploadDocumentStatus.None,
  maxDaysCounter: 10,
  userFlowStepsStatuses: [IWebEStepStatus.Available],
  userMessage: "fake message",
  userStatus: IWebEUserStatus.Active,
};
