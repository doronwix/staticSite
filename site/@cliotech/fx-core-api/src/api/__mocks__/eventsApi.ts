import { mock } from "jest-mock-extended";
import { IEventsApi } from "../eventsApi";

const eventsApi = mock<IEventsApi>();

export default () => eventsApi;
