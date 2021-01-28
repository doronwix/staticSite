define(
    'viewmodels/BaseSearchCountryViewModel',
    [
        'require',
        'knockout',
        'handlers/general',
        'helpers/KoComponentViewModel',
        'Dictionary',
        'modules/systeminfo',
        'vendor/latinize'
    ],
    function BaseSearchCountryDef(require) {
        var ko = require('knockout'),
            general = require('handlers/general'),
            Dictionary = require('Dictionary'),
            KoComponentViewModel = require('helpers/KoComponentViewModel'),
            systemInfo = require('modules/systeminfo'),
            latinize = require('vendor/latinize');

        var BaseSearchCountryViewModel = general.extendClass(KoComponentViewModel, function BaseSearchCountryClass(params) {
            var self = this,
                parent = self.parent,
                data = parent.Data; // inherited from KoComponentViewModel

            function init() {
                if (validateParams() === false) {
                    throw new Error('Params is empty');
                }

                setObservables();
                setSubscribers();
                setCountryTranslations();
                sort();
                setSelectedCountry(getCountryId());
            }

            function setSubscribers() {
                data.selectedCountry.subscribe(function (country) {
                    setParamCountry(country);
                });
            }

            function validateParams() {
                return (params && params.countries &&
                    (!general.isEmptyValue(params.countries)) &&
                    (!general.isEmptyValue(params.countryId) ||
                        !general.isEmptyValue(params.country))
                );
            }

            function getCountryId() {
                var id = null;

                if (general.isFunctionType(params.country) && !general.isEmptyValue(params.country().id)) {
                    id = params.country().id;
                }
                else if (general.isFunctionType(params.countryId) && !general.isEmptyValue(params.countryId())) {
                    id = params.countryId();
                }

                return id;
            }

            function mapParamCountries(paramCountries) {
                var countries = [];
                var uiExclusionCountries = systemInfo.get('uiExclusionCountries') || [];

                if ((general.isArrayType(paramCountries))) {
                    countries = paramCountries.slice();
                }
                else {
                    var countryIds = Object.keys(paramCountries);

                    countryIds.forEach(function (id) {
                        countries.push({
                            id: id
                        });
                    });
                }

                return countries.filter(function (country) {
                    return !Object.keys(uiExclusionCountries).find(function (excludedCountryId) {
                        return excludedCountryId == country.id
                    });
                });
            }

            function setParamCountry(selectedCountry) {
                if (general.isFunctionType(params.country)) {
                    params.country(selectedCountry);
                }

                if (general.isFunctionType(params.countryId)) {
                    params.countryId(selectedCountry.id);
                }

                if (general.isFunctionType(params.onClick)) {
                    params.onClick();
                }
            }

            function setCountryTranslations() {
                var countriesMapped = mapParamCountries(general.isFunctionType(params.countries) ? params.countries() : params.countries);
                var countries = getCountryTranslations(countriesMapped);

                data.countries(countries);
            }

            function setSelectedCountry(countryId) {
                var countryFound = data.countries().find(function (country) {
                    return parseInt(country.id) === parseInt(countryId);
                });

                data.selectedCountry(countryFound || data.countries()[0]);
            }

            function setObservables() {
                data.countries = ko.observableArray();
                data.selectedCountry = ko.observable();
            }

            function getCountryTranslations(paramCountries) {
                var countries = [];

                if (!paramCountries) {
                    return countries;
                }

                paramCountries.forEach(function (elem) {
                    var text = Dictionary.GetItem('cntr_' + elem.id, 'country_names');
                    countries.push(Object.assign({}, elem, {
                        text: text,
                        label: text,
                        fullText: latinize(text)
                    }));
                });

                return countries;
            }

            function sort() {
                if (!data.countries) {
                    return;
                }

                data.countries.sort(function (l, r) {
                    return l.text.localeCompare(r.text);
                });
            }

            function setCountry($data) {
                data.selectedCountry($data);
            }

            return {
                Init: init,
                SetCountry: setCountry,
                Data: data
            };
        });

        return BaseSearchCountryViewModel;
    }
);
