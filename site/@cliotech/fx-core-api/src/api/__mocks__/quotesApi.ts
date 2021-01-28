import { mock } from "jest-mock-extended";
import { IQuotesApi } from "../quotesApi";

// TODO: might need to make some basic mock implementations
const quotesApi = mock<IQuotesApi>();

export default () => quotesApi;
