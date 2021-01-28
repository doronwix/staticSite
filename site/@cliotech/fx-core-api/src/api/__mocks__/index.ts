import { IWebFacade } from "../../facade/IWebFacade";
import appConfigApiMock from "./appConfigApi";
import clientStateApiMock from "./clientStateApi";
import customerApiMock from "./customerApi";
import customerProfileApiMock from "./customerProfileApi";
import dictionaryApiMock from "./dictionaryApi";
import portofolioApiMock from "./portofolioApi";
import stateObjectApiMock from "./stateObjectApi";
import bonusApiMock from "./bonusApi";
import dialogApiMock from "./dialogApi";
import viewsManagerApiMock from "./viewsManagerApi";
import eventsApiMock from "./eventsApi";
import amountConverterApiMock from "./amountConverterApi";
import builderForInBetweenQuoteApiMock from "./builderForInBetweenQuoteApi";
import dalDemoAccountApiMock from "./dalDemoAccountApi";
import systemInfoApiMock from "./systemInfoApi";
import userFlowCTAApiMock from "./userFlowCTAApi";
import presetsApiMock from "./presetsApi";
import instrumentsApiMock from "./instrumentsApi";
import quotesApiMock from "./quotesApi";
import registrationApiMock from "./registrationApi";
import clientStateFlagsApiMock from "./clientStateFlagsApi";

const buildApiWithFacade = (_facade: IWebFacade) => {
  return {
    appConfigApi: appConfigApiMock(),
    clientStateApi: clientStateApiMock(),
    customerApi: customerApiMock(),
    customerProfileApi: customerProfileApiMock(),
    dictionaryApi: dictionaryApiMock(),
    portofolioApi: portofolioApiMock(),
    stateObjectApi: stateObjectApiMock(),
    bonusApi: bonusApiMock(),
    dialogApi: dialogApiMock(),
    viewsManagerApi: viewsManagerApiMock(),
    eventsApi: eventsApiMock(),
    amountConverterApi: amountConverterApiMock(),
    builderForInBetweenQuoteApi: builderForInBetweenQuoteApiMock(),
    dalDemoAccountApi: dalDemoAccountApiMock(),
    systemInfoApi: systemInfoApiMock(),
    userFlowCTAApi: userFlowCTAApiMock(),
    presetsApi: presetsApiMock(),
    instrumentsApi: instrumentsApiMock(),
    quotesApi: quotesApiMock(),
    registrationApi: registrationApiMock(),
    clientStateFlagsApi: clientStateFlagsApiMock(),
  };
};

export default buildApiWithFacade;
