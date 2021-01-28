define(
    'modules/ThemeSettings',
    [
        'require',
        'handlers/Cookie',
        'handlers/general',
    ],
    function (require) {
        var CookieHandler = require('handlers/Cookie'),
            general = require('handlers/general'),
            ThemeCookieName = 'Theme';

        var ThemeSettings = function () {
            var Themes = {
                light: 'light',
                dark: 'dark' 
            };
 
            function getTheme() {
                var ThemeCookie =  CookieHandler.ReadCookie(ThemeCookieName);
                if (ThemeCookie){
                    return ThemeCookie.split("|")[0];
                }
                else{
                    return Themes.light;
                }
            }
            
            function updateTheme(newTheme, callBack) {
                updateThemeResources(newTheme);
                CookieHandler.CreateCookie(ThemeCookieName, newTheme + '|false', (new Date()).AddMonths(6));

                if (callBack && general.isFunctionType(callBack)) {
                    callBack();
                }
            }

            function updateThemeResources(newTheme) {
                var currentTheme = getTheme(),
                    allLinks = document.getElementsByTagName('link');

                if (general.isNullOrUndefined(Themes[newTheme])) {
                    return;
                }

                if (allLinks.length) {
                    for (var i = 0; i < allLinks.length; i++) {
                        var matchString = currentTheme + '.css',
                            replaceString = newTheme + '.css',
                            node = allLinks[i],
                            href = node.getAttribute('href');

                        if (href.indexOf(matchString) != -1 ) {
                            node.href = href.replace(matchString, replaceString);
                        }
                    }
                }
            }

            return {
                Themes: Themes,
                GetTheme: getTheme,
                UpdateTheme: updateTheme
            };
        };

        return ThemeSettings();
    }
);
