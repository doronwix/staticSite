/**
 * this is a test of our api mocks
 * we test that each model can be instantiated based on the mock apis
 * we're forced into instantiation the api's this way due to the dependency on facade
 * it might seem a bit redundant but it simplifes work down the line
 * when testing viewModels that bind to the store, so we can mock the whole store and mock the apis
 *
 * the tests are fairly simple, we pretty much just test instantiation
 * we do this because some models have hooks (`afterCreate`)
 * that run on instantiaton and depend on API, we need to make sure our API mocks
 * are good enough to at least instantiate an empty store
 *
 * after that we can mock/change specific areas of the store, api in individual unit tests if needed
 */

import AppConfig from "../appConfig/";
import buildApiWithFacade from "../../api";
import { mock } from "jest-mock-extended";
import { IWebFacade } from "../../facade/IWebFacade";
import { isStateTreeNode } from "mobx-state-tree";
import Bonus from "../bonus";
import ClientState from "../clientState";
import ClientStateFlags from "../clientStateFlags/clientStateFlags";
import Customer from "../customer";
import Dialog from "../dialog/Dialog";
import Dictionary from "../dictionary/Dictionary";
import DirectApi from "../directApi";
import Portofolio from "../portofolio";
import PresetsAndCategories from "../PresetsAndCategories/PresetsAndCategories";
import CustomerProfile from "../profile";
import SystemInfo from "../systemInfo";
import UserFlow from "../userFlow/UserFlow";

jest.mock("../../api");

const facade = mock<IWebFacade>();

const api = buildApiWithFacade(facade);

describe("Model instantiantion tests based on mock apis", () => {
  it("AppConfig Model", () => {
    const appConfig = AppConfig.create({ walletConfiguration: {} }, api);

    expect(isStateTreeNode(appConfig)).toBe(true);
  });
  it("Bonus Model", () => {
    const bonus = Bonus.create({}, api);
    expect(isStateTreeNode(bonus)).toBe(true);
  });

  it("ClientState Model", () => {
    const clientState = ClientState.create({}, api);
    expect(isStateTreeNode(clientState)).toBe(true);
  });

  it("ClientStateFlags Model", () => {
    const csFlags = ClientStateFlags.create({}, api);
    expect(isStateTreeNode(csFlags)).toBe(true);
  });

  it("Customer Model", () => {
    const customer = Customer.create({}, api);
    expect(isStateTreeNode(customer)).toBe(true);
  });

  it("Dialog Model", () => {
    const dialog = Dialog.create({}, api);
    expect(isStateTreeNode(dialog)).toBe(true);
  });

  it("Dictionary Model", () => {
    const dictionary = Dictionary.create({}, api);
    expect(isStateTreeNode(dictionary)).toBe(true);
  });

  it("DirectApi Model", () => {
    const directApi = DirectApi.create({}, api);
    expect(isStateTreeNode(directApi)).toBe(true);
  });

  it("Portofolio Model", () => {
    const portofolio = Portofolio.create({}, api);
    expect(isStateTreeNode(portofolio)).toBe(true);
  });

  it("PresetsAndCategories Model", () => {
    const presetsAndCategories = PresetsAndCategories.create({}, api);
    expect(isStateTreeNode(presetsAndCategories)).toBe(true);
  });

  it("CustomerProfile Model", () => {
    const customerProfile = CustomerProfile.create({}, api);
    expect(isStateTreeNode(customerProfile)).toBe(true);
  });

  it("SystemInfo Model", () => {
    const systemInfo = SystemInfo.create({}, api);
    expect(isStateTreeNode(systemInfo)).toBe(true);
  });

  it("UserFlow Model", () => {
    const userFlow = UserFlow.create({}, api);
    expect(isStateTreeNode(userFlow)).toBe(true);
  });
});
