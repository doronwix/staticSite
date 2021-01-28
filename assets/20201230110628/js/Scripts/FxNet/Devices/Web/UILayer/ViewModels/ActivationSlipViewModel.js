define(
    'deviceviewmodels/ActivationSlipViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'userflow/UserFlowManager',
        'StateObject!userFlow',
        'deviceviewmodels/account/UserFlowCTA'
    ],
    function ActivationSlipDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            stateObjectUserFlow = require("StateObject!userFlow"),
            UserFlowCTA = require("deviceviewmodels/account/UserFlowCTA");

        var ActivationSlipViewModel = general.extendClass(KoComponentViewModel, function ActivationSlipClass() {
            var self = this,
                parent = this.parent,
                Data = this.Data,
                userFlowUnsubscribe;

            var cta = null;
            var ctaTextIndex = '';

            function init() {
                setObservables();
                setSubscribers();
            }

            function setObservables() {
                Data.isVisible = ko.observable(false);
                Data.ctaText = ko.observable('');
                Data.userFlowMsg = ko.observable('');
            }

            function setSubscribers() {
                userFlowUnsubscribe = stateObjectUserFlow.subscribe(eStateObjectTopics.UserFlowChanged, function (model) {
                    userFlowUpdate(model);
                });

                var model = stateObjectUserFlow.get(eStateObjectTopics.UserFlowChanged);

                userFlowUpdate(model);
            }

            function userFlowUpdate(model) {
                if (model) {
                    Data.ctaText(model.ctaText);
                    cta = model.cta;
                    ctaTextIndex = model.ctaText;
                    Data.userFlowMsg(model.userMessage);
                    Data.isVisible(model.activationRequired);
                }
                else {
                    Data.isVisible(false);
                }
            }

            function dispose() {
                if (userFlowUnsubscribe) {
                    userFlowUnsubscribe();
                }

                parent.dispose.call(self);
            }

            function ctaClick() {
                if (ctaTextIndex !== "contactUs") {
                    ko.postbox.publish('action-source', 'DealSlip');
                }

                UserFlowCTA.getUserFlowAction(cta)();
            }

            return {
                init: init,
                dispose: dispose,
                data: Data,
                ctaClick: ctaClick
            };
        });

        function createViewModel() {
            var viewModel = new ActivationSlipViewModel();

            viewModel.init();

            return viewModel;
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);


