define(
    "deviceviewmodels/PopupHeaderViewModel",
    [
        "require",
        "Dictionary",
        'handlers/general',
        'managers/historymanager',
        'managers/viewsmanager'
    ],
    function (require) {
        var Dictionary = require("Dictionary"),
            general = require('handlers/general'),
            HistoryManager = require('managers/historymanager'),
            ViewsManager = require('managers/viewsmanager');

        var PopupHeaderViewModel = function (params) {
            var currentForm = ViewsManager.ActiveFormType(),
                viewToReturn = ViewsManager.Activeform().args ? ViewsManager.Activeform().args['returnTo'] : null,
                titleParams = ViewsManager.Activeform().args ? ViewsManager.Activeform().args['titleParams'] : String.empty,
                titleText = getTitleText();

            function closeClick() {
                if (viewToReturn) {
                    ViewsManager.SwitchViewVisible(viewToReturn);
                } else {
                    HistoryManager.Back();
                }
            }

            function getTitleText() {
                var titleTxt = '';

                if (!general.isNullOrUndefined(params) && !general.isEmptyValue(params.title)) {
                    titleTxt = params.title;
                } else {
                    titleTxt = String.format(Dictionary.GetItem('view_' + currentForm + '_title', 'partialViews_vMobilePopupHeader'), titleParams);
                }

                return titleTxt;
            }

            return {
                CloseClick: closeClick,
                TitleText: titleText
            };
        }

        return {
            viewModel: PopupHeaderViewModel
        };
    }
);