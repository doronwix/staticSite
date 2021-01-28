/* global General */
var TradingEventsHandler = function (
  ko,
  trackingData,
  viewModelsManager,
  general,
  eventsCollector
) {
  var events = {
    SocketConnectionTest: 'socket-connection-test',
    View: 'active-view',
    PresetChanged: 'preset-changed',
    FavoriteInstrumentsReorderDrag: 'favorite-instruments-reorder-drag',
    FavoriteInstrumentsReorderDrop: 'favorite-instruments-reorder-drop',
    FavoriteInstrumentUpdate: 'favorite-instrument-update',
    InstrumentTrade: 'instrument-trade',
    NewDealButton: 'new-deal-click',
    NewLimitButton: 'new-limit-click',
    NewLimitDetails: 'new-limit-details',
    MainTabClick: 'main-tab-click',
    SubTabClick: 'sub-tab-click',
    DealSlipErrorDetails: 'deal-slip-error-details',
    DealSlipView: 'deal-slip-view',
    NewDealAndNewLimitDragged: 'new-deal-dragged',
    DealSlipInteraction: 'deal-slip-interaction',
    DealSlipSubmit: 'deal-slip-submit',
    CloseDeal: 'close-deal',
    DealSlipSwitchInstrument: 'deal-slip-switch-instrument',
    DealSlipSwitchTab: 'deal-slip-switch-tab',
    DealSlipExpandLimit: 'deal-slip-expand-limit',
    DealSlipCollapseLimit: 'deal-slip-collapse-limit',
    DealSlipExpandTools: 'deal-slip-expand-tools',
    DealSlipCollapseTools: 'deal-slip-collapse-tools',
    DealChartExpandTools: 'deal-chart-expand-trade-ticket',
    DealChartCollapseTools: 'deal-chart-collapse-trade-ticket',
    DealSlipToggleEvent: 'deal-slip-toggle',
    NewLimitErrorDetails: 'new-limit-error-details',
    NewLimitView: 'new-limit-view',
    LimitSlipInteraction: 'limit-slip-interaction',
    NewLimitSubmit: 'new-limit-submit',
    NewLimitSuccess: 'new-limit-success',
    DepositIFrameLoaded: 'deposit-iframe-loaded',
    DepositTypeChanged: 'deposit-type-changed',
    UiLoaded: 'ui-loaded',
    DealSlipSuccess: 'deal-slip-success',
    DepositSuccess: 'deposit-success',
    WithdrawalError: 'withdrawal-error',
    DepositFailedData: 'deposit-failed-data',
    DepositFailed: 'deposit-failed',
    DepositAlert: 'deposit-alert',

    SwitchTab: 'switch-tab',
    Search: 'search',
    SearchInteraction: 'search-interaction',
    DealSlipSearch: 'deal-slip-search',
    DealSlipSearchInteraction: 'deal-slip-search-interaction',

    MessageView: 'message-view',
    SmartBannerViewOfferClicked: 'sb-view-offer-clicked',
    SmartBannerDepositClicked: 'sb-deposit-clicked',
    RewardCtaClicked: 'reward-cta-clicked',

    PresetSelectionSaved: 'preset-selection-save',
    BackButtonClick: 'back-button-click',
    TradingButtonClick: 'trading-button-click',
    StopLossChanged: 'stop-loss-changed',
    TakeProfitChanged: 'take-profit-changed',

    InstrumentShowMore: 'instrument-show-more',
    InstrumentShowLess: 'instrument-show-less',
    ClickSundayBannerButtonMain: 'click-sunday-banner-button-main',
    ShowSundayBannerMain: 'show-sunday-banner-main',
    SwitchMainView: 'switch-main-view',

    TutorialViewActive: 'tutorial-view-active',
    TutorialOpen: 'tutorial-open',
    TutorialClose: 'tutorial-close',
    TutorialAgreementVew: 'tutorial-agreement-view',
    TutorialAgreementAgree: 'tutorial-agreement-agree',
    TutorialAgreementDecline: 'tutorial-agreement-decline',

    SignalsMenuClick: 'signals-menu-click',
    SignalsDrillDown: 'signals-drill-down',
    SignalsViewMore: 'signals-view-more',
    SignalsDetailNewDeal: 'signals-detail-new-deal',
    SignalsShortTerm: 'short-term-signal-chart',

    EconomicCalendarMenuClick: 'economic-calendar-menu-click',
    CashBackInstrumentClick: 'cash-back-instrument-click',

    QuestionnaireNavigation: 'questionnaire-navigation',
    QuestionnairePage: 'questionnaire-page',
    QuestionnaireQuestion: 'questionnaire-question',
    QuestionnaireFaq: 'questionnaire-faq',
    SupportInteraction: 'support-interaction',
    DepositFaq: 'deposit-faq',
    DocumentsFaq: 'upload-documents-faq',

    DealSlipChartInteraction: 'deal-slip-chart-interaction',
    ChartInteraction: 'chart-interaction',
    ChartPerformance: 'chart-performance',
    ViewSentiments: 'view-sentiments',

    ClosedDealsEvents: 'closed-deals-events',
    NotificationsSettingsChange: 'notifications-settings-change',

    ToolsChart: 'tools-chart',
    StartCallbackRequestChat: 'start-callback-request-chat',

    AccountHub_Close: 'hub-menu-close',
    AccountHub_Open: 'hub-menu-open',
    AccountMap_Collapse: 'hub-map-collapse',
    AccountMap_Expand: 'hub-map-expand',

    ActionSource: 'action-source',
    AccountState: 'account-state',
    PriceAlertsMenuView: 'price-alerts-menu-view',
    PriceAlertCreate: 'price-alert-create',
    PriceAlertError: 'price-alert-error',
    SlipChangeHighLowTerm: 'deal-slip-change-highlow-term',

    HelpCenter: 'help-center',
    EconomicCalendarTradeCta: 'economic-calendar-trade-cta',
    RedirectLink: 'redirect-link-tracking',
  };

  var questionnaireData = {
    startTime: 0,
    category: '',
    questionnaireType: null,
  };

  var data = {
    viewId: '',
    presetName: '',
    instrumentName: '',
    tradingDirection: '',
    orderDirName: '',
    newDealButton: '',
    newLimitDetails: {},
    depositType: '',
    takeProfitType: 'none',
    stopLossType: 'none',
    tabName: '',
    limit: '',
    enableSLLimit: '',
    enableTPLimit: '',
    tools: '',
    timestamp: '',
    isCashBackInstrumentClick: false,
    actionSource: 'Other',
    existingRefferal: '',
    refferalDescription: '',
  };

  var stateData = {
    fromSearch: {
      Characters: typeof undefined,
      Instrument: typeof undefined,
    },
  };

  var tradeFormMode = '',
    refferingView = '',
    tabHierarchy = 'main tab';

  var init = function () {
    ko.postbox.subscribe(
      events.SocketConnectionTest,
      consumeSocketConnectionTest
    );
    ko.postbox.subscribe(events.SupportInteraction, consumeSupportInteraction);
    ko.postbox.subscribe(events.QuestionnaireFaq, consumeQuestionnaireFaqEvent);
    ko.postbox.subscribe(events.DepositFaq, consumeDepositFaqEvent);
    ko.postbox.subscribe(
      events.QuestionnairePage,
      consumeQuestionnairePageEvent
    );
    ko.postbox.subscribe(
      events.QuestionnaireQuestion,
      consumeQuestionnaireQuestionEvent
    );
    ko.postbox.subscribe(
      events.QuestionnaireNavigation,
      consumeQuestionnaireNavigationEvent
    );
    ko.postbox.subscribe(events.View, consumeViewChangeEvent);
    ko.postbox.subscribe(events.PresetChanged, consumeViewPresetChangeEvent);
    ko.postbox.subscribe(
      events.FavoriteInstrumentsReorderDrag,
      consumeFavoriteInstrumentDrag
    );
    ko.postbox.subscribe(
      events.FavoriteInstrumentsReorderDrop,
      consumeFavoriteInstrumentDrop
    );
    ko.postbox.subscribe(
      events.FavoriteInstrumentUpdate,
      consumeFavoriteInstrumentUpdate
    );
    ko.postbox.subscribe(events.InstrumentTrade, consumeInstrumentTradeEvent);
    ko.postbox.subscribe(events.NewDealButton, consumeNewDealButtonClickEvent);
    ko.postbox.subscribe(
      events.NewLimitButton,
      consumeNewLimitButtonClickEvent
    );
    ko.postbox.subscribe(
      events.NewLimitDetails,
      consumeNewLimitDetailsChangedEvent
    );
    ko.postbox.subscribe(events.MainTabClick, consumeMainTabClickEvent);
    ko.postbox.subscribe(events.SubTabClick, consumeSubTabClickEvent);
    ko.postbox.subscribe(
      events.DealSlipErrorDetails,
      consumeDealSlipErrorEvent
    );
    ko.postbox.subscribe(events.DealSlipView, consumeDealSlipViewEvent);
    ko.postbox.subscribe(
      events.NewDealAndNewLimitDragged,
      consumeNewDealAndNewLimitDraggedEvent
    );
    ko.postbox.subscribe(
      events.DealSlipInteraction,
      consumeDealSlipInteractionEvent
    );
    ko.postbox.subscribe(events.DealSlipSubmit, consumeDealSlipSubmitEvent);
    ko.postbox.subscribe(events.CloseDeal, consumeCloseDealEvent);
    ko.postbox.subscribe(
      events.DealSlipSwitchInstrument,
      consumeDealSlipSwitchInstrumentEvent
    );
    ko.postbox.subscribe(
      events.DealSlipSwitchTab,
      consumeDealSlipSwitchTabEvent
    );
    ko.postbox.subscribe(
      events.DealSlipExpandLimit,
      consumeDealSlipExpandLimitEvent
    );
    ko.postbox.subscribe(
      events.DealSlipCollapseLimit,
      consumeDealSlipCollapseLimitEvent
    );
    ko.postbox.subscribe(
      events.DealSlipToggleEvent,
      consumeDealSlipToggleEvent
    );
    ko.postbox.subscribe(
      events.DealSlipExpandTools,
      consumeDealSlipExpandToolsEvent
    );
    ko.postbox.subscribe(
      events.DealSlipCollapseTools,
      consumeDealSlipCollapseToolsEvent
    );
    ko.postbox.subscribe(
      events.NewLimitErrorDetails,
      consumeNewLimitErrorEvent
    );
    ko.postbox.subscribe(
      events.DepositIFrameLoaded,
      consumeDepositIFrameLoadedEvent
    );
    ko.postbox.subscribe(
      events.DepositTypeChanged,
      consumeDepositTypeChangedEvent
    );
    ko.postbox.subscribe(events.UiLoaded, consumeUiLoadedEvent);
    ko.postbox.subscribe(events.DealSlipSuccess, consumeDealSlipSuccessEvent);
    ko.postbox.subscribe(events.DepositSuccess, consumeDepositSuccessEvent);
    ko.postbox.subscribe(
      events.DepositFailedData,
      consumeDepositFailedDataEvent
    );
    ko.postbox.subscribe(events.DepositFailed, consumeDepositFailedEvent);
    ko.postbox.subscribe(events.WithdrawalError, consumeWithdrawalErrorEvent);
    ko.postbox.subscribe(events.DepositAlert, consumeDepositAlertEvent);
    ko.postbox.subscribe(events.NewLimitView, consumeNewLimitViewEvent);
    ko.postbox.subscribe(
      events.LimitSlipInteraction,
      consumeLimitSlipInteractionEvent
    );
    ko.postbox.subscribe(events.NewLimitSubmit, consumeNewLimitSubmitEvent);
    ko.postbox.subscribe(events.NewLimitSuccess, consumeNewLimitSuccessEvent);

    ko.postbox.subscribe(events.MessageView, consumeMessageViewEvent);
    ko.postbox.subscribe(
      events.SmartBannerViewOfferClicked,
      consumeSmartBannerViewOfferClickedEvent
    );
    ko.postbox.subscribe(
      events.SmartBannerDepositClicked,
      consumeSmartBannerDepositClickedEvent
    );
    ko.postbox.subscribe(events.RewardCtaClicked, consumeRewardCtaClickedEvent);

    ko.postbox.subscribe(
      events.PresetSelectionSaved,
      consumePresetSelectionSavedEvent
    );
    ko.postbox.subscribe(events.TradingButtonClick, consumeTradingButtonClick);
    ko.postbox.subscribe(events.BackButtonClick, consumeBackButtonClickEvent);
    ko.postbox.subscribe(events.StopLossChanged, consumeStopLossChangedEvent);
    ko.postbox.subscribe(
      events.TakeProfitChanged,
      consumeTakeProfitChangedEvent
    );

    ko.postbox.subscribe(
      events.InstrumentShowMore,
      consumeInstrumentShowMoreEvent
    );
    ko.postbox.subscribe(
      events.InstrumentShowLess,
      consumeInstrumentShowLessEvent
    );
    ko.postbox.subscribe(
      events.ClickSundayBannerButtonMain,
      consumeClickSundayBannerButtonMainEvent
    );
    ko.postbox.subscribe(
      events.ShowSundayBannerMain,
      consumeShowSundayBannerMainEvent
    );

    ko.postbox.subscribe(events.SwitchMainView, consumeSwitchMainViewEvent);

    ko.postbox.subscribe(events.Search, consumeSearchEvent);
    ko.postbox.subscribe(
      events.SearchInteraction,
      consumeSearchInteractionEvent
    );
    ko.postbox.subscribe(events.DealSlipSearch, consumeDealSlipSearchEvent);
    ko.postbox.subscribe(
      events.DealSlipSearchInteraction,
      consumeDealSlipSearchInteractionEvent
    );
    ko.postbox.subscribe(events.ViewSentiments, consumeViewSentiments);

    ko.postbox.subscribe(
      events.TutorialViewActive,
      consumeTutorialViewActiveEvent
    );
    ko.postbox.subscribe(events.TutorialOpen, consumeTutorialOpenEvent);
    ko.postbox.subscribe(events.TutorialClose, consumeTutorialCloseEvent);
    ko.postbox.subscribe(
      events.TutorialAgreementVew,
      consumeTutorialAgreementCiewEvent
    );
    ko.postbox.subscribe(
      events.TutorialAgreementAgree,
      consumeTutorialAgreementAgreeEvent
    );
    ko.postbox.subscribe(
      events.TutorialAgreementDecline,
      consumeTutorialAgreementDeclineEvent
    );

    ko.postbox.subscribe(events.SignalsMenuClick, consumeSignalsMenuClick);
    ko.postbox.subscribe(events.SignalsDrillDown, consumeSignalsDrillDown);
    ko.postbox.subscribe(events.SignalsViewMore, consumeSignalsViewMore);
    ko.postbox.subscribe(
      events.SignalsDetailNewDeal,
      consumeSignalsDetailNewDeal
    );
    ko.postbox.subscribe(events.SignalsShortTerm, consumeSignalsShortTerm);
    ko.postbox.subscribe(
      events.EconomicCalendarMenuClick,
      consumeEconomicCalendarClick
    );
    ko.postbox.subscribe(
      events.CashBackInstrumentClick,
      consumeCashBackInstrumentClick
    );

    ko.postbox.subscribe(
      events.DealSlipChartInteraction,
      consumeDealSlipChartInteractionEvent
    );
    ko.postbox.subscribe(events.ChartInteraction, consumeChartInteractionEvent);
    ko.postbox.subscribe(events.ChartPerformance, consumeChartPerformanceEvent);

    ko.postbox.subscribe(events.ClosedDealsEvents, consumeClosedDealsEvents);

    ko.postbox.subscribe(
      events.NotificationsSettingsChange,
      consumeNotificationsSettingsChangeEvent
    );

    ko.postbox.subscribe(events.ToolsChart, consumeToolsChartEvents);
    ko.postbox.subscribe(
      events.StartCallbackRequestChat,
      consumeStartCallbackRequestChatEvents
    );

    ko.postbox.subscribe(events.AccountHub_Close, consumeAccountHub_Close);
    ko.postbox.subscribe(events.AccountHub_Open, consumeAccountHub_Open);
    ko.postbox.subscribe(
      events.AccountMap_Collapse,
      consumeAccountMap_Collapse
    );
    ko.postbox.subscribe(events.AccountMap_Expand, consumeAccountMap_Expand);

    ko.postbox.subscribe(events.ActionSource, consumeActionSource);
    ko.postbox.subscribe(events.AccountState, consumeAccountState);
    ko.postbox.subscribe(
      events.PriceAlertsMenuView,
      consumePriceAlertsMenuView
    );
    ko.postbox.subscribe(events.PriceAlertCreate, consumePriceAlertCreate);
    ko.postbox.subscribe(events.PriceAlertError, consumePriceAlertError);
    ko.postbox.subscribe(
      events.SlipChangeHighLowTerm,
      consumeSlipChangeHighLowTerm
    );

    ko.postbox.subscribe(events.HelpCenter, consumeHelpCenterEvents);
    ko.postbox.subscribe(
      events.EconomicCalendarTradeCta,
      consumeEconomicCalendarTradeCta
    );
    ko.postbox.subscribe(events.RedirectLink, consumeRedirectLinkEvent);
      subscribeMarketInfoEvents();

      ko.postbox.subscribe(
          events.DealChartExpandTools,
          consumeDealChartExpandToolsEvent
      );

      ko.postbox.subscribe(
          events.DealChartCollapseTools,
          consumeDealChartCollapseToolsEvent
      );
  };

  var subscribeMarketInfoEvents = function () {
    Object.keys(eMarketInfoEvents).forEach(function (eKey) {
      var eName = eMarketInfoEvents[eKey];

      ko.postbox.subscribe(eName, function () {
        eventsCollector.consumeEvent(eName, setSlipExpandedAreasInfo());
      });
    });
  };

  var consumeRedirectLinkEvent = function (eventData) {
    eventsCollector.consumeEvent(events.RedirectLink, eventData);
  };

  var consumeSlipChangeHighLowTerm = function (eventData) {
    eventsCollector.consumeEvent(events.SlipChangeHighLowTerm, eventData);
  };

  var consumePriceAlertError = function (eventData) {
    eventsCollector.consumeEvent(events.PriceAlertError, eventData);
  };

  var consumePriceAlertCreate = function () {
    eventsCollector.consumeEvent(events.PriceAlertCreate);
  };

  var consumePriceAlertsMenuView = function () {
    eventsCollector.consumeEvent(events.PriceAlertsMenuView);
  };

  var consumeSocketConnectionTest = function () {
    eventsCollector.consumeEvent(events.SocketConnectionTest);
  };

  var consumeSupportInteraction = function (element) {
    var eventData = { element: element };
    switch (viewModelsManager.VManager.ActiveFormType()) {
      case eForms.ClientQuestionnaire:
      case eForms.Help:
        eventData.category = questionnaireData.category;
        eventData.view = 'questionnaire';
        break;
      case eForms.Deposit:
      case eForms.HelpDeposit:
        eventData.category = 'deposit choice';
        eventData.view = 'deposit';
        break;
      case eForms.ConcretePaymentForm:
      case eForms.HelpConcretePaymentForm:
        eventData.category = 'deposit form';
        eventData.view = 'deposit';
        break;
      case eForms.DepositPending:
      case eForms.DepositSuccess:
      case eForms.HelpDepositThankYou:
        eventData.category = 'deposit confirm';
        eventData.view = 'deposit';
        break;
      case eForms.HelpUploadDocuments:
        eventData.category = 'upload documents';
        eventData.view = 'upload documents';
        break;
      default:
        eventData.category = '';
        eventData.view = viewModelsManager.VManager.ActiveFormName();
    }

    eventsCollector.consumeEvent(events.SupportInteraction, eventData);
  };

  var consumeQuestionnaireFaqEvent = function (questionID) {
    eventsCollector.consumeEvent(events.QuestionnaireFaq, {
      category: questionnaireData.category,
      questionID: questionID,
      view: 'questionnaire',
    });
  };

  var consumeDepositFaqEvent = function (questionID) {
    var eventData = { questionID: questionID };

    switch (viewModelsManager.VManager.ActiveFormType()) {
      case eForms.Deposit:
      case eForms.HelpDeposit:
        eventData.category = 'deposit choice';
        eventData.view = 'deposit';
        break;
      case eForms.ConcretePaymentForm:
      case eForms.HelpConcretePaymentForm:
        eventData.category = 'deposit form';
        eventData.view = 'deposit';
        break;
      case eForms.DepositPending:
      case eForms.DepositSuccess:
      case eForms.HelpDepositThankYou:
        eventData.category = 'deposit confirm';
        eventData.view = 'deposit';
        break;
      case eForms.HelpUploadDocuments:
        eventData.category = 'upload documents';
        eventData.view = 'upload documents';
        break;
      default:
        eventData.category = '';
        eventData.view = viewModelsManager.VManager.ActiveFormName();
    }

    eventsCollector.consumeEvent(events.DepositFaq, eventData);
  };

  var consumeQuestionnairePageEvent = function (eventData) {
    questionnaireData.category = eventData.category;
    if (eventData.questionnaireType === eQuestionnaireType.MIFID) {
      questionnaireData.startTime = 0;
    }
    questionnaireData.questionnaireType = eventData.questionnaireType;
  };

  var consumeQuestionnaireQuestionEvent = function (questionID) {
    var elapsedTime;
    var timeStamp = new Date().getTime();
    // on first question
    if (questionnaireData.startTime === 0) {
      questionnaireData.startTime = timeStamp;
      elapsedTime = 0;
      var questionnaireStartEventName =
        questionnaireData.questionnaireType === eQuestionnaireType.MIFID
          ? 'questionnaire-quiz-start'
          : 'questionnaire-start';

      eventsCollector.consumeEvent(questionnaireStartEventName, {
        category: questionnaireData.category,
      });
    } else {
      elapsedTime = (
        (timeStamp - questionnaireData.startTime) /
        1000
      ).toFixed();
    }

    eventsCollector.consumeEvent(events.QuestionnaireQuestion, {
      category: questionnaireData.category,
      questionID: questionID,
      elapsedTime: elapsedTime,
    });
  };

  var consumeSearchEvent = function (eventData) {
    eventData = eventData || {};
    stateData.fromSearch.Characters = eventData.Characters;
    delete stateData.fromSearch.Instrument;

    eventsCollector.consumeEvent(events.Search, {
      Characters: eventData.Characters,
    });
  };

  var consumeSearchInteractionEvent = function (eventData) {
    eventData = eventData || {};
    stateData.fromSearch.Instrument = eventData.Instrument;

    var instrument;
    if (
      (instrument = $instrumentsManager.GetInstrument(eventData.Instrument.id))
    ) {
      stateData.fromSearch.Instrument.ccyPair = instrument.ccyPair;
    }

    eventsCollector.consumeEvent(events.SearchInteraction, {
      Instrument: stateData.fromSearch.Instrument.ccyPair,
      SearchResult: true,
    });
  };

  var consumeDealSlipSearchEvent = function (eventData) {
    eventData = eventData || {};
    stateData.fromSearch.Characters = eventData.Characters;
    delete stateData.fromSearch.Instrument;

    eventsCollector.consumeEvent(events.DealSlipSearch, {
      Characters: eventData.Characters,
    });
  };

  var consumeDealSlipSearchInteractionEvent = function (eventData) {
    eventData = eventData || {};
    stateData.fromSearch.Instrument = eventData.Instrument;

    var instrument;
    if (
      (instrument = $instrumentsManager.GetInstrument(eventData.Instrument.id))
    ) {
      stateData.fromSearch.Instrument.ccyPair = instrument.ccyPair;
    }

    eventsCollector.consumeEvent(events.DealSlipSearchInteraction, {
      Instrument: stateData.fromSearch.Instrument.ccyPair,
      SearchResult: true,
    });
  };

  var consumeViewChangeEvent = function (viewId) {
    if (data.viewId === viewId) {
      // report only once per view
      data.actionSource = 'Other';
      return;
    }

    if (!general.isEmpty(data.refferalDescription)) {
      data.refferalDescription = '';
    }

    if (!general.isEmpty(data.existingRefferal)) {
      data.refferalDescription = data.existingRefferal;
      data.existingRefferal = '';
    }

    data.viewId = viewId;
    data.instrumentName = '';
    data.tradingDirection = '';
    data.newDealButton = '';
    tradeFormMode = 'Auto';
    questionnaireData.startTime = 0;
    eventsCollector.consumeEvent('View');
  };

  var consumeQuestionnaireNavigationEvent = function (eventData) {
    eventsCollector.consumeEvent(events.QuestionnaireNavigation, eventData);
  };

  var consumeViewPresetChangeEvent = function (presetName) {
    data.presetName = presetName;
    data.instrumentName = '';
    data.tradingDirection = '';
    data.newDealButton = '';
  };

  var consumeFavoriteInstrumentDrag = function (instrumentId) {
    data.instrumentId = instrumentId;
  };

  var consumeFavoriteInstrumentDrop = function () {
    eventsCollector.consumeEvent('favorite-instruments-reorder', {
      instrumentId: data.instrumentId,
    });
  };

  var consumeFavoriteInstrumentUpdate = function (options) {
    if (options.isAddInstrument) {
      eventsCollector.consumeEvent('favorite-instruments-add', {
        instrumentId: options.instrumentId,
      });
    } else if (options.isRemoveInstrument) {
      eventsCollector.consumeEvent('favorite-instruments-remove', {
        instrumentId: options.instrumentId,
      });
    }
  };

  var consumeInstrumentTradeEvent = function (tradingOptions) {
    data.instrumentName = tradingOptions.instrumentName;
    data.tradingDirection =
      general.isDefinedType(tradingOptions.tradingDirection) == false
        ? ''
        : tradingOptions.tradingDirection;
    tradeFormMode = 'Manual';
  };

  var consumeNewDealButtonClickEvent = function () {
    data.newDealButton = 'NewDeal';
    data.presetName = '';
    data.instrumentName = '';
    data.tradingDirection = '';
    tradeFormMode = 'Manual';
  };

  var consumeNewLimitButtonClickEvent = function () {
    tradeFormMode = 'Manual';
  };

  var consumeMainTabClickEvent = function (additionalData) {
    tabHierarchy = 'main tab';

    eventsCollector.consumeEvent(
      'switch-tab',
      Object.assign(
        {
          viewId: data.viewId,
          hierarchy: tabHierarchy,
          presetName: data.presetName,
        },
        additionalData || {}
      )
    );
  };

  var consumeSubTabClickEvent = function () {
    tabHierarchy = 'sub tab';

    eventsCollector.consumeEvent('switch-tab', {
      viewId: data.viewId,
      hierarchy: tabHierarchy,
      presetName: data.presetName,
    });
  };

  var consumeNewLimitViewEvent = function (newLimitViewDetails) {
    data.timestamp = new Date().getTime();

    newLimitViewDetails.displayMode = tradeFormDisplayMode();
    newLimitViewDetails.referrer = getReferrerDescription();
    setAmountVersion(newLimitViewDetails);
    setSlipExpandedAreasInfo(newLimitViewDetails);

    eventsCollector.consumeEvent('new-limit-view', newLimitViewDetails);
  };

  var consumeLimitSlipInteractionEvent = function (
    limitSlipInteractionDetails
  ) {
    setDealSlipCommonProperties(limitSlipInteractionDetails);
    limitSlipInteractionDetails.ElapsedTime = getElapsedTime();
    limitSlipInteractionDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);
    setAmountVersion(limitSlipInteractionDetails);
    setSlipExpandedAreasInfo(limitSlipInteractionDetails);

    eventsCollector.consumeEvent(
      'limit-slip-interaction',
      limitSlipInteractionDetails
    );
  };

  var consumeNewLimitSubmitEvent = function () {
    var newLimitSubmitDetails = {};
    newLimitSubmitDetails.ElapsedTime = getElapsedTime();
    setAmountVersion(newLimitSubmitDetails);
    setSlipExpandedAreasInfo(newLimitSubmitDetails);

    eventsCollector.consumeEvent('new-limit-submit', newLimitSubmitDetails);
  };

  var consumeNewLimitDetailsChangedEvent = function (newLimitDetails) {
    data.newLimitDetails.tradingDirection = newLimitDetails.tradingDirection;
    data.newLimitDetails.dealSize = newLimitDetails.dealSize;
    data.newLimitDetails.isAdvancedView = newLimitDetails.isAdvancedView;
    data.newLimitDetails.expirationType = newLimitDetails.expirationType;
  };

  var consumeUiLoadedEvent = function () {
    var sessionStorage = StorageFactory(StorageFactory.eStorageType.session);

    if (sessionStorage.getItem('registrationSubmitClicked')) {
      sessionStorage.removeItem('registrationSubmitClicked');
      eventsCollector.consumeEvent('registration-success');
      eventsCollector.consumeEvent('login-success');
    }

    if (sessionStorage.getItem('loginSubmitClicked')) {
      sessionStorage.removeItem('loginSubmitClicked');
      eventsCollector.consumeEvent(
        'login-success',
        sessionStorage.getItem('isAutologin')
      );
    }

    if (sessionStorage.getItem('registrationCompleteLoginButtonClicked')) {
      sessionStorage.removeItem('registrationCompleteLoginButtonClicked');
      eventsCollector.consumeEvent('login-success');
    }

    if (sessionStorage.getItem('forgotPasswordResetSubmitClicked')) {
      sessionStorage.removeItem('forgotPasswordResetSubmitClicked');
      eventsCollector.consumeEvent('forgot-password-success');
      eventsCollector.consumeEvent('login-success');
    }
  };

  var setExtendedCommonProperties = function (details) {
    details.TabName = data.tools === 'minimized' ? '' : data.tabName;
    details.Limit = data.limit;
    details.Tools = data.tools;
  };

  function setAmountVersion(details) {
    details.version = 'AmntValue2018';
  }

  function setSlipExpandedAreasInfo(details) {
    var sectionTitles = [
        'TradingSentiment',
        'MarketInfo',
        'HighLow',
        'InstrumentInfo',
      ],
      cmp = window.hasOwnProperty('CustomerProfileManager')
        ? window.CustomerProfileManager
        : null,
      initConfig = window.hasOwnProperty('configuration/initconfiguration')
        ? window.InitConfiguration
        : null,
      profile = !General.isEmptyValue(cmp) ? cmp.ProfileCustomer() : null,
      initSectionsConfig = !General.isEmptyValue(initConfig)
        ? initConfig.MarketInfoSectionsConfiguration
        : {},
      getStatus = function (expanded) {
        return expanded ? 'maximized' : 'minimized';
      },
      result = [];

    details = details || {};

    if (profile) {
      Object.keys(eMarketInfoSectionsProps).forEach(function (prop) {
        if (!General.isEmptyValue(profile[prop])) {
          result.push(
            sectionTitles[eMarketInfoSectionsProps[prop]] +
              ':' +
              getStatus(profile[prop])
          );
        } else {
          result.push(
            sectionTitles[eMarketInfoSectionsProps[prop]] +
              ':' +
              getStatus(initSectionsConfig[prop])
          );
        }
      });
    }

    details.SlipExpandedInfoAreas = result.join(' ');
    return details;
  }

  var setDealSlipCommonProperties = function (details) {
    setExtendedCommonProperties(details);
    setAmountVersion(details);
    details.referrer = getReferrerDescription();
  };

  var consumeDealSlipErrorEvent = function (dealSlipErrorDetails) {
    setDealSlipCommonProperties(dealSlipErrorDetails);

    dealSlipErrorDetails.ElapsedTime = getElapsedTime();
    dealSlipErrorDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);
    setSlipExpandedAreasInfo(dealSlipErrorDetails);

    eventsCollector.consumeEvent('deal-slip-error', dealSlipErrorDetails);
  };

  var consumeDealSlipViewEvent = function (dealSlipViewDetails) {
    data.timestamp = new Date().getTime();
    data.tabName = dealSlipViewDetails.tabName;
    data.limit = dealSlipViewDetails.limit;
    data.tools = dealSlipViewDetails.tools;
    data.instrumentName = dealSlipViewDetails.instrument;
    data.tradingDirection =
      dealSlipViewDetails.orderDir == eOrderDir.Buy
        ? 'ask'
        : dealSlipViewDetails.orderDir == eOrderDir.Sell
        ? 'bid'
        : 'none';
    data.newDealButton =
      dealSlipViewDetails.orderDir == eOrderDir.None ? data.newDealButton : '';
    setDealSlipCommonProperties(dealSlipViewDetails);
    dealSlipViewDetails.displayMode = tradeFormMode;
    if (
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      dealSlipViewDetails.id === stateData.fromSearch.Instrument.id
    ) {
      dealSlipViewDetails.SearchResult = true;
    } else {
      dealSlipViewDetails.SearchResult = false;
      delete stateData.fromSearch.Instrument;
    }

    data.isCashBackInstrumentClick = false;
    setSlipExpandedAreasInfo(dealSlipViewDetails);

    eventsCollector.consumeEvent('deal-slip-view', dealSlipViewDetails);
  };

  var consumeNewDealAndNewLimitDraggedEvent = function (
    newDealAndNewLimitDraggedDetails
  ) {
    setDealSlipCommonProperties(newDealAndNewLimitDraggedDetails);
    newDealAndNewLimitDraggedDetails.ElapsedTime = getElapsedTime();

    eventsCollector.consumeEvent(
      'new-deal-dragged',
      newDealAndNewLimitDraggedDetails
    );
  };

  var consumeDealSlipInteractionEvent = function (dealSlipInteractionDetails) {
    setDealSlipCommonProperties(dealSlipInteractionDetails);
    dealSlipInteractionDetails.ElapsedTime = getElapsedTime();
    dealSlipInteractionDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);
    setSlipExpandedAreasInfo(dealSlipInteractionDetails);

    eventsCollector.consumeEvent(
      'deal-slip-interaction',
      dealSlipInteractionDetails
    );
  };

  var consumeDealSlipSubmitEvent = function (dealSlipSubmitDetails) {
    setDealSlipCommonProperties(dealSlipSubmitDetails);
    data.tradingDirection =
      dealSlipSubmitDetails.orderDir == eOrderDir.Buy
        ? 'ask'
        : dealSlipSubmitDetails.orderDir == eOrderDir.Sell
        ? 'bid'
        : 'none';
    data.orderDirName =
      dealSlipSubmitDetails.orderDir == eOrderDir.Buy
        ? 'Buy'
        : dealSlipSubmitDetails.orderDir == eOrderDir.Sell
        ? 'Sell'
        : 'None';
    data.dealSize = dealSlipSubmitDetails.dealSize;
    data.enableSLLimit = dealSlipSubmitDetails.enableSLLimit;
    data.enableTPLimit = dealSlipSubmitDetails.enableTPLimit;
    dealSlipSubmitDetails.stopLossType = data.stopLossType;
    dealSlipSubmitDetails.takeProfitType = data.takeProfitType;

    dealSlipSubmitDetails.ElapsedTime = getElapsedTime();
    dealSlipSubmitDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);
    setSlipExpandedAreasInfo(dealSlipSubmitDetails);

    eventsCollector.consumeEvent('deal-slip-submit', dealSlipSubmitDetails);
  };

  var consumeCloseDealEvent = function (closeDealInfo) {
    eventsCollector.consumeEvent('close-deal', closeDealInfo);
  };

  var consumeDealSlipSwitchInstrumentEvent = function (
    dealSlipSwitchInstrumentDetails
  ) {
    setDealSlipCommonProperties(dealSlipSwitchInstrumentDetails);

    dealSlipSwitchInstrumentDetails.ElapsedTime = getElapsedTime();
    dealSlipSwitchInstrumentDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      stateData.fromSearch.Instrument.id === dealSlipSwitchInstrumentDetails.id;

    if (!dealSlipSwitchInstrumentDetails.SearchResult) {
      delete stateData.fromSearch.Instrument;
    }

    eventsCollector.consumeEvent(
      'deal-slip-switch-instrument',
      dealSlipSwitchInstrumentDetails
    );
  };

  var consumeDealSlipSwitchTabEvent = function (dealSlipSwitchTabDetails) {
    data.tabName = dealSlipSwitchTabDetails.tabName;
    setDealSlipCommonProperties(dealSlipSwitchTabDetails);

    dealSlipSwitchTabDetails.ElapsedTime = getElapsedTime();
    dealSlipSwitchTabDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);

    eventsCollector.consumeEvent(
      'deal-slip-switch-tab',
      dealSlipSwitchTabDetails
    );
  };

  var consumeDealSlipExpandLimitEvent = function (dealSlipExpandLimitDetails) {
    data.limit = dealSlipExpandLimitDetails.limit;
    setDealSlipCommonProperties(dealSlipExpandLimitDetails);

    dealSlipExpandLimitDetails.ElapsedTime = getElapsedTime();
    dealSlipExpandLimitDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);

    eventsCollector.consumeEvent(
      'deal-slip-expand-limit',
      dealSlipExpandLimitDetails
    );
  };

  var consumeDealSlipCollapseLimitEvent = function (
    dealSlipCollapseLimitDetails
  ) {
    data.limit = dealSlipCollapseLimitDetails.limit;
    setDealSlipCommonProperties(dealSlipCollapseLimitDetails);

    dealSlipCollapseLimitDetails.ElapsedTime = getElapsedTime();
    dealSlipCollapseLimitDetails.SearchResult =
      general.isDefinedType(stateData.fromSearch.Instrument) &&
      general.isDefinedType(stateData.fromSearch.Instrument.id);

    eventsCollector.consumeEvent(
      'deal-slip-collapse-limit',
      dealSlipCollapseLimitDetails
    );
  };

  var consumeDealSlipToggleEvent = function (dealSlipToggleLimitDetails) {
    data.limit = dealSlipToggleLimitDetails.limit;
  };

    var consumeDealSlipExpandToolsEvent = function (dealSlipExpandToolsDetails) {
        data.tools = dealSlipExpandToolsDetails.tools;
        setDealSlipCommonProperties(dealSlipExpandToolsDetails);

        dealSlipExpandToolsDetails.ElapsedTime = getElapsedTime();
        dealSlipExpandToolsDetails.SearchResult =
            general.isDefinedType(stateData.fromSearch.Instrument) &&
            general.isDefinedType(stateData.fromSearch.Instrument.id);

        eventsCollector.consumeEvent(
            'deal-slip-expand-tools',
            dealSlipExpandToolsDetails
        );
    };

    var consumeDealSlipCollapseToolsEvent = function (dealSlipCollapseToolsDetails) {
        data.tools = dealSlipCollapseToolsDetails.tools;
        setDealSlipCommonProperties(dealSlipCollapseToolsDetails);

        dealSlipCollapseToolsDetails.ElapsedTime = getElapsedTime();
        dealSlipCollapseToolsDetails.SearchResult =
            general.isDefinedType(stateData.fromSearch.Instrument) &&
            general.isDefinedType(stateData.fromSearch.Instrument.id);

        eventsCollector.consumeEvent(
            'deal-slip-collapse-tools',
            dealSlipCollapseToolsDetails
        );
    };

    var consumeDealChartExpandToolsEvent = function () {
        eventsCollector.consumeEvent( 'deal-chart-expand-trade-ticket');
    };

    var consumeDealChartCollapseToolsEvent = function () {
        eventsCollector.consumeEvent('deal-chart-collapse-trade-ticket');
    };

  var consumeNewLimitErrorEvent = function (newLimitErrorDetails) {
    newLimitErrorDetails.ElapsedTime = getElapsedTime();
    setAmountVersion(newLimitErrorDetails);
    setSlipExpandedAreasInfo(newLimitErrorDetails);

    eventsCollector.consumeEvent('new-limit-error', newLimitErrorDetails);
  };

  var consumeDepositAlertEvent = function (depositAlertArguments) {
    var text = depositAlertArguments[0],
      redirectUrl = depositAlertArguments[1];

    if (typeof redirectUrl === 'string' && redirectUrl !== '') {
      consumeDepositSuccessEvent();
      return;
    }

    eventsCollector.consumeEvent('deposit-error', {
      type: 'server',
      errorMessage: text,
    });
  };

  var consumeDepositIFrameLoadedEvent = function (iframeDetails) {
    var $depositIframe = $('iframe[id=' + iframeDetails.iframeid + ']');

    $depositIframe.contents().click(function () {
      eventsCollector.consumeEvent('deposit-interaction');
    });

    var depositButtonSearchResult = $depositIframe
      .contents()
      .find('[data-deposit-button]');
    if (depositButtonSearchResult.length == 1) {
      $(depositButtonSearchResult[0]).click(function () {
        eventsCollector.consumeEvent('deposit-submit');
      });
    }
  };

  var consumeDepositTypeChangedEvent = function (depositDetails) {
    data.depositType = depositDetails.depositType;
  };

  var consumeDealSlipSuccessEvent = function (dealSlipSuccessDetails) {
    setDealSlipCommonProperties(dealSlipSuccessDetails);
    dealSlipSuccessDetails.ElapsedTime = getElapsedTime();
    dealSlipSuccessDetails.displayMode = tradeFormMode;
    dealSlipSuccessDetails.type = data.orderDirName;
    dealSlipSuccessDetails.dealSize = data.dealSize;
    dealSlipSuccessDetails.stopLossType = data.stopLossType;
    dealSlipSuccessDetails.takeProfitType = data.takeProfitType;
    dealSlipSuccessDetails.enableSLLimit = data.enableSLLimit;
    dealSlipSuccessDetails.enableTPLimit = data.enableTPLimit;
    setSlipExpandedAreasInfo(dealSlipSuccessDetails);
    trackingData.incrementDealsNumber();
    eventsCollector.consumeEvent('deal-slip-success', dealSlipSuccessDetails);
  };

  var consumeNewLimitSuccessEvent = function (newLimitSuccessDetails) {
    newLimitSuccessDetails.ElapsedTime = getElapsedTime();
    newLimitSuccessDetails.type = data.newLimitDetails.tradingDirection;
    newLimitSuccessDetails.dealSize = data.newLimitDetails.dealSize;
    newLimitSuccessDetails.advancedView = data.newLimitDetails.isAdvancedView;
    newLimitSuccessDetails.expirationType = data.newLimitDetails.expirationType;
    newLimitSuccessDetails.stopLossType = data.stopLossType;
    newLimitSuccessDetails.takeProfitType = data.takeProfitType;
    setAmountVersion(newLimitSuccessDetails);
    setSlipExpandedAreasInfo(newLimitSuccessDetails);

    trackingData.incrementDealsNumber();
    eventsCollector.consumeEvent('new-limit-success', newLimitSuccessDetails);
  };

  var consumeDepositSuccessEvent = function () {
    eventsCollector.consumeEvent('deposit-success');

    window.trackingData.incrementDepositsNumber();
  };

  var consumeDepositFailedDataEvent = function (event) {
    var options = { type: 'server' };

    if (event) {
      options.errorMessage = event.message;
      options.errorMessageKey = event.key;
    }

    eventsCollector.consumeEvent('deposit-error', options);
  };

  var consumeDepositFailedEvent = function (event) {
    var options = { type: 'server' };
    options.errorMessage = event;

    eventsCollector.consumeEvent('deposit-error', options);
  };

  var consumeWithdrawalErrorEvent = function (reason) {
    eventsCollector.consumeEvent('withdrawal-error', { reason: reason });
  };

  var consumeMessageViewEvent = function (messageDetails) {
    eventsCollector.consumeEvent('message-view', {
      text: extractTextFromHtml(messageDetails.text),
      type: messageDetails.type,
    });
  };

  var consumeSmartBannerViewOfferClickedEvent = function (messageDetails) {
    eventsCollector.consumeEvent('sb-view-offer-clicked', {
      text: messageDetails.text,
      type: messageDetails.type,
    });
  };

  var consumeSmartBannerDepositClickedEvent = function (messageDetails) {
    eventsCollector.consumeEvent('sb-deposit-clicked', {
      text: messageDetails.text,
    });
  };

  var consumeRewardCtaClickedEvent = function (messageDetails) {
    eventsCollector.consumeEvent('reward-cta-clicked', {});
  };

  var extractTextFromHtml = function (text) {
    var div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  };

  var consumePresetSelectionSavedEvent = function (selectedPresetName) {
    eventsCollector.consumeEvent('switch-tab', {
      viewId: data.viewId,
      presetName: selectedPresetName,
    });
  };

  var consumeTradingButtonClick = function (currentPresetName) {
    data.presetName = currentPresetName;
  };

  var consumeBackButtonClickEvent = function (currentView) {};

  var consumeStopLossChangedEvent = function (type) {
    data.stopLossType = type;
  };

  var consumeTakeProfitChangedEvent = function (type) {
    data.takeProfitType = type;
  };

  var consumeInstrumentShowMoreEvent = function () {
    eventsCollector.consumeEvent('instrument-show-more', {
      TabName: data.presetName,
      tabHierarchy: 'sub tab',
    });
  };

  var consumeInstrumentShowLessEvent = function () {
    eventsCollector.consumeEvent('instrument-show-less', {
      TabName: data.presetName,
      tabHierarchy: 'sub tab',
    });
  };

  var consumeViewSentiments = function (eventData) {
    eventsCollector.consumeEvent(events.ViewSentiments, eventData);
  };

  var consumeClickSundayBannerButtonMainEvent = function (elementId) {
    eventsCollector.consumeEvent('click-sunday-banner-button-main', {
      Element: elementId,
    });
  };

  var consumeShowSundayBannerMainEvent = function (elementId) {
    eventsCollector.consumeEvent('show-sunday-banner-main', {
      Element: elementId,
    });
  };

  var consumeSwitchMainViewEvent = function (options) {
    eventsCollector.consumeEvent('switch-main-view', options);
  };

  var consumeTutorialViewActiveEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(
      'tutorial-events',
      Object.assign({ event: 'view-tutorials-page' }, eventData)
    );
  };

  var consumeTutorialOpenEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(
      'tutorial-events',
      Object.assign({ event: 'tutorial-open' }, eventData)
    );
  };

  var consumeTutorialCloseEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(
      'tutorial-events',
      Object.assign({ event: 'tutorial-close' }, eventData)
    );
  };

  var consumeTutorialAgreementCiewEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(
      'tutorial-events',
      Object.assign({ event: 'agreement-view' }, eventData)
    );
  };

  var consumeTutorialAgreementAgreeEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(
      'tutorial-events',
      Object.assign({ event: 'agreement-agree' }, eventData)
    );
  };

  var consumeTutorialAgreementDeclineEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(
      'tutorial-events',
      Object.assign({ event: 'agreement-decline' }, eventData)
    );
  };

  var consumeSignalsMenuClick = function () {
    eventsCollector.consumeEvent('signals-menu-click');
  };

  var consumeSignalsDrillDown = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent('signals-drill-down', eventData);
  };

  var consumeSignalsViewMore = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent('signals-view-more', eventData);
  };

  var consumeSignalsDetailNewDeal = function (data) {
    var signalData = (data || {}).signalData || {};
    signalData.instrument = signalData.instrument || {};

    var eventData = {
      signalId: signalData.signalId,
      symbol: signalData.symbol,
      instrumentId: signalData.instrument.id,
    };

    eventsCollector.consumeEvent('signals-detail-new-deal', eventData);
  };

  var consumeSignalsShortTerm = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent('short-term-signal-chart', eventData);
  };

  var consumeEconomicCalendarClick = function () {
    eventsCollector.consumeEvent('economic-calendar-menu-click');
  };

  var consumeCashBackInstrumentClick = function () {
    data.isCashBackInstrumentClick = true;
  };

  var consumeDealSlipChartInteractionEvent = function (
    dealSlipChartInteractionDetails
  ) {
    setExtendedCommonProperties(dealSlipChartInteractionDetails);
    dealSlipChartInteractionDetails.ElapsedTime = getElapsedTime();

    eventsCollector.consumeEvent(
      'deal-slip-chart-interaction',
      dealSlipChartInteractionDetails
    );
  };

  var consumeChartInteractionEvent = function (chartInteractionDetails) {
    setExtendedCommonProperties(chartInteractionDetails);

    eventsCollector.consumeEvent('chart-interaction', chartInteractionDetails);
  };

  var consumeChartPerformanceEvent = function (
    consumeChartPerformanceEventDetails
  ) {
    eventsCollector.consumeEvent(
      'chart-performance',
      consumeChartPerformanceEventDetails
    );
  };

  var consumeClosedDealsEvents = function (detailsData) {
    eventsCollector.consumeEvent(events.ClosedDealsEvents, detailsData);
  };

  var consumeNotificationsSettingsChangeEvent = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.NotificationsSettingsChange, eventData);
  };

  var consumeToolsChartEvents = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.ToolsChart, eventData);
  };

  var consumeStartCallbackRequestChatEvents = function (eventData) {
    eventData = eventData || {};

    eventsCollector.consumeEvent(events.StartCallbackRequestChat, eventData);
  };

  var consumeAccountHub_Close = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.AccountHub_Close, eventData);
  };

  var consumeAccountHub_Open = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.AccountHub_Open, eventData);
  };

  var consumeAccountMap_Collapse = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.AccountMap_Collapse, eventData);
  };

  var consumeAccountMap_Expand = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.AccountMap_Expand, eventData);
  };

  var consumeActionSource = function (eventData) {
    data.actionSource = eventData;
  };

  var consumeAccountState = function (eventData) {
    trackingData.updateAccountStatus(eventData);
  };

  var consumeHelpCenterEvents = function (eventData) {
    eventData = eventData || {};
    eventsCollector.consumeEvent(events.HelpCenter, eventData);
  };

  var consumeEconomicCalendarTradeCta = function (eventData) {
    data.existingRefferal =
      eventData.View +
      '+' +
      eventData.Tab +
      '+' +
      eventData.EventCountry +
      '+' +
      eventData.EventId +
      '+' +
      eventData.InstrumentName +
      '+' +
      eventData.CalendarEventDate;
    eventsCollector.consumeEvent(events.EconomicCalendarTradeCta, eventData);
  };
  //var consumeHelpCenterOpenEvents = function (eventData) {
  //    eventData = eventData || {};
  //    eventsCollector.consumeEvent(events.HelpCenterOpen, eventData);
  //};
  //var consumeHelpCenterTabSwitchEvents = function (eventData) {
  //    eventData = eventData || {};
  //    eventsCollector.consumeEvent(events.HelpCenterTabSwitch, eventData);
  //};
  //var consumeHelpCenterInteractionEvents = function (eventData) {
  //    eventData = eventData || {};
  //    eventsCollector.consumeEvent(events.HelpCenterInteraction, eventData);
  //};
  //var consumeHelpCenterCloseEvents = function (eventData) {
  //    eventData = eventData || {};
  //    eventsCollector.consumeEvent(events.HelpCenterClose, eventData);
  //};

  var getReferrerDescription = function () {
    var description = data.viewId;

    if (!general.isEmpty(data.refferalDescription)) {
      return data.refferalDescription;
    }

    if (data.viewId === '1') {
      description += '+main';
    }

    if (data.isCashBackInstrumentClick) {
      return description + '+CashBack';
    }

    if (data.newDealButton != String.empty) {
      return description + '+' + data.newDealButton;
    }

    if (data.presetName != String.empty) {
      description = description + '+' + data.presetName;
    }

    if (data.instrumentName != String.empty) {
      description = description + '+' + data.instrumentName;
    }

    if (data.tradingDirection != String.empty) {
      description = description + '+' + data.tradingDirection;
    }

    return description;
  };

  var tradeFormDisplayMode = function () {
    return tradeFormMode;
  };

  var getRefferingView = function () {
    return refferingView;
  };

  var updateRefferingView = function (viewId) {
    refferingView = viewId;
  };

  function getElapsedTime() {
    return ((new Date().getTime() - data.timestamp) / 1000).toFixed();
  }

  return {
    init: init,
    data: data,
    getReferrerDescription: getReferrerDescription,
    tradeFormDisplayMode: tradeFormDisplayMode,
    getRefferingView: getRefferingView,
    updateRefferingView: updateRefferingView,
  };
};
