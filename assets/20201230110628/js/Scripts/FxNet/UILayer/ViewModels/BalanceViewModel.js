function BalanceViewModel(
	ko,
	dalAccountingActions,
	ViewModelBase,
	DealsManager,
	general,
	ObservableDataSet,
	JSONHelper,
	customer,
	viewsManager,
	symbolsManager
) {
	var self,
		viewInfo = {},
		inheritedInstance = general.clone(ViewModelBase),
		hasDataSubscriber;

	var filter = new (function () {
		var me = this;

		me.SymbolId = ko.observable();
		me.OriginalActionCategory = ko.observable("All");

		me.ActionCategory = ko.computed(function () {
			var actionType = me.OriginalActionCategory() || "All";

			switch (actionType.toLowerCase()) {
				case "all":
					actionType = eAccountingActionsCategory.All;
					break;
				case "deposits":
					actionType = eAccountingActionsCategory.Deposits;
					break;
				case "withdrawals":
					actionType = eAccountingActionsCategory.Withdrawals;
					break;
				case "pl":
					actionType = eAccountingActionsCategory.DealPL;
					break;
				case "overnightfinancing":
					actionType = eAccountingActionsCategory.OvernightFinancing;
					break;
				case "contractrollover":
					actionType = eAccountingActionsCategory.ContractRollover;
					break;
				case "dividend":
					actionType = eAccountingActionsCategory.Dividend;
					break;
				case "general":
					actionType = eAccountingActionsCategory.General;
					break;
			}
			return actionType;
		});

		me.From = ko.observable(new Date().AddWeeks(-1).ExtractDate());
		me.To = ko.observable(new Date().ExtractDate());
		me.Position = ko.observable("");
		me.Page = ko.observable(1);
		me.PageSize = 20;

		me.Currencies = ko.observableArray();
	})();

	var onLoad = function (data) {
		viewInfo.showBalanceColumn(filter.SymbolId() !== 0);
	};

	var dsColumns = {
		idField: "actionNumber",
		columns: [
			{
				name: "rowNumber",
				transform: function (value, rowIndex) {
					return rowIndex;
				},
			},
			{
				name: "actionNumber",
				dataIndex: eAccountingAction.actionID,
			},
			{
				name: "date",
				dataIndex: eAccountingAction.date,
			},
			{
				name: "credit",
				dataIndex: eAccountingAction.credit,
			},
			{
				name: "debit",
				dataIndex: eAccountingAction.debit,
			},
			{
				name: "symbolName",
				transform: function (value, rowIndex, cIndex, rawRecord) {
					return symbolsManager.GetTranslatedSymbolById(rawRecord[eAccountingAction.symbolID]);
				},
			},
			{
				name: "creditNoComma",
				transform: function (value, rowIndex, columnIndex, rawRecord, record) {
					return record.credit.sign();
				},
			},
			{
				name: "debitNoComma",
				transform: function (value, rowIndex, columnIndex, rawRecord, record) {
					return record.debit.sign();
				},
			},
			{
				name: "debitCredit",
				transform: function (value, rowIndex, columnIndex, rawRecord, record) {
					return record.debit.cleanComma() > 0
						? "-" + record.debit.cleanComma()
						: record.credit.cleanComma() > 0
						? record.credit.cleanComma()
						: "0.00";
				},
			},
			{
				name: "type",
				transform: function (value, rowIndex, columnIndex, rawRecord) {
					return Dictionary.GetItem("acctype" + rawRecord[eAccountingAction.actionTypeID]);
				},
			},
			{
				name: "isEditable",
				transform: function (value, rowIndex, columnIndex, rawRecord) {
					var isOpenPosition = false;
					var positionNumber = rawRecord[eAccountingAction.posNum];

					DealsManager.Deals.ForEach(function iterator(orderId, deal) {
						if (deal.positionNumber == positionNumber) {
							isOpenPosition = true;

							return false;
						}
					});

					return !isOpenPosition;
				},
			},
			{
				name: "balance",
				dataIndex: eAccountingAction.balance,
			},
			{
				name: "comment",
				dataIndex: eAccountingAction.comment,
			},
			{
				name: "positionNumber",
				dataIndex: eAccountingAction.posNum,
			},
		],
		pageSizes: 20,
		statusField: "status",
		totalField: "totalItems",
		dataField: "actions",
		pagination: {
			pagesPerPage: 5,
			pageIndexField: "Page",
			pageSizeField: "PageSize",
		},
		Filter: filter,
		DAL: {
			reference: dalAccountingActions.LoadAccountingActions,
			callerName: "StatementControl/onLoadComplete",
			errorSeverity: eErrorSeverity.medium,
			onLoad: onLoad,
		},
	};

	var dataSet = new ObservableDataSet(ko, general, dsColumns);

	var init = function (customSettings) {
		self = this;
		inheritedInstance.setSettings(self, customSettings);

		setDefaultObservables();
		setExtenders();
		registerObservableStartUpEvent();

		setFilterDefaults();
		dataSet.Init();
	};

	var setExtenders = function () {
		filter.Position = filter.Position.extend({
			toNumericLength: {
				ranges: [
					{
						from: 0,
						to: Number.MAX_SAFE_INTEGER,
						decimalDigits: 0,
					},
				],
			},
		});
	};

	var setDefaultObservables = function () {
		viewInfo.showBalanceColumn = ko.observable();
	};

	var registerObservableStartUpEvent = function () {
		viewsManager.GetActiveFormViewProperties(eViewTypes.vBalance).state.subscribe(function (state) {
			switch (state) {
				case eViewState.Start:
					start();
					break;
				case eViewState.Stop:
					stop();
					break;
				case eViewState.Refresh:
					dataSet.Load();
					viewsManager.GetActiveFormViewProperties(eViewTypes.vBalance).state(eViewState.Initial);
					break;
			}
		});
	};

	var start = function () {
		hasDataSubscriber = dataSet.HasRecords.subscribe(function (hasData) {
			ko.postbox.publish("printableDataAvailable", {
				dataAvailable: hasData,
				viewType: viewsManager.ActiveFormType(),
				viewModel: "BalanceViewModel",
			});
		});

		dalAccountingActions.GetAccountSymbols(onLoadCCYComplete);
	};

	var stop = function () {
		dataSet.Clean();
		if (hasDataSubscriber) {
			hasDataSubscriber.dispose();
			hasDataSubscriber = null;
		}
		setFilterDefaults();
	};

	var setFilterDefaults = function () {
		filter.SymbolId(customer.prop.baseCcyId());
		filter.OriginalActionCategory("All");
		filter.From(new Date().AddWeeks(-1).ExtractDate());
		filter.To(new Date().ExtractDate());
		filter.Position("");

		if (inheritedInstance.getSettings(self).pageSize) {
			filter.PageSize = inheritedInstance.getSettings(self).pageSize;
		}
	};

	var onLoadCCYComplete = function (responseText) {
		var userSymbols = JSONHelper.STR2JSON("StatementControl/onLoadCCYComplete", responseText, eErrorSeverity.low);

		if (userSymbols) {
			var options = [];
			options.push({
				name: Dictionary.GetItem("All", "contentdata", " "),
				value: eAccountingActionsCategory.All,
			});

			for (var i = 0, ii = userSymbols.length; i < ii; i++) {
				options.push({ name: $symbolsManager.GetTranslatedSymbolById(userSymbols[i]), value: userSymbols[i] });
			}

			filter.Currencies(options);
		}

		setFilterDefaults();
		dataSet.ApplyFilter();
	};

	var enableApplyButton = ko.computed(function () {
		return !dataSet.IsLoadingData();
	}, self);

	var applyFilter = function () {
		if (enableApplyButton()) dataSet.ApplyFilter();
	};

	//----------------------------------------------------------------
	return {
		Init: init,
		ViewInfo: viewInfo,
		BalanceInfo: dataSet.DataRows,
		GetNextBalance: dataSet.Paging.ShowMore(),
		VisibleShowMore: dataSet.Paging.HasNextPage,
		DataSet: dataSet,
		Filter: filter,
		EnableApplyButton: enableApplyButton,
		ApplyFilter: applyFilter,
		HasRecords: dataSet.HasRecords,
		DsColumns: dsColumns,
	};
}

define([
	"knockout",
	"dataaccess/dalAccountingActions",
	"viewmodels/ViewModelBase",
	"cachemanagers/dealsmanager",
	"handlers/general",
	"helpers/observabledataset",
	"JSONHelper",
	"initdatamanagers/Customer",
	"initdatamanagers/SymbolsManager",
	"managers/viewsmanager",
	"customEnums/ViewsEnums",
], function (
	ko,
	dalAccountingActions,
	ViewModelBase,
	DealsManager,
	general,
	ObservableDataSet,
	JSONHelper,
	customer,
	symbolsManager,
	viewsManager
) {
	return BalanceViewModel(
		ko,
		dalAccountingActions,
		ViewModelBase,
		DealsManager,
		general,
		ObservableDataSet,
		JSONHelper,
		customer,
		viewsManager,
		symbolsManager
	);
});
