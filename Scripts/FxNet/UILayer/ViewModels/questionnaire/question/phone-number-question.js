define(
    'viewmodels/questionnaire/question/phone-number-question',
    [
        'require',
        'knockout',
        'viewmodels/questionnaire/country-area-code-model',
        'viewmodels/questionnaire/question/search-question',
        "initdatamanagers/Customer",
        'vendor/phoneUtils'
    ],
    function (require) {
        var ko = require('knockout'),
            countryAreaCodeModelOriginal = require('viewmodels/questionnaire/country-area-code-model'),
            searchQuestion = require('viewmodels/questionnaire/question/search-question'),
            customer = require('initdatamanagers/Customer'),
            phoneUtils = require('vendor/phoneUtils');

        var createViewModel = function (params) {

            var INVALID_VALUE = null;

            var self = searchQuestion.viewModel.createViewModel(params);

            if (self._phoneNumberIsInitialized) {
                return self;
            }

            self._phoneNumberIsInitialized = true;

            self.countryId = ko.observable('');
            self.countryCodeAnswer = ko.observable('');
            self.phoneNumberAnswer = ko.observable('');

            var countryAreaCodeModel = countryAreaCodeModelOriginal.map(function (item) { return item; });

            self.optionalAnswers = ko.observableArray(countryAreaCodeModel);
            self.optionalAnswers.unshift({
                text: self.placeholder,
                id: INVALID_VALUE,
                countryCode: INVALID_VALUE,
                imageCode: "",
                value: "",
                region: ""
            });
            // override
            self.selected = ko.observable().extend({ notify: 'always' });
            self.selected.subscribe(function (item) {
                if (!item || !item.id) {
                    return;
                }

                self.optionalAnswers.shift();

                var selectedItem = self.optionalAnswers().find(function (option) {
                    return item.id === option.id;
                });

                if (selectedItem) {
                    self.displaySearch(false);
                    
                    // don't provide the text field, so it is not search able
                    self.optionalAnswers.unshift({
                        id: selectedItem.id,
                        value: selectedItem.value,
                        imageCode: selectedItem.imageCode,
                        countryCode: selectedItem.countryCode
                    });

                    self.countryId(selectedItem.id);
                    self.countryCodeAnswer(selectedItem.countryCode);
                   
                }
            });

            self.selectedText.dispose();
            self.selectedText = ko.pureComputed(function () {
                var selectedItem = self.optionalAnswers().find(function (item) {
                    return item.id === self.countryId();
                });

                if (selectedItem) {
                    return selectedItem.text || "";
                }

                return "";
            });

            self.selectedClass.dispose();
            self.selectedClass = ko.pureComputed(function () {
                var selectedItem;

                if (self.optionalAnswers) {
                    selectedItem = self.optionalAnswers().find(function (item) {
                        return item.id === self.countryId();
                    });
                }
                if (selectedItem && selectedItem.imageCode) {
                    return selectedItem.imageCode + " list-flag";
                }

                return "";
            });


            (function initAnswer() {
                var regionCode, countryCode, _item, answerInitialized = false;
                // by already existing phone number if valid by phone lib
                try {
                    var answer = self.answer().toString();
                    // Add a + sign if needed
                    if (answer.length > 0 && answer[0] !== "+") {
                        answer = "+" + answer;
                    }

                    if (answer && answer.length > 0 && phoneUtils.isPossibleNumber(answer)) {

                        regionCode = phoneUtils.getRegionCodeForNumber(answer);
                        if (!regionCode) {
                            throw new Error("Region code not found");
                        }
                        countryCode = phoneUtils.getCountryCodeForRegion(regionCode);
                        if (!countryCode) {
                            throw new Error("Country code not found");
                        }
                        self.countryCodeAnswer("+" + countryCode);
                        self.phoneNumberAnswer(answer.replace(self.countryCodeAnswer(), ""));
                        _item = countryAreaCodeModel.find(function (item) {
                            return item.region === regionCode.toLowerCase();
                        });
                        self.countryId(_item.id);
                        self.selected({ id: _item.id });
                        answerInitialized = true;
                    }
                } catch (ex) {
                    answerInitialized = false;
                }
                //by customer country
                if (!answerInitialized) {
                    var customerCountryName = systemInfo.countries[customer.prop.countryID];
                    _item = countryAreaCodeModel.find(function (item) {
                        return item.countryName === customerCountryName;
                    });
                    countryCode = phoneUtils.getCountryCodeForRegion(_item.region);
                    self.countryCodeAnswer("+" + countryCode);
                    self.countryId(_item.id);
                    self.selected({ id: _item.id });
                    
                }
            }());

            ko.computed(function () {
                self.answer(self.countryCodeAnswer() + self.phoneNumberAnswer());
            });

            return self;
        };

        return {
            viewModel: { createViewModel: createViewModel }
        };
    }
);