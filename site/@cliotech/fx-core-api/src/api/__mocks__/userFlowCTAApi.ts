import { mock } from "jest-mock-extended";
import { IUserFlowCTAApi } from "../userFlowCTAApi";

const userFlowCTAApi = mock<IUserFlowCTAApi>();

export default () => userFlowCTAApi;
