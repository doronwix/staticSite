define(
    'viewmodels/Deals/ScheduleGroupViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'StateObject!ScheduleGroup'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            scheduleGroupStateObject = require('StateObject!ScheduleGroup');

        var ScheduleGroupViewModel = general.extendClass(KoComponentViewModel, function () {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                scheduleGroupStateObjectUnsubscribe;

            function init(settings) {
                parent.init.call(self, settings);   // inherited from KoComponentViewModel

                setObservables();
                setSubscribers();
                setInitialData();
            }

            function setObservables() {
                data.scheduleGroup = ko.observable();
                data.hasOneTradingHour = ko.observable();
                data.hasMultipleTradingHours = ko.observable();
            }

            function setSubscribers() {
                if (!scheduleGroupStateObject.get("ScheduleGroupData")) {
                    scheduleGroupStateObject.set("ScheduleGroupData", null);
                }

                scheduleGroupStateObjectUnsubscribe = scheduleGroupStateObject.subscribe("ScheduleGroupData", updateScheduleGroup);
            }

            function setInitialData() {
                var scheduleGroup = scheduleGroupStateObject.get("ScheduleGroupData");

                updateScheduleGroup(scheduleGroup);
            }

            function updateScheduleGroup(scheduleGroup) {
                data.scheduleGroup(scheduleGroup);

                if (!general.isNullOrUndefined(scheduleGroup)) {
                    data.hasOneTradingHour(!general.isEmpty(scheduleGroup.TradingBreak1_GMT) && general.isEmpty(scheduleGroup.TradingBreak2_GMT));
                    data.hasMultipleTradingHours(!general.isEmpty(scheduleGroup.TradingBreak1_GMT) && !general.isEmpty(scheduleGroup.TradingBreak2_GMT));
                }
            }

            function dispose() {
                if (scheduleGroupStateObjectUnsubscribe) {
                    scheduleGroupStateObjectUnsubscribe();
                }
            }

            return {
                init: init,
                dispose: dispose,
                Data: data
            };
        });

        var createViewModel = function () {
            var viewModel = new ScheduleGroupViewModel();
            viewModel.init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);