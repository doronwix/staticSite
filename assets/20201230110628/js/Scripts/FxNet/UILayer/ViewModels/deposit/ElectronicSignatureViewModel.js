define(
    'viewmodels/deposit/ElectronicSignatureViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'SignaturePad'
    ],
    function (require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            SignaturePad = require('SignaturePad');

        var ElectronicSignatureViewModel = general.extendClass(KoComponentViewModel, function (params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data, // inherited from KoComponentViewModel
                signaturePad;

            function init() {
                parent.init.call(self);   // inherited from KoComponentViewModel
                setObservables();
                setSubscribers();
            }

            function initCanvas(canvasElement) {
                var options = { onBegin: startDraw, throttle: 0 };
                signaturePad = new SignaturePad(canvasElement, options);
            }

            function setObservables() {
                data.drawStatus = ko.observable(false);
                data.isLoading =general.isFunctionType(params.isLoading) ? params.isLoading :general.emptyFn;
            }

            function setSubscribers() {
                self.subscribeTo(data.drawStatus, function () {
                    if (general.isFunctionType(params.callback)) {
                        params.callback(data.drawStatus());
                    }
                });
            }

            function startDraw() {
                data.drawStatus(true);
            }

            function clearSignature() {
                signaturePad.clear();

                data.drawStatus(false);
            }

            return {
                init: init,
                InitCanvas: initCanvas,
                ClearSignature: clearSignature,
                Data: data
            };
        });

        var createViewModel = function (params) {
            var viewModel = new ElectronicSignatureViewModel(params);
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