define("deviceviewmodels/EconomicCalendar/EconomicCalendarEventViewModel", [
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"managers/viewsmanager",
	"global/UrlResolver",
	"managers/instrumentTranslationsManager",
	"configuration/initconfiguration",
	"StateObject!EconomicCalendar",
], function EconomicCalendarEventDef(
	ko,
	general,
	KoComponentViewModel,
	viewsManager,
	urlResolver,
	instrumentTranslationManager,
	initconfiguration,
	stateObjectEc
) {
	var EconomicCalendarEventViewModel = general.extendClass(KoComponentViewModel, function EconomicCalendarEventClass(params) {
		var self = this,
			instrsPerEventKey = "instrsPerEvent",
			soFilterDataKey = "filterData",
			eventData = params.eventData,
			parent = this.parent,
			data = this.Data,
			instrumentOptions =
				initconfiguration.EconomicCalendarConfiguration.instrumentsToTrade[eventData.CountryCode] || [];

		function init() {
			parent.init.call(self);

			if (!stateObjectEc.containsKey(instrsPerEventKey)) {
				stateObjectEc.set(instrsPerEventKey, {});
			}

			data.showDateHeader = params.showDateHeader;
			setObservables();
			setSubscribers();
		}

		function setObservables() {
			var savedInstrsPerEvent = stateObjectEc.get(instrsPerEventKey),
				savedSelectedInstr = savedInstrsPerEvent[eventData.RecordId],
				options = instrumentOptions.map(function (instrumentId) {
					return {
						id: instrumentId,
						label: instrumentTranslationManager.Short(instrumentId),
					};
				});

			data.options = ko.observable(options);
			data.selectedInstr = ko.observable(savedSelectedInstr || instrumentOptions[0]);
		}

		function setSubscribers() {
			self.subscribeTo(data.selectedInstr, function (newValue) {
				var savedInstrsPerEvent = stateObjectEc.get(instrsPerEventKey);

				savedInstrsPerEvent[eventData.RecordId] = newValue;
				stateObjectEc.update(instrsPerEventKey, savedInstrsPerEvent);
			});
		}

		function ctaAction() {
			var soFilterData = stateObjectEc.get(soFilterDataKey) || {};

			ko.postbox.publish("economic-calendar-trade-cta", {
				View: eForms.EconomicCalendar,
				EventCountry: eventData.CountryCode,
				Tab: Object.keys(eDateFilter)[soFilterData.selectedDateTab],
				EventId: eventData.RecordId,
				InstrumentName: instrumentTranslationManager.Short(data.selectedInstr()),
				CalendarEventDate: eventData.EventTime ? Format.toFullDateTimeUTC(new Date(eventData.EventTime)) : "NA",
			});

			viewsManager.RedirectToURL(urlResolver.getRedirectUrl("NewDeal", "instrumentId=" + data.selectedInstr()));
		}

		function dispose() {
			parent.dispose.call(self);
		}

		return {
			init: init,
			dispose: dispose,
			Data: data,
			EventData: eventData,
			CtaAction: ctaAction,
		};
	});

	var createViewModel = function (params) {
		var viewModel = new EconomicCalendarEventViewModel(params);
		viewModel.init();

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel,
		},
	};
});
