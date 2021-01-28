define(
    'devicealerts/Alert',
    [
        'require',
        'knockout',
        'Dictionary'
    ],
    function AlertBaseDef(require) {
        var ko = require('knockout'),
            Dictionary = require('Dictionary');

        var AlertBase = function AlertBaseClass() {
            var defaultTitle = Dictionary.GetItem('GenericAlert', 'dialogsTitles', ' '),
                visible = ko.observable(false),
                title = ko.observable(defaultTitle),
                body = ko.observable(''),
                messages = ko.observableArray([]),
                disableThisAlertByCookie = ko.observable(false),
                caller = ko.observable(''),
                buttons = ko.observableArray([]);

            return {
                alertName: 'devicealerts/Alert',
                visible: visible,
                caller: caller,
                title: title,
                setDefaultTitle: function () {
                    this.title(defaultTitle);
                },
                icon: '',
                body: body,
                messages: messages,
                properties: {},
                DisableThisAlertByCookie: disableThisAlertByCookie,
                NeedToCreateCookie: true,
                cookieName: '',
                buttons: buttons,
                buttonProperties: function (text, click, cssClass) {
                    return {
                        text: text,
                        onclick: click,
                        css_Class: cssClass
                    };
                },
                prepareForShow: function () { },
                show: function () {
                    if (this.prepareForShow) {
                        this.prepareForShow();
                    }
                    this.visible(true);
                }
            };
        };

        return AlertBase;
    }
);
