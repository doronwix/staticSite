import { mock } from "jest-mock-extended";
import { IBuilderForInBetweenQuoteApi } from "../builderForInBetweenQuoteApi";

const builderForInBetweenQuoteApi = mock<IBuilderForInBetweenQuoteApi>();

export default () => builderForInBetweenQuoteApi;
