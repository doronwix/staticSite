import { mock } from "jest-mock-extended";
import { ISystemInfoApi } from "../systemInfoApi";

const systemInfoApi = mock<ISystemInfoApi>();

export default () => systemInfoApi;
