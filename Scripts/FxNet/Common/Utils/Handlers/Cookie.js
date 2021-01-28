var CookieHandler = {
    
    CookiesEnabled: function () {
        try {
            document.cookie = 'cookietest=1';
            var cookiesEnabled = document.cookie.indexOf('cookietest=') !== -1;
            document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            return cookiesEnabled;
        } catch (e) {
            return false;
        }
    },

    CreateCookie: function (name, value, expireDate) {
        var expires;

        if (!value)
            return;

        if (expireDate)
            expires = "; expires=" + expireDate.toGMTString();
        else
            expires = "";

        document.cookie = name + "=" + value + expires + "; path=/";
    },

    //-----------------------------------------------------------

    ReadCookie: function (name) {

        var nameEQ = name + "=";
        var ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    //-----------------------------------------------------------

    EraseCookie: function (name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    }
};
