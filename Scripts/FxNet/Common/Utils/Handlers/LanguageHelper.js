define(
    'handlers/languageHelper',
    [
        'require',
        'handlers/Cookie'
    ],
    function LanguageHelper(require) {
        var cookieHandler = require('handlers/Cookie');
        //eslint-disable-next-line
        var language = undefined;

        function getLanguage() {
            //eslint-disable-next-line
            if (language !== undefined) {
                return language;
            } else {
                language = cookieHandler.ReadCookie("Language");
                return language;
            }
        }

        function isRtlLanguage() {
            return ['hebrew', 'arabic'].indexOf(getLanguage().toLowerCase()) !== -1;
        }

        function getDirection() {
            return isRtlLanguage() ? 'rtl' : 'ltr';
        }

        window.LanguageHelper = {
            GetDirection: getDirection,
            GetLanguage: getLanguage,
            IsRtlLanguage: isRtlLanguage
        }

        return window.LanguageHelper;
    }
);