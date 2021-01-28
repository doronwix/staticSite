import { IWebClientStateHolderManager } from "./IWebClientStateHolderManager";
import { IWebCustomer } from "./IWebCustomer";
import { IWebDialogViewModel } from "./IWebDialogViewModel";
import { IWebCustomerProfileManager } from "./IWebCustomerProfileManager";
import { IWebPortofolioStaticManager } from "./IWebPortofolioStaticManager";
import { IWebDictionary } from "./IWebDictionary";
import { IWebStateObjectStore } from "./IWebStateObjectStore";
import { IWebInitialConfiguration } from "./IWebInitialConfiguration";
import { IWebBonusManager } from "./IWebBonusManager";
import { IWebViewModels } from "./IWebViewModels";
import { IWebViewsManager } from "./IWebViewsManager";
import { IWebAmountConverter } from "./IWebAmountConverter";
import { IWebBuilderForInBetweenQuote } from "./IWebBuilderForInBetweenQuote";
import { IWebDalDemoAccount } from "./IWebDalDemoAccount";
import { IWebSystemInfo } from "./IWebSystemInfo";
import { IWebUserFlowCTA } from "./IWebUserFlowCTA";
import { IWebPresetsManager } from "./IWebPresetsManager";
import {
  IWebPresetsCategoryData,
  IWebEPresetTypes,
} from "./IWebPresetsDefinitions";
import { IWebInitialDataManager } from "./IWebInitialDataManager";
import { IWebQuotesManager } from "./IWebQuotesManager";
import { IWebRegistrationManager } from "./IWebRegistrationManager";
import { IWebInstrumentTranslationsManager } from "./IWebInstrumentTranslationsManager";
import { IWebSystemConsts } from "./IWebSystemConsts";
import { IWebClientStateFlagsManager } from "./IWebClientStateFlagsManager";
import { IWebActiveLimitsManager } from "./IWebActiveLimitsManager";
import { IWebFavoriteInstrumentsManager } from "./IWebFavoriteInstrumentsManager";

export interface IWebFacade {
  InitialDataManager: IWebInitialDataManager;
  Customer: IWebCustomer;
  DialogViewModel: IWebDialogViewModel;
  CustomerProfileManager: IWebCustomerProfileManager;
  ClientStateHolderManager: IWebClientStateHolderManager;
  PortofolioStaticManager: IWebPortofolioStaticManager;
  Dictionary: IWebDictionary;
  StateObject: IWebStateObjectStore;
  InitialConfiguration: IWebInitialConfiguration;
  BonusManager: IWebBonusManager;
  ViewModels: IWebViewModels;
  ViewsManager: IWebViewsManager;
  AmountConverter: IWebAmountConverter;
  BuilderForInBetweenQuote: IWebBuilderForInBetweenQuote;
  DalDemoAccount: IWebDalDemoAccount;
  SystemInfo: IWebSystemInfo;
  UserFlowCTA: IWebUserFlowCTA;
  PresetsManager: IWebPresetsManager;
  PresetsDefinitions: IWebPresetsCategoryData[];
  PresetTypes: IWebEPresetTypes;
  QuotesManager: IWebQuotesManager;
  RegistrationManager: IWebRegistrationManager;
  InstrumentTranslationsManager: IWebInstrumentTranslationsManager;
  SystemConsts: IWebSystemConsts;
  ClientStateFlagsManager: IWebClientStateFlagsManager;
  ActiveLimitsManager: IWebActiveLimitsManager;
  FavoriteInstrumentsManager: IWebFavoriteInstrumentsManager;
}
