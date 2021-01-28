var routeEnum = {
    Controller: 0,
    Action: 1
};

$(document).ready(function () {
    var tabMenu = new TabMenu();
    tabMenu.Init();
});

var TabMenu = function () {
    var ddlLang;
    var divLang;

    var init = function () {
        setDomReferences();
        setDomEvents();
        setContactUsUrl();
        setLanguageMenuVisibility();
    };

    var setDomReferences = function () {
        ddlLang = $("#ddlLang");
        divLang = $("#LanguageSelect"); 
    };

    var setContactUsUrl = function () {
        var languageName = $("option:selected", ddlLang).attr("name");

        $(".contact-us a").attr("href", $(".contact-us a").attr("href") + "/Lang/" + languageName);
    };

    var setDomEvents = function () {
        if (document.cookie.indexOf('Language') == -1) {
            makeLanguageCookie();
        };

        ddlLang.on('change',onLanguageChange);
    };

    var setLanguageMenuVisibility = function () {

        var subArray = RouteData.filter(function (t) { return t.Key === "DisableLanguageMenu" });

        if (subArray.length > 0 && subArray[0].Value === true) {
            divLang.hide();
        };
    }

    var onLanguageChange = function () {
        makeLanguageCookie();
        window.externalEventsCallbacks.fire('change-language');
        window.location = '/webpl3/' + RouteData[routeEnum.Controller].Value + '/' + RouteData[routeEnum.Action].Value + '/Lang/' + $("option:selected", ddlLang).attr("name") + window.location.search;
    };

    var makeLanguageCookie = function() {
        var langId = $("option:selected", ddlLang).attr("value");
        var languageName = $("option:selected", ddlLang).attr("name");

        CookieHandler.CreateCookie("LID", langId, (new Date()).AddMonths(6));
        CookieHandler.CreateCookie("Language", languageName, (new Date()).AddMonths(6));
    };

    return {
        Init: init
    };
};