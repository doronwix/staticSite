import { mock } from "jest-mock-extended";
import { IDalDemoAccountApi } from "../dalDemoAccountApi";

const dalDemoAccountApi = mock<IDalDemoAccountApi>();

export default () => dalDemoAccountApi;
