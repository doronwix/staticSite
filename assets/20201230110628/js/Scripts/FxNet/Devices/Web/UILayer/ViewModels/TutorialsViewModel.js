define(
    'deviceviewmodels/TutorialsViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'devicemanagers/AlertsManager',
        "Dictionary",
        'devicecustommodules/SeamlessPermissionsModule'
    ],
    function (require) {
        var KoComponentViewModel = require('helpers/KoComponentViewModel'),
            Dictionary = require('Dictionary'),
            ko = require('knockout'),
            general = require('handlers/general'),
            SeamlessPermissionsModule = require('devicecustommodules/SeamlessPermissionsModule'),
            AlertsManager = require('devicemanagers/AlertsManager');

        var TutorialsViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent,
                data = this.Data;

            function init(settings) {
                parent.init.call(self, settings);

                setTutorialsConfig();

                if (!params.isTutorialsAllowed && !SeamlessPermissionsModule.CheckSeamless()) {
                    if (params.stateAccessRequestKey === eStateObjectAccessRequest.VideoLessons) {
                        openVideoLessonsAlert();
                    } else {
                        openTutorialsAlert();
                    }
                }
            }

            function setTutorialsConfig() {
                window.tutorialsType = params.tutorialType;
                window.tutorialsTrackingParams = params.tutorialsTrackingParams;

                ko.postbox.publish('tutorial-view-active', window.tutorialsTrackingParams);
            }

            function openVideoLessonsAlert() {
                var title = Dictionary.GetItem('lblVideoLessons', 'accessRequest');

                AlertsManager.ShowAlert(AlertTypes.RequestAccessVideoLessonsAlert, title, null, null, {
                    stateAccessRequestKey: params.stateAccessRequestKey,
                    requestAccessType: params.requestAccessType
                });
            }

            function openTutorialsAlert() {
                var title = Dictionary.GetItem('lblTutorials', 'accessRequest');

                AlertsManager.ShowAlert(AlertTypes.RequestAccessTutorialsAlert, title, null, null, {
                    stateAccessRequestKey: params.stateAccessRequestKey,
                    requestAccessType: params.requestAccessType
                });
            }

            return {
                init: init,
                Data: data
            };
        });

        var createViewModel = function (_params) {
            var params = _params || {};

            var viewModel = new TutorialsViewModel(params);

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