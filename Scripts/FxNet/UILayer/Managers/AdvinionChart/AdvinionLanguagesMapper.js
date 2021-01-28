define(
    'managers/AdvinionChart/AdvinionLanguagesMapper',
    [
        'require',
        'handlers/Cookie'
    ],
    function(require) {
        var cookieHandler = require('handlers/Cookie');

        var AdvinionLanguagesMapper = function() {
            var mappingObject = {
                Arabic: 'ar',
                Hebrew: 'he',
                Italian: 'it',
                Francais: 'fr',
                Russian: 'ru',
                Portuguese: 'pt',
                Dutch: 'nl',
                Spanish: 'es',
                Turkish: 'tr',
                Japanese: 'ja',
                German: 'de',
                Polish: 'pl',
                Greek: 'el',
                Romanian: 'ro',
                English: 'en',
                Chinese: 'zh',
                Czech: 'cs',
                Hungarian: 'hu',
                Indonesian: 'id',
                Malay: 'ms',
                Thai: 'th',
                Swedish: 'en',  // 'sv'
                Filipino: 'en', // 'tl' (Tagalog)
                Hindi: 'en',    // 'hi' 
                Korean: 'en'    // 'ko'
            };

            function getChartLanguage() {
                var currentSelectedLanguage = cookieHandler.ReadCookie("Language");

                if (currentSelectedLanguage && mappingObject.hasOwnProperty(currentSelectedLanguage)) {
                    return mappingObject[currentSelectedLanguage];
                }

                return getDefaultLanguage();
            }

            function getDefaultLanguage() {
                return mappingObject.English;
            }

            return {
                getChartLanguage: getChartLanguage,
                getDefaultLanguage: getDefaultLanguage
            };
        };

        return AdvinionLanguagesMapper();
    }
);