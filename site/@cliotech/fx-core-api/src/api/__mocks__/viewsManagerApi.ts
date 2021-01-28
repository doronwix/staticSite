import { mock } from "jest-mock-extended";
import { IViewsManagerApi } from "../viewsManagerApi";

const viewsManagerApi = mock<IViewsManagerApi>();

export default () => viewsManagerApi;
