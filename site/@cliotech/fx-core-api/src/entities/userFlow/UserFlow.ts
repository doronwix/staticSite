import {
  types,
  ISimpleType,
  IArrayType,
  Instance,
  SnapshotIn,
  getEnv,
} from "mobx-state-tree";
import { mobxNumericEnum } from "../../utils/mobxEnumWrapper";

import { IApi } from "../../api";
import { IWebEUploadDocumentStatus } from "../../facade/enums/IWebEUploadDocumentStatus";
import { IWebEUSerFlowSteps } from "../../facade/enums/IWebEUSerFlowSteps";
import { IWebEUserStatus } from "../../facade/enums/IWebEUserStatus";
import { IWebECta } from "../../facade/enums/IWebECta";
import { IWebEStepStatus } from "../../facade/enums/IWebEStepStatus";
import { IWebUserFlow } from "../../facade/IWebUserFlow";

const UserFlow = types
  .model({
    ctaText: types.maybe(types.string),
    documentProofOfResidenceStatus: types.maybe<
      ISimpleType<IWebEUploadDocumentStatus>
    >(mobxNumericEnum(IWebEUploadDocumentStatus)),
    documentProofOfIDStatus: types.maybe<
      ISimpleType<IWebEUploadDocumentStatus>
    >(mobxNumericEnum(IWebEUploadDocumentStatus)),
    currentStep: types.maybe<ISimpleType<IWebEUSerFlowSteps>>(
      mobxNumericEnum(IWebEUSerFlowSteps)
    ),
    userStatus: types.maybe<ISimpleType<IWebEUserStatus>>(
      mobxNumericEnum(IWebEUserStatus)
    ),
    daysCounter: types.maybe(types.number),
    maxDaysCounter: types.maybe(types.number),
    userMessage: types.maybe(types.string),
    cta: types.maybe<ISimpleType<IWebECta>>(mobxNumericEnum(IWebECta)),
    userFlowStepsStatuses: types.maybe<
      IArrayType<ISimpleType<IWebEStepStatus>>
    >(types.array(mobxNumericEnum(IWebEStepStatus))),
    activationRequired: types.optional(types.boolean, false),
  })
  .actions((self) => {
    const _self = self as IUserFlowType;
    let unsubscribe: (() => void) | undefined;

    const afterCreate = () => {
      const { stateObjectApi } = getEnv<IApi>(self);

      _self.setUserFlowData(stateObjectApi.getUserFlow());

      unsubscribe = stateObjectApi.subScribeToUserFlow(_self.setUserFlowData);
    };

    const setUserFlowData = (flow?: IWebUserFlow) => {
      if (flow) {
        Object.assign(self, flow);
      }
    };

    const onClick = (_e: React.MouseEvent) => {
      const { userFlowCTAApi, eventsApi } = getEnv<IApi>(self);

      if (_self.cta !== IWebECta.ContactUs) {
        eventsApi.postEvent("action-source", "FinancialSummaryCTA");
      }

      userFlowCTAApi.getUserFlowAction(_self.cta)();
    };

    const onDestroy = () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

    return {
      afterCreate,
      setUserFlowData,
      onDestroy,
      onClick,
    };
  });

export interface IUserFlowType extends Instance<typeof UserFlow> {}
export interface IUserFlowSnapshotIn extends SnapshotIn<typeof UserFlow> {}

export default UserFlow;
