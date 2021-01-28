import { mock } from "jest-mock-extended";
import { IRegistrationApi } from "../registrationApi";

const registrationApi = mock<IRegistrationApi>();

export default () => registrationApi;
