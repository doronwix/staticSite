import { mock } from "jest-mock-extended";
import { IInstrumentsApi } from "../instrumentsApi";

const instrumentsApi = mock<IInstrumentsApi>();

export default () => instrumentsApi;
