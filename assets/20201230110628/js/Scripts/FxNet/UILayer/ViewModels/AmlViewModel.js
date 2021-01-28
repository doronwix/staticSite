/* global ePEPStatus, eResult, eErrorSeverity */
define(
    'viewmodels/AmlViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'JSONHelper',
        'devicemanagers/ViewModelsManager',
        'dataaccess/dalCompliance',
        'currentAppFolder/UILayer/uiBehavior',
        'initdatamanagers/Customer',
        'modules/systeminfo',
        'configuration/initconfiguration'
    ],
    function AmlDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            JSONHelper = require('JSONHelper'),
            ViewModelsManager = require('devicemanagers/ViewModelsManager'),
            dalCompliance = require('dataaccess/dalCompliance'),
            formBehavior = require('currentAppFolder/UILayer/uiBehavior'),
            customer = require('initdatamanagers/Customer'),
            systemInfo = require('modules/systeminfo'),
            initConfiguration = require('configuration/initconfiguration');

        var AmlViewModel = general.extendClass(KoComponentViewModel, function AmlClass() {
            var self = this,
                parent = this.parent,
                data = this.Data,
                NOT_PEP_DEFAULT_VALUE = "p3";

            data.pepAnswersDisplay = self.createComputed(function () {
                return data.pepAnsweredValue() !== NOT_PEP_DEFAULT_VALUE;
            });

            //----------------------------------------------------------------
            var init = function () {
                parent.init.call(self);
                setObservables();
                getPepStatus();
                updateIdentificationOptions();
            };
            //----------------------------------------------------------------

            var setObservables = function () {
                data.pepAnsweredValue = ko.observable(NOT_PEP_DEFAULT_VALUE);
                data.isPepRequiredCsmLess = ko.observable(false);
                data.hasUploadDocs = ko.observable(true);
                data.hasVideoIdentification = ko.observable(false);
                data.hasAlternativeDocSend = ko.observable(true);
            };

            //----------------------------------------------------------------
            var updateIdentificationOptions = function () {
                var countries = systemInfo.get('countries'),
                    countryIds = Object.keys(countries),
                    countriesWithDisabledUpload = initConfiguration.AmlConfiguration.countriesWithDisabledUpload,
                    countriesWithVideoId = initConfiguration.AmlConfiguration.countriesWithVideoId,
                    countriesWithDisabledAlternativeSend = initConfiguration.AmlConfiguration.countriesWithDisabledAlternativeSend,
                    enabledUploads = [],
                    enabledVideoId = [],
                    enabledAlternativeSend = [],
                    itemInList = function (list, item) {
                        return list.indexOf(item) !== -1;
                    },
                    itemNotInList = function (list, item) {
                        return list.indexOf(item) === -1;
                    };

                countryIds.forEach(function (countryId) {
                    var country = countries[countryId];

                    if (itemNotInList(countriesWithDisabledUpload, country)) {
                        enabledUploads.push(countryId);
                    }

                    if (itemInList(countriesWithVideoId, country)) {
                        enabledVideoId.push(countryId);
                    }

                    if (itemNotInList(countriesWithDisabledAlternativeSend, country)) {
                        enabledAlternativeSend.push(countryId);
                    }
                });

                data.hasUploadDocs(itemInList(enabledUploads, customer.prop.countryID));
                data.hasVideoIdentification(itemInList(enabledVideoId, customer.prop.countryID));
                data.hasAlternativeDocSend(itemInList(enabledAlternativeSend, customer.prop.countryID));
            };

            //-------------------------------------------------------
            var getPepStatus = function () {
                dalCompliance.getPepStatus(function (result) {
                    result = JSONHelper.STR2JSON("AmlStatusViewModel/getPepStatus", result, eErrorSeverity.medium);
                    if (result.Status == eResult.Success) {
                        data.isPepRequiredCsmLess(result.Result == ePEPStatus.Required);
                    }
                });
            };

            //-------------------------------------------------------
            var setPepStatus = function () {
                dalCompliance.setPepStatus(data.pepAnsweredValue(), function (result) {
                    if (result == eResult.Success) {
                        formBehavior.closeAmlPepForm();
                    }
                });
            };

            var goToUploadDocuments = function () {
                ViewModelsManager.VManager.RedirectToForm(eForms.UploadDocuments);
                if (DialogViewModel)
                    DialogViewModel.close();
            };

            init();


            return {
                Init: init,
                SetPepStatus: setPepStatus,
                isPepRequiredCsmLess: data.isPepRequiredCsmLess,
                pepAnsweredValue: data.pepAnsweredValue,
                PepAnswersDisplay: data.pepAnswersDisplay,
                goToUploadDocuments: goToUploadDocuments,
                hasVideoIdentification: data.hasVideoIdentification,
                hasUploadDocs: data.hasUploadDocs,
                hasAlternativeDocSend: data.hasAlternativeDocSend
            };
        });

        return AmlViewModel;
    }
);
