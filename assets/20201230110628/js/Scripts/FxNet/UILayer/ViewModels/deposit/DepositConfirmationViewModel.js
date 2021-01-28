define(
    'viewmodels/deposit/DepositConfirmationViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'initdatamanagers/SymbolsManager',
        'initdatamanagers/Customer',
        'generalmanagers/ErrorManager',
        'dataaccess/dalWithdrawal',
        'fxnet/uilayer/Modules/HtmlToCanvas',
        'fxnet/uilayer/Modules/DomHelper',
        'configuration/initconfiguration',
        'StateObject!withdrawalCCDeposits'
    ],
    function DepositConfirmationDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            symbolsManager = require('initdatamanagers/SymbolsManager'),
            customer = require('initdatamanagers/Customer'),
            ErrorManager = require('generalmanagers/ErrorManager'),
            dalWithdrawal = require('dataaccess/dalWithdrawal'),
            HtmlToCanvas = require('fxnet/uilayer/Modules/HtmlToCanvas'),
            DomHelper = require('fxnet/uilayer/Modules/DomHelper'),
            depositConfirmationConfiguration = require('configuration/initconfiguration').DepositConfirmationConfiguration,
            withdrawalCCDeposits = require('StateObject!withdrawalCCDeposits');

        var DepositConfirmationViewModel = general.extendClass(KoComponentViewModel, function DepositConfirmationClass(params) {
            var self = this,
                parent = this.parent, // inherited from KoComponentViewModel
                data = this.Data,
                depositsInfo = {},
                printSettings = {
                    elementToPrint: null,
                    topOffset: general.emptyFn
                };

            function init(settings) {
                parent.init.call(self, settings); // inherited from KoComponentViewModel

                setObservables();

                initDepositsInfo();
                start();
            }

            function start() {
                if (withdrawalCCDeposits.containsKey('ccDeposits')) {
                    var ccDeposits = withdrawalCCDeposits.get('ccDeposits');

                    setCCDeposits(ccDeposits);
                }
                else {
                    dalWithdrawal
                        .getCCDeposits()
                        .then(onLoadCCDepositsComplete)
                        .done();
                }
            }

            function initDepositsInfo() {
                depositsInfo.depositsTotal = ko.observableArray();
                depositsInfo.deposits = ko.observableArray();
                depositsInfo.firstDepositDate = ko.observable("");
                depositsInfo.lastDepositDate = ko.observable("");
                depositsInfo.withdrawalFlow = ko.observable(false);
            }

            function onLoadCCDepositsComplete(responseText) {
                var ccDepositsResponse = JSONHelper.STR2JSON("ViewAndPrintWithdrawalViewModel/onLoadCCDepositsComplete", responseText, eErrorSeverity.medium);

                setCCDeposits(ccDepositsResponse);
            }

            function setCCDeposits(ccDepositsData) {
                depositsInfo.deposits(ccDepositsData.Deposits);
                depositsInfo.depositsTotal(ccDepositsData.DepositsTotal);

                depositsInfo.firstDepositDate(ccDepositsData.FirstDepositDate);
                depositsInfo.lastDepositDate(ccDepositsData.LastDepositDate);
                depositsInfo.withdrawalFlow(params.withdrawalFlow);
            }

            function setObservables() {
                data.isEmailClicked = ko.observable(false);
                data.fullName = customer.prop.firstName + ' ' + customer.prop.lastName;
                data.accountNumber = customer.prop.accountNumber;
                data.userName = customer.prop.userName;
                data.dateNow = new Date();
                data.isLoading = ko.observable(false);
                data.drawStatus = ko.observable(false);
                data.editFullName = ko.observable('');
                data.editPhoneNumber = ko.observable('');
                data.hasErrors = ko.observable(false);
            }

            function excludeElementsFromImage(node) {
                return DomHelper.NodeExists(node, depositConfirmationConfiguration.excludeList);
            }

            function sendDepositConfirmation() {
                data.hasErrors(false);

                if (data.editFullName().length === 0 ||
                    data.editPhoneNumber().length === 0 ||
                    !data.drawStatus() ||
                    data.isLoading()) {
                    return;
                }

                data.isLoading(true);

                var options = {
                    scrollX: 0,
                    scrollY: printSettings.topOffset(),
                    ignoreElements: excludeElementsFromImage,
                    useCORS: true
                };

                HtmlToCanvas
                    .convert(printSettings.elementToPrint, options)
                    .then(uploadImage)
                    .catch(onProcessImageError);
            }

            function getExtraLoggerInfo() {
                var infoObj = {
                    FullName: data.editFullName(),
                    RequestIDs: depositsInfo.deposits().map(function (d) { return general.isInt(d.RequestID) ? parseInt(d.RequestID) : null })
                };

                return infoObj;
            }

            function uploadImage(canvas) {
                var image = {
                    content: canvas.toDataURL(),
                    fileName: uploadImageName()
                };

                if (!isValidBase64Content(image.content)) {
                    data.isLoading(false);
                    data.hasErrors(true);

                    ErrorManager.onWarning('DepositConfirmationVM/sendDepositConfirmation', 'Invalid generated image. Content:' + image.content + '; filename:' + image.fileName + '; canvas width:' + canvas.width + '; canvas height:' + canvas.height);

                    return;
                }

                if (general.isFunctionType(params.uploadStringImage)) {
                    var extraLoggerInfo = getExtraLoggerInfo();

                    params.uploadStringImage(image, extraLoggerInfo);
                }
            }

            function isValidBase64Content(content) {
                if (content === null || content.length <= 22)
                    return false;

                return true;
            }

            function onProcessImageError(error) {
                data.isLoading(false);
                data.hasErrors(true);

                ErrorManager.onError('DepositConfirmationVM/sendDepositConfirmation', error.message, eErrorSeverity.medium);
            }

            function getTranslatedSymbolByName(currency) {
                return symbolsManager.GetTranslatedSymbolByName(currency);
            }

            function uploadImageName() {
                return 'DC_' + data.accountNumber + '_' + data.dateNow.toISOString().replace(/(-|T|:)/g, '').slice(0, 12) + '.png';
            }

            function setPrintSettings(element, pageTopOffset) {
                printSettings.elementToPrint = element;
                printSettings.topOffset = pageTopOffset;
            }

            return {
                init: init,
                DepositsInfo: depositsInfo,
                data: data,
                sendDepositConfirmation: sendDepositConfirmation,
                getTranslatedSymbolByName: getTranslatedSymbolByName,
                setPrintSettings: setPrintSettings
            };
        });

        var createViewModel = function (params) {
            var viewModel = new DepositConfirmationViewModel(params);

            viewModel.init(params);

            return viewModel;
        };

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
