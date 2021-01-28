define(
    'viewmodels/questionnaire/FaqViewModel',
    [
        'require',
        'knockout',
        'Dictionary',
        'LoadDictionaryContent!Support'
    ],
    function () {
        var ko = require('knockout'),
            dictionary = require('Dictionary');

        function createViewModel(params) {
            var faqKey = ko.utils.unwrapObservable(params.faqKey);

            var allKeysFaq = dictionary.GetAllKeys(faqKey);
            var allKeysFaqSorted = allKeysFaq.sort(function (x, y) {
                var xp = Number(x.substr(0, x.indexOf('_')));
                var yp = Number(y.substr(0, y.indexOf('_')));
                return xp === yp ? 0 : xp < yp ? -1 : 1;
            });

            return {
                faqKey: faqKey,
                keys: allKeysFaqSorted,
                openEventName: params.openEventName
            };
        }

        return {
            viewModel: {
                createViewModel: createViewModel
            }
        };
    }
);
