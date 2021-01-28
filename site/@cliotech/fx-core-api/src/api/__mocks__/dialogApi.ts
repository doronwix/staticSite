import { mock } from "jest-mock-extended";
import { IDialogApi } from "../dialogApi";

const dialogApi = mock<IDialogApi>();

export default () => dialogApi;
