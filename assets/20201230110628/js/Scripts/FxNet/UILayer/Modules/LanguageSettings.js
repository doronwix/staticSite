define(
    'modules/LanguageSettings', ['handlers/Cookie',],

    function (CookieHandler) { 

        var setNewLanguage = function (langId, languageName, noReload) {
            CookieHandler.CreateCookie("LID", langId, (new Date()).AddMonths(6));
            CookieHandler.CreateCookie("Language", languageName, (new Date()).AddMonths(6));      
            if (noReload)
                return;
            window.location.reload(true);
        };

        return setNewLanguage;
    }
);
