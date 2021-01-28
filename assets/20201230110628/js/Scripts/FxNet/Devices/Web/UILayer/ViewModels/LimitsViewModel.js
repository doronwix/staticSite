define([
	"require",
	"knockout",
	"handlers/general",
	"helpers/KoComponentViewModel",
	"viewmodels/Limits/ActiveLimitsModule",
	"managers/viewsmanager",
	"Dictionary",
	"viewmodels/dialogs/DialogViewModel",
	"managers/PrintExportManager",
	"initdatamanagers/Customer",
], function (require) {
	var ko = require("knockout"),
		general = require("handlers/general"),
		KoComponentViewModel = require("helpers/KoComponentViewModel"),
		ActiveLimitsModule = require("viewmodels/Limits/ActiveLimitsModule"),
		ViewsManager = require("managers/viewsmanager"),
		DialogViewModel = require("viewmodels/dialogs/DialogViewModel"),
		Dictionary = require("Dictionary"),
		customer = require("initdatamanagers/Customer"),
		printExportManager = require("managers/PrintExportManager");

	var LimitsViewModel = general.extendClass(KoComponentViewModel, function LimitsViewModelClass() {
		var self = this,
			parent = this.parent; // inherited from KoComponentViewModelz,

		function init(params) {
			parent.init.call(self, params);

			if (!params.isHeaderComponent) {
				initExport();
			}
		}

		function dispose() {
			parent.dispose.call(self);
		}

		function initExport() {
			self.subscribeAndNotify(ActiveLimitsModule.HasRecords, monitorData);
		}

		function monitorData(hasData) {
			ko.postbox.publish("printableDataAvailable", {
				dataAvailable: hasData,
				viewType: ViewsManager.ActiveFormType(),
				viewModel: "LimitsViewModel",
			});
		}

		function updateRemoveLimit(limit) {
			if (printExportManager.IsWorkingNow()) {
				return;
			}

			var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogClass = "deal-slip" + (revisedSlip ? " revised-slip" : ""),
				dialogTitle = !revisedSlip
					? Dictionary.GetItem("EditDeleteOpeningLimit", "dialogsTitles", " ") + " " + limit.orderID
					: "";

			DialogViewModel.open(
				eDialog.EditLimit,
				{
					title: dialogTitle,
					width: 700,
					customTitle: "EditLimitHeader",
					persistent: false,
					dialogClass: dialogClass,
				},
				eViewTypes.vEditLimit,
				{
					orderId: limit.orderID,
					pageName: eDealPage.EditLimitViewModel,
					chart: {
						direction: eChartDirection.Same,
						allowDragLine: true,
						keys: {
							stopLoss: "chartline_IfDoneStopLoss",
							takeProfit: "chartline_IfDoneTakeProfit",
							currentRate: "chartline_CurrentRate",
							limitLevel: "chartline_LimitLevel",
						},
					},
				}
			);
		}
 
        function getSlTpDialogTitle(limitType, limit, revisedDealSlip) {
            if (revisedDealSlip) {
                return  '';
            }

            var contentKey = limitType === eLimitType.StopLoss ? 'UpdateRemoveStopLossTitle' : 'UpdateRemoveTakeProfitTitle',
                suffix = ' ' + limit.orderID;
            
            if (limitType === eLimitType.StopLoss && Number(limit.slRate) == 0) {
                contentKey = 'AddStopLossTitle';
                suffix = '';
            } else if (limitType === eLimitType.TakeProfit && Number(limit.tpRate) == 0) {
                contentKey = 'AddTakeProfitTitle';
                suffix = '';
            }
            
            return Dictionary.GetItem(contentKey, 'dialogsTitles', ' ') + suffix;
        }

        function addEditSlTp(limitType, limit) {
			var revisedSlip = customer.HasAbTestConfig(eAbTestProps.dealSlipsRevised),
				dialogClass = "deal-slip" + (revisedSlip ? " revised-slip" : ""),
                dialogTitle = getSlTpDialogTitle(limitType, limit, revisedSlip),
                chartProperties = {
                    direction: eChartDirection.Opposite,
                    allowDragLine: true,
                    keys: {
                        stopLoss: 'chartline_IfDoneStopLoss',
                        takeProfit: 'chartline_IfDoneTakeProfit',
                        currentRate: 'chartline_IfDoneClosingRate',
                        limitLevel: 'chartline_LimitLevel'
                    }
                };

            DialogViewModel.open(eDialog.EditLimit,
                {
                    title: dialogTitle,
                    width: 700,
                    persistent: false,
                    customTitle: 'EditLimitHeader',
					dialogClass: dialogClass
                },
                eViewTypes.vEditLimit,
                {
                    chart: chartProperties,
                    currentRateDirectionSwitch: true,
                    isStartNavigator: false,
                    limitType: limitType,
                    orderId: limit.orderID,
                    pageName: eDealPage.EditIfDoneLimit,
                });
        }

		return {
			init: init,
			dispose: dispose,
			model: ActiveLimitsModule,
            updateRemoveLimit: updateRemoveLimit,
            addEditSlTp: addEditSlTp
		};
	});

	var createViewModel = function (params) {
		var viewModel = new LimitsViewModel();
		viewModel.init(params);

		return viewModel;
	};

	return {
		viewModel: {
			createViewModel: createViewModel
		},
	};
});
