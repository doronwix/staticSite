define(
    'devicemanagers/StatesManager',
    [
        'require',
        'knockout',
        'handlers/general',
        'initdatamanagers/Customer',
        'handlers/HashTable',
        'helpers/ObservableHashTable',
        'Dictionary'
    ],
    function StatesManagerDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Customer = require('initdatamanagers/Customer'),
            Dictionary = require('Dictionary'),
            observableHashTable = require('helpers/ObservableHashTable');

        function StatesManager() {
            var stateNamesPriorities = {  // the state names and priorities, the state contianer will initilize by this priority
                    SystemMode: 1,
                    DemoStatus: 2,
                    IsActive: 3,
                    AmlStatus: 4,
                    KycStatus: 5,
                    MarketState: 6,
                    EquityAlert: 7,
                    ExposureAlert: 8,
                    ExposureCoverageAlert: 9,
                    ServerErrorStatus: 10,
                    PepStatus: 11,
                    CddStatus: 12,
                    Forbidden: 13,
                    KycReviewStatus: 14
                },
                states = {},
                statesContainer = new observableHashTable(ko, general, 'StateType', { enabled: true, sortProperty: 'Priority', asc: true });

            function TState(type, value, priority) {
                this.StateType = type;
                this.Value = ko.observable(value);
                this.Priority = priority;
            }

            function pushState(type, value, priority) {
                var state = new TState(type, value, priority);

                if (!statesContainer.Add(state)) {
                    statesContainer.UpdateAlways(type, state);
                }
            }

            function getStateValue(type) {
                var state = statesContainer.Get(type);

                if (state) {
                    return state.Value;
                }

                return null;
            }

            function init() {
                initStateValues();
                initStatesObject();
            }

            function initStateValues() {
                //need to initilize by the order of priorities
                pushState(stateNamesPriorities.IsActive, eFlagState.Active, stateNamesPriorities.IsActive);
                pushState(stateNamesPriorities.PepStatus, eFlagState.Active, stateNamesPriorities.PepStatus);
                pushState(stateNamesPriorities.DemoStatus, eFlagState.NotActive, stateNamesPriorities.DemoStatus);
                pushState(stateNamesPriorities.ServerErrorStatus, eFlagState.Initial, stateNamesPriorities.ServerErrorStatus);
                pushState(stateNamesPriorities.CddStatus, eFlagState.Initial, stateNamesPriorities.CddStatus);
                pushState(stateNamesPriorities.KycStatus, eFlagState.Initial, stateNamesPriorities.KycStatus);
                pushState(stateNamesPriorities.AmlStatus, eFlagState.Initial, stateNamesPriorities.AmlStatus);
                pushState(stateNamesPriorities.KycReviewStatus, eFlagState.Initial, stateNamesPriorities.KycReviewStatus);
            }

            function initStatesObject() {
                states.IsActive = getStateValue(stateNamesPriorities.IsActive);
                states.AmlStatus = getStateValue(stateNamesPriorities.AmlStatus);

                states.DemoStatus = getStateValue(stateNamesPriorities.DemoStatus);
                states.KycStatus = getStateValue(stateNamesPriorities.KycStatus);

                states.PepStatus = getStateValue(stateNamesPriorities.PepStatus);
                states.CddStatus = getStateValue(stateNamesPriorities.CddStatus);

                states.KycReviewStatus = getStateValue(stateNamesPriorities.KycReviewStatus);

                states.IsDemo = ko.computed(function () {
                    return this.DemoStatus() === eFlagState.Active;
                }, states);

                states.IsPortfolioInactive = ko.computed(function () {
                    return this.IsActive() === false;
                }, states);

                states.IsAmlRestricted = ko.computed(function () {
                    var res = this.AmlStatus();
                    return res === eAMLStatus.Restricted || res === eAMLStatus.Unverified;
                }, states);

                states.IsAmlPending = ko.computed(function () {
                    var res = this.AmlStatus();
                    return res === eAMLStatus.Pending;
                }, states);

                states.IsKycStatusRequired = ko.computed(function () {
                    var res = this.KycStatus();
                    return res === eKYCStatus.NotComplete;
                }, states);

                states.IsKycReviewStatusRequired = ko.computed(function () {
                    return (this.KycStatus() === eKYCStatus.Failed) && (this.KycReviewStatus() === eKYCReviewStatus.NotReviewed || this.KycReviewStatus() === eKYCReviewStatus.Review || this.KycReviewStatus() === eKYCReviewStatus.Tested);
                }, states);

                states.IsCddStatusNotComplete = ko.computed(function () {
                    var res = this.CddStatus();
                    return res === eCDDStatus.NotComplete;
                }, states);

                states.IsCddStatusRequired = ko.computed(function () {
                    var res = this.CddStatus();
                    return res === eCDDStatus.NotComplete || res === eCDDStatus.Complete;
                }, states);

                states.IsPepRequired = ko.computed(function () {
                    return this.PepStatus() == ePEPStatus.Required;
                }, states);

                states.IsTradingBonusGoingToCDDAfterDeposit = ko.computed(function () {
                    var res = this.CddStatus();
                    return (Dictionary.GetItem('TradingBonusGoesToCDDAfterDeposit', 'application_configuration', '0') === '1' && Customer.prop.customerType === eCustomerType.TradingBonus && res === eCDDStatus.NotRequired);
                }, states);

                states.ServerErrorStatus = getStateValue(stateNamesPriorities.ServerErrorStatus).extend({ notify: 'always' });
            }

            function initFromCustomer(customerCompliance) {
                pushState(stateNamesPriorities.PepStatus, customerCompliance.PepStatus, stateNamesPriorities['PepStatus']);
                pushState(stateNamesPriorities.CddStatus, customerCompliance.CddStatus, stateNamesPriorities['CddStatus']);
                pushState(stateNamesPriorities.AmlStatus, customerCompliance.AmlStatus, stateNamesPriorities['AmlStatus']);
                pushState(stateNamesPriorities.IsActive, customerCompliance.IsActive, stateNamesPriorities['IsActive']);
                pushState(stateNamesPriorities.KycStatus, customerCompliance.KycStatus, stateNamesPriorities['KycStatus']);
                pushState(stateNamesPriorities.KycReviewStatus, customerCompliance.KycReviewStatus, stateNamesPriorities['KycReviewStatus']);
            }

            function getStates() {
                return states;
            }

            return {
                Init: init,
                StateValue: getStateValue,
                States: states,
                GetStates: getStates,
                PushState: pushState,
                StatePropertiesEnum: stateNamesPriorities,
                InitFromCustomer: initFromCustomer
            };
        }

        var module = window.$statesManager = new StatesManager();

        return module;
    }
);
