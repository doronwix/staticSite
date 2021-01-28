import { IWebFacade } from "../facade/IWebFacade";
import appConfigApi, { IAppConfigApi } from "./appConfigApi";
import clientStateApi, { IClientStateApi } from "./clientStateApi";
import customerApi, { ICustomerApi } from "./customerApi";
import dictionaryApi, { IDictionaryApi } from "./dictionaryApi";
import portofolioApi, { IPortofolioApi } from "./portofolioApi";
import customerProfileApi, { ICustomerProfileApi } from "./customerProfileApi";
import stateObjectApi, { IStateObjectApi } from "./stateObjectApi";
import bonusApi, { IBonusApi } from "./bonusApi";
import dialogApi, { IDialogApi } from "./dialogApi";
import viewsManagerApi, { IViewsManagerApi } from "./viewsManagerApi";
import eventsApi, { IEventsApi } from "./eventsApi";
import amountConverterApi, { IAmountConverterApi } from "./amountConverterApi";
import builderForInBetweenQuoteApi, {
  IBuilderForInBetweenQuoteApi,
} from "./builderForInBetweenQuoteApi";
import dalDemoAccountApi, { IDalDemoAccountApi } from "./dalDemoAccountApi";
import systemInfoApi, { ISystemInfoApi } from "./systemInfoApi";
import userFlowCTAApi, { IUserFlowCTAApi } from "./userFlowCTAApi";
import presetsApi, { IPresetsApi } from "./presetsApi";
import instrumentsApi, { IInstrumentsApi } from "./instrumentsApi";
import quotesApi, { IQuotesApi } from "./quotesApi";
import registrationApi, { IRegistrationApi } from "./registrationApi";
import clientStateFlagsApi, {
  IClientStateFlagsApi,
} from "./clientStateFlagsApi";

export interface IApi {
  customerApi: ICustomerApi;
  portofolioApi: IPortofolioApi;
  clientStateApi: IClientStateApi;
  customerProfileApi: ICustomerProfileApi;
  appConfigApi: IAppConfigApi;
  dictionaryApi: IDictionaryApi;
  stateObjectApi: IStateObjectApi;
  bonusApi: IBonusApi;
  dialogApi: IDialogApi;
  viewsManagerApi: IViewsManagerApi;
  eventsApi: IEventsApi;
  amountConverterApi: IAmountConverterApi;
  builderForInBetweenQuoteApi: IBuilderForInBetweenQuoteApi;
  dalDemoAccountApi: IDalDemoAccountApi;
  systemInfoApi: ISystemInfoApi;
  userFlowCTAApi: IUserFlowCTAApi;
  presetsApi: IPresetsApi;
  instrumentsApi: IInstrumentsApi;
  quotesApi: IQuotesApi;
  registrationApi: IRegistrationApi;
  clientStateFlagsApi: IClientStateFlagsApi;
}

const buildApiWithFacade = (facet: IWebFacade): IApi => {
  return {
    appConfigApi: appConfigApi(facet),
    clientStateApi: clientStateApi(facet),
    customerApi: customerApi(facet),
    customerProfileApi: customerProfileApi(facet),
    dictionaryApi: dictionaryApi(facet),
    portofolioApi: portofolioApi(facet),
    stateObjectApi: stateObjectApi(facet),
    bonusApi: bonusApi(facet),
    dialogApi: dialogApi(facet),
    viewsManagerApi: viewsManagerApi(facet),
    eventsApi: eventsApi(),
    amountConverterApi: amountConverterApi(facet),
    builderForInBetweenQuoteApi: builderForInBetweenQuoteApi(facet),
    dalDemoAccountApi: dalDemoAccountApi(facet),
    systemInfoApi: systemInfoApi(facet),
    userFlowCTAApi: userFlowCTAApi(facet),
    presetsApi: presetsApi(facet),
    instrumentsApi: instrumentsApi(facet),
    quotesApi: quotesApi(facet),
    registrationApi: registrationApi(facet),
    clientStateFlagsApi: clientStateFlagsApi(facet),
  };
};

export default buildApiWithFacade;
