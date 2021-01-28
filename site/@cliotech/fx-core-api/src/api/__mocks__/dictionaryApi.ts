import { mock } from "jest-mock-extended";
import { IDictionaryApi } from "../dictionaryApi";

const dictionaryApi = mock<IDictionaryApi>();

export default () => dictionaryApi;
