/* globals cDepositMessageKeys, eDepositErrorType, eDepositMessageTypes */
define("viewmodels/Payments/GenericCreditCardViewModel", [
	"require",
	"knockout",
	"helpers/KoComponentViewModel",
	"managers/GenericCCInterWindowsCommunicator",
	"dataaccess/dalClaims",
	"dataaccess/dalDeposit",
	"modules/environmentData",
	"Q",
	"initdatamanagers/Customer",
	"payments/ComplianceBeforeDeposit",
	"enums/alertenums",
	"devicemanagers/AlertsManager",
	"Dictionary",
	"JSONHelper",
	"viewmodels/payments/DepositResponseAnalyzer",
	"configuration/PaymentsConfiguration",
	"configuration/initconfiguration",
	"devicemanagers/StatesManager",
	"managers/AmlPopupManager",
	"managers/CustomerProfileManager",
	"initdatamanagers/SymbolsManager",
	"viewmodels/ViewModelBase",
	"global/UrlResolver",
	"devicemanagers/ViewModelsManager",
	"FxNet/LogicLayer/Deposit/CreditCard/CreditCardView",
	"managers/viewsmanager",
	"LoadDictionaryContent!payments_genericcreditcard",
	"StateObject!PostLoginAlerts",
	"FxNet/Common/Utils/Version/versionPci.require",
	"handlers/general",
	"modules/ThemeSettings",
	"managers/CommunicationManager",
	"viewmodels/Payments/PaymentResultProcessor",
	"deposit/DepositMessagesManager",
], function GenericCreditCardDef(require) {
	var ko = require("knockout"),
		koComponentViewModel = require("helpers/KoComponentViewModel"),
		communicator = require("managers/GenericCCInterWindowsCommunicator"),
		dalClaims = require("dataaccess/dalClaims"),
		dalDeposit = require("dataaccess/dalDeposit"),
		environmentData = require("modules/environmentData").get(),
		Q = require("Q"),
		customer = require("initdatamanagers/Customer"),
		complianceBeforeDeposit = require("payments/ComplianceBeforeDeposit"),
		alertTypes = require("enums/alertenums"),
		alertsManager = require("devicemanagers/AlertsManager"),
		dictionary = require("Dictionary"),
		jsonHelper = require("JSONHelper"),
		depositAnalyzer = require("viewmodels/payments/DepositResponseAnalyzer"),
		initConfiguration = require("configuration/initconfiguration"),
		statesManager = require("devicemanagers/StatesManager"),
		amlPopupManager = require("managers/AmlPopupManager"),
		customerProfileManager = require("managers/CustomerProfileManager"),
		symbolsManager = require("initdatamanagers/SymbolsManager"),
		viewModelBase = require("viewmodels/ViewModelBase"),
		viewModelsManager = require("devicemanagers/ViewModelsManager"),
		CreditCardView = require("FxNet/LogicLayer/Deposit/CreditCard/CreditCardView"),
		ViewsManager = require("managers/viewsmanager"),
		postLoginAlerts = require("StateObject!PostLoginAlerts"),
		urlResolver = require("global/UrlResolver"),
		general = require("handlers/general"),
		versionPci = require("FxNet/Common/Utils/Version/versionPci.require"),
		ThemeSettings = require("modules/ThemeSettings"),
		CommunicationManager = require("managers/CommunicationManager"),
		PaymentResultProcessor = require("viewmodels/Payments/PaymentResultProcessor"),
		DepositMessagesManager = require("deposit/DepositMessagesManager");

	var GenericCreditCardViewModel = general.extendClass(koComponentViewModel, function GenericCreditCardClass() {
		var self = this,
			uiTheme = ThemeSettings.GetTheme(),
			subscribers = [],
			timeoutDefered,
			interval,
			currentTimeout,
			interWindowsCommunicationTimeout = 10000,
			interWindowsCommunicationTimeoutStep = 5000,
			waitIntervalForActivityLog = 30000,
			waitedInterval,
			frameNotLoadedActivityLogWritten,
			form,
			cvvTooltipInfo,
			currentRequest = {},
			depositOptionsFor3DSecure = {
				prepareDepositRequest: prepareDepositRequest,
				handle3DDeposit: handle3DDeposit,
			},
			customSettings = initConfiguration.PaymentsConfiguration,
			inheritedInstance = general.clone(viewModelBase),
			content = [],
			dataLoaderPromise,
			usedCreditCards,
			supportedCreditCards,
			frameId = general.createGuid(),
			infoObs = {};

		function openThirdPartyView(response) {
			prepareThirdPartyView();
			redirectAndStartResultProcessor(response);
		}

		function prepareDepositRequest() {
			prepareThirdPartyView();
			window.FxNet.hideUI();
		}

		function settings() {
			return inheritedInstance.getSettings(self);
		}

		function prepareThirdPartyView() {
			window.paymentsPopup = settings().prepare3rdPartyView();
			window.paymentsPopup.OnClose(function onPopupClosed() {
				form.isDepositInProgress(false);
			});
		}

		function handle3DDeposit(response) {
			if (general.isEmptyValue(window.paymentsPopup)) {
				show3DDepositAlert(response);
			} else {
				redirectAndStartResultProcessor(response);
			}
		}

		function show3DDepositAlert(response) {
			var props = {
				okButtonCaption: dictionary.GetItem("ok"),
				okButtonCallback: function okButtonCallback() {
					openThirdPartyView(response);
				},
				onClose: function onClose() {
					dalDeposit.failDeposit(response[eDepositResponse.RequestID]).fail(general.emptyFn).done();
					form.isDepositInProgress(false);
				},
				cancelButtonCallback: function cancelButtonCallback() {
					dalDeposit.failDeposit(response[eDepositResponse.RequestID]).fail(general.emptyFn).done();
					form.isDepositInProgress(false);
				},
			};

			alertsManager.UpdateAlert(
				alertTypes.GeneralOkCancelAlert,
				dictionary.GetItem("pleaseNoteTitle"),
				dictionary.GetItem(cDepositMessageKeys.notice3DSecureDeposit),
				null,
				props
			);
			alertsManager.PopAlert(alertTypes.GeneralOkCancelAlert);
		}

		function redirectAndStartResultProcessor(response) {
			navigateToClearerPage(response);

			var resultProcessor = new PaymentResultProcessor(
				inheritedInstance.getSettings(self),
				paymentStateChanged,
				currentRequest
			);

			dalDeposit
				.getPaymentStatus(
					response[eDepositResponse.RequestID],
					eDepositingActionType.Regular,
					resultProcessor.OnDepositPaymentStatusTimeout
				)
				.then(navigateToUrlAndProcessFinalResponse)
				.fail(general.emptyFn)
				.done();
		}

		function navigateToUrlAndProcessFinalResponse(response) {
			var resultProcessor = new PaymentResultProcessor(
				inheritedInstance.getSettings(self),
				paymentStateChanged,
				currentRequest
			);

			var responseObj = jsonHelper.STR2JSON(
				"GenericCreditCardViewModel/navigateToUrlAndProcessFinalResponse",
				response
			).result;
			var arr = JSONHelper.STR2JSON(
				"GenericCreditCardViewModel:navigateToUrlAndProcessFinalResponse",
				responseObj[eDepositResponse.D3SecureURL]
			);
			var requiresExtraRedirect = arr[eDepositResponseThreeDIndex.requiresExtraRedirect];

			if (requiresExtraRedirect === "True") {
				navigateToClearerPage(responseObj);

				dalDeposit
					.getFinalPaymentStatus(
						responseObj[eDepositResponse.RequestID],
						eDepositingActionType.Regular,
						resultProcessor.OnDepositPaymentStatusTimeout
					)
					.then(resultProcessor.ProcessPaymentFinalResponse)
					.fail(general.emptyFn)
					.done();
			} else {
				resultProcessor.ProcessPaymentFinalResponse(response);
			}
		}

		function paymentStateChanged() {
			form.isDepositInProgress(false);
		}

		function navigateToClearerPage(response) {
			window.paymentsPopup.Navigate(getCommunicationManager(response));
		}

		function getCommunicationManager(response) {
			var communicationData = parseCommunicationData(response);

			return new CommunicationManager(communicationData);
		}

		function parseCommunicationData(response) {
			var postData,
				actionUrl,
				arr = JSONHelper.STR2JSON(
					"GenericCreditCardViewModel:parseCommunicationData",
					response[eDepositResponse.D3SecureURL]
				),
				acsUrl = arr[eDepositResponseThreeDIndex.acsUrl];

			if (acsUrl != "") {
				actionUrl = acsUrl;
				if (arr[eDepositResponseThreeDIndex.paReq]) {
					postData = [
						{ name: "PaReq", value: arr[eDepositResponseThreeDIndex.paReq] },
						{ name: "MD", value: arr[eDepositResponseThreeDIndex.md] },
						{ name: "TermUrl", value: arr[eDepositResponseThreeDIndex.termUrl] },
					];
				}
			} else {
				actionUrl = response[eDepositResponse.ClearerRequestUrl];

				postData = response[eDepositResponse.ClearerPostData].map(function mapData(pd) {
					return {
						name: pd[eNameValuePairIndex.name],
						value: pd[eNameValuePairIndex.value],
					};
				});
			}

			return {
				actionUrl: actionUrl,
				postData: postData,
				hash: response[eDepositResponse.ClearerUrlHash],
				accountNumber: customer.prop.accountNumber,
			};
		}

		function initObservables() {
			form = {
				iframeSrc: ko.observable(getIframeSrc()),
				iframeElement: ko.observable(),
				iframeReady: ko.observable(false),
				paymentNote: ko.observable(),
				isIframeInputInFocus: ko.observable(false),
				isLiveValidationEnabled: ko.observable(false),
				isIframeDataBinded: ko.observable(false),
				CCNumberGuid: ko.observable(),
				CVVGuid: ko.observable(),
				isDepositInProgress: ko.observable(false).publishOn(ePostboxTopic.SetSpinnerVisibility),
				isDepositButtonDisabled: ko.observable(false),
				selectedCCId: ko.observable(),
				allowedCreditCards: ko.observableArray([]),
				isCcBinFromEea: ko.observable(),
			};

			cvvTooltipInfo = {
				isCvvTooltipVisible: ko.observable(false),
				name: ko.observable(),
				text: ko.observable(),
				imgClassName: ko.observable(),
			};

			infoObs.isContinueButtonVisible = ko.computed(function computeIsContinueButtonVisible() {
				return !form.isIframeInputInFocus();
			});
		}

		function setCvvText(cardTypeId) {
			var creditCardType;

			if (cardTypeId) {
				creditCardType = getCreditCardByCCTypeId(cardTypeId);
				cvvTooltipInfo.name(creditCardType[eCreditCard.Name]);
			} else {
				if (supportedCreditCards && supportedCreditCards.length > 0) {
					creditCardType = supportedCreditCards[0];
				}
			}

			if (general.isEmptyValue(creditCardType)) {
				return;
			}

			var selectedName = creditCardType[eCreditCard.Name];

			var name = selectedName.split(",")[0].replace(/\s/g, "");
			cvvTooltipInfo.text(name);
			cvvTooltipInfo.imgClassName(name + "-Img");
		}

		function getCreditCardByCCTypeId(ccTypeId) {
			return supportedCreditCards.find(function findCC(creditCard) {
				return creditCard[eCreditCard.CardTypeID] === ccTypeId;
			});
		}

		function initComputables() {
			form.isUsedCreditCard = ko.pureComputed(function computeIsUsedCC() {
				return isUsedCreditCard();
			});
		}

		function setSettings() {
			inheritedInstance.setSettings(self, customSettings);
		}

		function initStaticData() {
			content = getContent();
		}

		function init() {
			initObservables();
			initComputables();
			initStaticData();
			startPreloadingData();
			setSettings();
			initCommunicator();
			initFrameLoadTimeout();
			setSubscribers();
		}

		function setSubscribers() {
			subscribers.push(
				ko.postbox.subscribe(
					ePostboxTopic.ConcretePaymentData,
					function onConcretePaymentDataReceived(payment) {
						var ccTypeId = parseInt(payment.paymentData, 10);

						if (!isNaN(ccTypeId)) {
							form.selectedCCId(ccTypeId);
						}

						form.allowedCreditCards(payment.allowedCreditCards || []);
						form.isCcBinFromEea(payment.isCcBinFromEea);
					},
					true
				)
			);
		}

		function iframeTimeout() {
			waitedInterval += currentTimeout;
			dalDeposit.LogFrameNotLoadedMessage(
				getTokenizationError(),
				getLogDetails(),
				general.extractGuid(form.iframeSrc())
			);

			changeCCIframeSrc();
			clearInterval(interval);
			currentTimeout += interWindowsCommunicationTimeoutStep;
			interval = setInterval(iframeTimeout, currentTimeout);
		}

		function getTokenizationError() {
			if (waitedInterval >= waitIntervalForActivityLog && !frameNotLoadedActivityLogWritten) {
				frameNotLoadedActivityLogWritten = true;

				return eTokenizationError.frameNotLoadedDepositIntended;
			}

			return eTokenizationError.frameNotLoaded;
		}

		function getLogDetails(errorDetails) {
			return (
				encodeURI(form.iframeSrc()) +
				"; waited time:" +
				waitedInterval +
				"; " +
				(errorDetails || "") +
				" userAgent: " +
				navigator.userAgent
			);
		}

		function changeCCIframeSrc() {
			var pciIframeElement = document.getElementById("ccNumberIframe");

			if (pciIframeElement) {
				pciIframeElement.src = getIframeSrcWithCacheBuster();
			}
		}

		function getIframeSrc() {
			return getFrameUrl() + getFrameIdentifiersForUrl();
		}

		function getIframeSrcWithCacheBuster() {
			var url = getFrameUrl();

			return urlResolver.getUrlWithRndKeyValue(url) + getFrameIdentifiersForUrl();
		}

		function getFrameUrl() {
			return (
				environmentData.pciPath +
				environmentData.pciGenericCCNumberPage +
				"&theme=" +
				uiTheme +
				"&v=" +
				versionPci +
				"&d=" +
				window.location.host.replace(/\./g, "_")
			);
		}

		function getFrameIdentifiersForUrl() {
			return "#an=" + customer.prop.accountNumber + "&guid=" + frameId;
		}

		function handleIframeInputFocus(isInFocus) {
			form.isIframeInputInFocus(isInFocus);
		}

		//<COMMUNICATOR>
		function initCommunicator() {
			communicator.registerMessageHandler(environmentData.pciPath, {
				showCvvPopup: handleShowCvvPopup,
				readyIframe: handleReadyIframe,
				validationResponse: handleValidationResponse,
				iframeDataBinded: handleIframeDataBinded,
				redirectToUploadDocuments: handleRedirectToUploadDocuments,
				eventTracking: handleEventTracking,
				ifarmeInputInFocus: handleIframeInputFocus,
				isDepositInProgress: handleIsDepositInProgress,
				getClaims: getClaims,
			});
		}

		function handleIsDepositInProgress(value) {
			form.isDepositInProgress(value);
		}

		function handleEventTracking(event) {
			if (event.type == eDepositErrorType.fieldValidation) {
				if (general.isObjectType(event.details)) {
					ko.postbox.publish("deposit-failed-data", {
						message: String.format("Error type: {0}, message: {1}", event.type, event.details.message),
						key: event.details.contentKey,
					});
				} else {
					ko.postbox.publish(
						"deposit-failed",
						String.format("Error type: {0}, message: {1}", event.type, event.details)
					);
				}
			}
		}

		function handleRedirectToUploadDocuments() {
			form.isDepositButtonDisabled(true);
			ViewsManager.RedirectToForm(eForms.UploadDocuments);
		}

		function handleIframeDataBinded() {
			form.isIframeDataBinded(true);
		}

		function handleShowCvvPopup(creditCardTypeId) {
			cvvTooltipInfo.isCvvTooltipVisible(!cvvTooltipInfo.isCvvTooltipVisible());

			if (cvvTooltipInfo.isCvvTooltipVisible()) {
				setCvvText(creditCardTypeId || eDepositCreditCardType.Unknown);
			}
		}

		function handleReadyIframe() {
			form.iframeReady(true);
			timeoutDefered.resolve("ready");

			dataLoaderPromise
				.then(function onInitialDataReceived(initialData) {
					communicator.postMessage(form.iframeElement(), initialData, environmentData.pciPath);
				})
				.done();
		}

		function initFrameLoadTimeout() {
			currentTimeout = interWindowsCommunicationTimeout;
			dalDeposit.LogGenericCCDepositCommunication("VM load", "load promise timeout started", "written");
			clearInterval(interval);
			interval = setInterval(iframeTimeout, currentTimeout);

			timeoutDefered = Q.defer();
			timeoutDefered.promise
				.then(function onTimeout(result) {
					dalDeposit.LogGenericCCDepositCommunication(
						"VM load",
						"load promise timeout was resolved with result:" + result,
						"written"
					);
					clearInterval(interval);
				})
				.done();
		}

		function startPreloadingData() {
			dataLoaderPromise = Q.all([
				dalDeposit.getAllowedCreditCardsWithAmountValidation(eDepositingActionType.Regular),
				dalDeposit.getLastSuccesfullDepositCurrency(),
				dalDeposit.getCreditCardData(eDepositingActionType.Regular),
			]).spread(prepareInitialDataForIframe);
		}

		function prepareInitialDataForIframe(creditCards, customerLastPaymentCurrencyId, usedCreditCardsData) {
			var parsedCreditCards = jsonHelper.STR2JSON(
				"GenericCreditCardViewModel/prepareInitialDataForIframe",
				creditCards
			);
			var lastPaymentCurrencyId = parseInt(customerLastPaymentCurrencyId);
			var customerCurrencyId = customer.prop.baseCcyId();
			var brokerId = customer.prop.brokerID;
			var creditCardsRaw = jsonHelper.STR2JSON(
				"GenericCreditCardViewModel/prepareInitialDataForIframe",
				usedCreditCardsData
			);

			supportedCreditCards = !parsedCreditCards ? [] : parsedCreditCards.CreditCards;

			if (creditCardsRaw && creditCardsRaw.UsedCards) {
				buildUsedCreditCardsArray(creditCardsRaw.UsedCards);

				var usedCC = getUsedCreditCard();

				if (usedCC) {
					setCvvText(usedCC.cardTypeID);
				}
			}

			var initialData = {
				msg: "init",
				value: {
					content: content,
					customerCurrencyId: customerCurrencyId,
					brokerId: brokerId,
					lastPaymentCurrencyId: lastPaymentCurrencyId,
					creditCards: !parsedCreditCards ? [] : parsedCreditCards.CreditCards,
					isUsedCreditCard: isUsedCreditCard(),
					ccTypeId: getCCTypeForUsedCard(),
					ccFirst6: usedCC ? usedCC.first6 : "",
					isCcBinFromEea: form.isCcBinFromEea(),
				},
			};

			return initialData;
		}

		function getCCTypeForUsedCard() {
			var undef;

			if (!isUsedCreditCard()) {
				return undef;
			}

			var usedCreditCard = getUsedCreditCard();

			return usedCreditCard === undef ? undef : usedCreditCard.cardTypeID;
		}

		function getUsedCreditCard() {
			var undef;

			if (!isUsedCreditCard()) {
				return undef;
			}

			var ccId = form.selectedCCId();

			var usedCard = usedCreditCards.find(function findCC(usedCreditCard) {
				return usedCreditCard.paymentID === ccId;
			});

			if (!general.isEmptyType(usedCard)) {
				return usedCard;
			}

			ViewsManager.RedirectToForm(eForms.Deposit);

			var warningMessage = "Missing used card with CC id: " + ccId;
			Logger.warn(
				"GenericCreditCardViewModel:getUsedCreditCard",
				warningMessage,
				general.emptyFn,
				eErrorSeverity.warning
			);
		}

		function getCCGuidForUsedCardByCCId(ccId) {
			var usedCard = usedCreditCards.find(function findCC(usedCreditCard) {
				return usedCreditCard.paymentID === ccId;
			});

			if (!general.isEmptyType(usedCard)) {
				return usedCard.ccGuid;
			}

			throw new Error("Missing used card with CC id: " + ccId);
		}

		function buildUsedCreditCardsArray(usedCardsUnmapped) {
			usedCreditCards = usedCardsUnmapped.map(function mapCC(usedCard) {
				return new CreditCardView(usedCard);
			});
		}

		function getClaims() {
			var recordTypes = [eClaimRecordType.CVV];
			form.isDepositInProgress(true);

			if (!isUsedCreditCard()) {
				recordTypes.push(eClaimRecordType.CreditCard);
			}

			return dalClaims
				.postGetCCClaim(eClaimActionType.Save, recordTypes, customer.prop.accountNumber)
				.timeout(
					customSettings.getClaimsTimeoutInMiliseconds,
					"Claim request failed after a time out of " + customSettings.getClaimsTimeoutInMiliseconds + " ms"
				)
				.then(processClaims)
				.fail(onGetClaimsError);
		}

		function processClaims(resultText) {
			var result = JSONHelper.STR2JSON("GenericCreditCardViewModel:processClaims", resultText);

			if (!result || result.error) {
				throw new Error(resultText);
			}

			var message = {
				msg: "setClaims",
				value: {
					cvvClaim: result.Cvv.claimGuid,
					ccNumberClaim: result.CreditCard ? result.CreditCard.claimGuid : "",
				},
			};

			communicator.postMessage(form.iframeElement(), message, environmentData.pciPath);
		}

		function onGetClaimsError(data) {
			form.isDepositInProgress(false);
			form.isDepositButtonDisabled(false);
			communicator.postMessage(form.iframeElement(), { msg: "resetDepositButtonState" }, environmentData.pciPath);

			alertsManager.UpdateAlert(
				alertTypes.ServerResponseAlert,
				null,
				dictionary.GetItem("depUnableProcessRequest"),
				"",
				{}
			);
			alertsManager.PopAlert(alertTypes.ServerResponseAlert);

			handleError({
				type: eDepositErrorType.claim,
				details: data.status ? "Claim request failed with status " + data.status : data,
			});
		}

		function getContent() {
			var requiredResources = getListOfRequiredResourcesForPci();

			return buildContent(requiredResources);
		}

		function getListOfRequiredResourcesForPci() {
			return [
				{
					resourceName: "payments_genericcreditcard",
					content: [
						"reqValidCCNumber",
						"reqSupportedCCType",
						"reqValidCvvLength",
						"reqAmount",
						"rngAmount",
						"reqCHName",
						"invalidCC",
						"invalidCVV",
						"latinOnly",
						"month",
						"year",
						"Amount",
						"cardholdername",
						"depMinMaxBlocked",
						"cardno",
						"cvvtext",
						"expirationdate",
						"amounttodeposit",
						"use3DSecure",
						"whatiscvv",
						"reqMinDeposit",
						"reqMaxDeposit",
						"uploadDocuments",
						"reqExpiration",
						"amlValidationRequiredDocuments",
						"amlValidationMessage",
						"btnDeposit",
						"reqValidExpiration",
					],
				},
			];
		}

		function buildContent(requiredResources) {
			return [].concat.apply(
				[],
				requiredResources.map(function mapResouce(resource) {
					return {
						resourceName: resource.resourceName,
						content: resource.content.reduce(function mapKey(acc, key) {
							var value = dictionary.GetItem(key, resource.resourceName);

							if (value && value.startsWith("***")) {
								value = dictionary.GetItem(key);
							}

							acc[key.toLowerCase()] = value;
							return acc;
						}, {}),
					};
				})
			);
		}

		function sendDepositRequest(response) {
			if (general.isEmptyValue(response) || general.isEmptyValue(response.depositDetails)) {
				paymentStateChanged();
				return;
			}

			if (response.depositDetails.is3DFlow) {
				depositOptionsFor3DSecure.prepareDepositRequest();
			}

			if (!response.depositDetails.ccType) {
				alertsManager.UpdateAlert(
					alertTypes.ServerResponseAlert,
					null,
					dictionary.GetItem("depUnsupportedCardType", "payments_genericcreditcard"),
					"",
					{}
				);
				alertsManager.PopAlert(alertTypes.ServerResponseAlert);
				paymentStateChanged();
				return;
			}

			currentRequest = {
				paymentID: -1,
				cardTypeID: response.depositDetails.ccType,
				cardNumber: response.tokens.ccNumberGuid,
				cvv: response.tokens.cvvGuid,
				expMonth: response.depositDetails.expMonth,
				expYear: response.depositDetails.expYear,
				depositCurrency: response.depositDetails.currency,
				cardHolderName: response.depositDetails.cardholderName,
				amount: response.depositDetails.amount,
				paymentAuthMode: response.depositDetails.is3DFlow ? ePaymentAuthMode.D3Secure : ePaymentAuthMode.None,
			};

			if (isUsedCreditCard()) {
				fillRequestWithExistingCCDetails();
			}

			ko.postbox.publish("trading-event", "deposit-submit");

			dalDeposit
				.depositCreditCard(currentRequest)
				.then(onDepositRequestCompleted)
				.fail(onDepositRequestError)
				.done();
		}

		function fillRequestWithExistingCCDetails() {
			var usedCreditCard = getUsedCreditCard();

			currentRequest.cardTypeID = usedCreditCard.cardTypeID;
			currentRequest.cardNumber = usedCreditCard.ccGuid;
			currentRequest.expMonth = usedCreditCard.expMonth;
			currentRequest.expYear = usedCreditCard.expYear;
			currentRequest.cardHolderName = usedCreditCard.holderName;
		}

		function onDepositRequestError(error) {
			closePopup();
			form.isDepositInProgress(false);
		}

		function onDepositRequestCompleted(response) {
			if (response === null) {
				closePopup();
				form.isDepositInProgress(false);
				return;
			}

			var responseJson = jsonHelper.STR2JSON("GenericCreditCardViewModel/onDepositRequestCompleted", response)
				.result;

			currentRequest.EngineStatusID = responseJson[eDepositResponse.EngineStatusID];

			var messageType = depositAnalyzer.GetMessageType(responseJson);

			switch (messageType) {
				case eDepositMessageTypes.noSupportedClearers:
				case eDepositMessageTypes.notEnrolledCard:
					closePopup();
					break;

				case eDepositMessageTypes.d3ProcessStarted:
					form.isDepositInProgress(true);
					depositOptionsFor3DSecure.handle3DDeposit(responseJson);
					return;
			}

			handleDepositResponse(messageType, responseJson);

			closePopup();
		}

		function handleDepositResponse(messageType, responseJson) {
			var params = null;
			var messageData = {
				messageDetails: responseJson[eDepositResponse.MessageDetails],
				currency: symbolsManager.GetTranslatedSymbolById(currentRequest.depositCurrency),
				depositPaymentLast4: responseJson[eDepositResponse.Last4],
				amount: currentRequest.amount,
				confirmationCode: responseJson[eDepositResponse.ConfirmationCode],
				transactionDescriptor: responseJson[eDepositResponse.TransactionDescriptor],
				baseClearerTypeId: responseJson[eDepositResponse.BaseClearerTypeId],
			};
			var mustRedirectToClientQuestionnaire = shouldRedirectToClientQuestionnaire();

			if (messageType === eDepositMessageTypes.showAmlPending) {
				ko.postbox.publish("deposit-failed");
				paymentStateChanged();
				amlPopupManager.show();
				return;
			}

			var depositMessageWrapper = DepositMessagesManager.getDepositMessageWrapper(messageType, messageData);

			if (messageType === eDepositMessageTypes.succeeded) {
				ko.postbox.publish("deposit-success");

				if (!general.isEmptyValue(currentRequest.cardTypeID)) {
					dalDeposit.setUsedCardAsDefault(currentRequest.cardTypeID);
					var undefinedVar;
					customerProfileManager.ProfileCustomer().lastSelectedCategory = undefinedVar;
				}

				if (mustRedirectToClientQuestionnaire) {
					params = { redirectToView: eForms.ClientQuestionnaire };
					messageData = Object.assign({}, messageData, params);
				} else {
					params = { redirectToView: customSettings.formToDisplayForSuccessfulPayments };
				}
			} else {
				ko.postbox.publish("deposit-failed", depositMessageWrapper.message);
			}

			paymentStateChanged();

			if (shouldRedirectToNextView(messageType)) {
				var viewToShow =
					messageType === eDepositMessageTypes.succeeded
						? customSettings.formToDisplayForSuccessfulPayments
						: customSettings.formToDisplayForPendingPayments;

				if (general.isArrayType(depositMessageWrapper.messages) && depositMessageWrapper.messages.length > 0) {
					Object.assign(messageData, { depositMessages: depositMessageWrapper.messages });
				}

				switchToView(viewToShow, messageData);
			} else {
				params = params || {};

				if (messageType === eDepositMessageTypes.succeeded) {
					params["AlertType"] = alertTypes.DepositSuccessAlert;
				} else {
					setAdditionalPaymentAlertType(responseJson, params);
				}

				showDepositResponse(depositMessageWrapper, params);
			}
		}

		function shouldRedirectToNextView(messageType) {
			return (
				messageType === eDepositMessageTypes.pendingDepositRequest ||
				messageType === eDepositMessageTypes.requestPended ||
				messageType === eDepositMessageTypes.succeeded
			);
		}

		function setAdditionalPaymentAlertType(response, params) {
			if (
				response[eDepositResponse.ValidationStatusID] ===
				eDepositValidationStatus.ShowAdditionalPaymentOnFailedDeposit
			) {
				params["AlertType"] = alertTypes.GeneralCancelableAlert;
			}
		}

		function showDepositResponse(depositMessageWrapper, params) {
			var alertType = getAlertType(params);

			alertsManager.UpdateAlert(
				alertType,
				depositMessageWrapper.title,
				depositMessageWrapper.message,
				depositMessageWrapper.messages || "",
				params
			);
			alertsManager.PopAlert(alertType);
		}

		function preventViewSwitchDueToCustomerActivation() {
			var showAlerts = 1;

			postLoginAlerts.update("SetAlertsBehaviorMode", showAlerts);
		}

		function switchToView(redirectToView, params) {
			params.isCCDeposit = true;
			preventViewSwitchDueToCustomerActivation();
			viewModelsManager.VManager.SwitchViewVisible(redirectToView, params);
		}

		function getAlertType(params) {
			if (params && params.AlertType) {
				return params.AlertType;
			}

			return alertTypes.ServerResponseAlert;
		}

		function shouldRedirectToClientQuestionnaire() {
			return (
				statesManager.States.IsTradingBonusGoingToCDDAfterDeposit() === true ||
				statesManager.States.IsCddStatusNotComplete() === true ||
				statesManager.States.IsKycStatusRequired() === true ||
				statesManager.States.IsKycReviewStatusRequired() === true
			);
		}

		function closePopup() {
			if (window.external && window.external.CloseHostForm) {
				window.external.CloseHostForm();
			}

			if (!window.paymentsPopup) {
				return;
			}

			if (window.paymentsPopup.Close) {
				window.paymentsPopup.Close();
			}

			window.paymentsPopup = null;

			return;
		}

		function handleFailedDepositAttempt(response) {
			form.isDepositInProgress(false);

			if (general.isEmptyValue(response.errors) || response.errors.length <= 0) {
				return;
			}

			response.errors.forEach(function onError(error) {
				handleError(error);
			});
		}

		function handleError(error) {
			if (general.isEmptyValue(error)) {
				return;
			}

			switch (error.type) {
				case eDepositErrorType.upload:
				case eDepositErrorType.claim:
				case eDepositErrorType.ccTypeUnknown:
				case eDepositErrorType.isInvalidLuhn:
					dalDeposit.LogGenericCCDepositActivityMessage(
						eTokenizationError.uploadError,
						getLogDetails(getErrorData(error.details))
					);
					break;

				case eDepositErrorType.fieldValidation:
					//validation errors were shown and tracked
					break;
			}
		}

		function getRequestDataForCdd(response) {
			return {
				concretePaymentName: "Generic Credit Card",
				currencyName: response.depositDetails.depositCurrency.name,
				amount: response.depositDetails.amount,
			};
		}

		function handleValidationResponse(response) {
			if (complianceBeforeDeposit.isCddBeforeDeposit()) {
				complianceBeforeDeposit.openCdd(
					function getRequestData() {
						getRequestDataForCdd(response);
					},
					function depositCallback() {
						processDepositRequest(response);
					}
				);
			} else {
				if (complianceBeforeDeposit.isKycStatusFailCannotDeposit()) {
					complianceBeforeDeposit.showKycWarningAlert();
					form.isDepositInProgress(false);
					return;
				}

				processDepositRequest(response);
			}

			form.isDepositButtonDisabled(false);
		}

		function useExistingCCGuidForUsedCreditCard(response) {
			if (isUsedCreditCard()) {
				var existingCCGuid = getCCGuidForUsedCardByCCId(form.selectedCCId());
				if (!general.isEmptyValue(existingCCGuid)) {
					response.tokens.ccNumberGuid = existingCCGuid;
				}
			}
		}

		function isUsedCreditCard() {
			return !general.isEmptyValue(form.selectedCCId());
		}

		function processDepositRequest(response) {
			if (response.isValid) {
				form.isDepositInProgress(true);

				useExistingCCGuidForUsedCreditCard(response);
				setClaimsLabels(response);
				sendDepositRequest(response);
			} else {
				handleFailedDepositAttempt(response);
			}
		}

		function setClaimsLabels(response) {
			form.CCNumberGuid(response.tokens.ccNumberGuid);
			form.CVVGuid(response.tokens.cvvGuid);
		}

		function getErrorData(data) {
			if (!data) {
				return "";
			}

			if (data instanceof Error) {
				return data.message + " StackTrace: " + (data.stack ? data.stack : "");
			}

			return JSON.stringify(data);
		}

		function startDeposit() {
			form.isDepositButtonDisabled(true);
			communicator.postMessage(form.iframeElement(), { msg: "startDeposit" }, environmentData.pciPath);
		}

		function dispose() {
			communicator.unregisterMessageHandler();
			general.disposeArray(subscribers);
			timeoutDefered.resolve("stop");
		}

		init();

		return {
			Form: form,
			Deposit: startDeposit,
			ShowCVV: handleShowCvvPopup,
			CVVTooltipInfo: cvvTooltipInfo,
			dispose: dispose,
			CVVInfo: infoObs,
		};
	});

	return GenericCreditCardViewModel;
});
