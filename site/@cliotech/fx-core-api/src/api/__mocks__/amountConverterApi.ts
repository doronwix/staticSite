import { mock } from "jest-mock-extended";
import { IAmountConverterApi } from "../amountConverterApi";

const amountConverterApi = mock<IAmountConverterApi>();

export default () => amountConverterApi;
