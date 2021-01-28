define(
    'deviceviewmodels/UploadDocuments/VerificationDocumentModal',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel');

        var VerificationDocumentModal = general.extendClass(KoComponentViewModel, function (params) {
            var data = this.Data;

            function init() {
                setObservables();
            }

            function setObservables() {
                var iframeElem = document.getElementById("shuftipro-iframe");

                data.iframeElement = ko.observable(iframeElem);
                data.iframeUrl = ko.observable(params.iframeUrl);
                data.iframeHeight = ko.observable(params.iframeHeight);
            }


            return {
                Init: init,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new VerificationDocumentModal(params);

            viewModel.Init();

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
)