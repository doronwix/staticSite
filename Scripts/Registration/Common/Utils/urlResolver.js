var UrlResolver = (function () {
    var module = {
        getApplicationRelativePath: function () {
            return window.location.pathname.substring(0, window.location.pathname.indexOf("/", 1)).toLowerCase();
        },
        combine: function () {
            var input = [].slice.call(arguments, 0),
                output = input.filter(function (item) {
                    return (typeof item !== 'undefined' && item !== null && item !== '');
                }).join('/');

            output = output.replace(/:\/(?=[^\/])/g, '://'); // make sure that protocol is followed by 2 slashes
            output = output.replace(/([^:\s\%\3\A])\/+/g, '$1/'); // remove consecutive slashes
            output = output.replace(/\/(\?|&|#[^!]|$)/g, '$1'); // remove trailing slash before parameters or hash
            output = output.replace(/(\?.+)\?/g, '$1&'); // replace ? in parameters with &

            return output;
        },
        rndKey: 'rnd',
        regexRndKey: /[?|&]rnd=0.\d+/g,
        getRndKeyValue: function () {
            var random = module.rndKey + '=' + Math.random();
            return random;
        },
        getUrlWithRndKeyValue: function (url) {
            url = url.replace(module.regexRndKey, '');
            var randomPrefix = url.indexOf('?') < 0 ? '?' : '&';

            url = url + randomPrefix + module.getRndKeyValue()
            return url;
        },
        getVersion: function () {
            return (document.cookie.match(/(^|; )Version=([^;]+)/i) || "")[2] || "";
        }
    }

    window.addEventListener('load', function () {
        var forms = document.querySelectorAll('form[method=POST][data-nocache]');

        for (var i = 0; forms.length > i; i++) {
            var form = forms[i];
            form.action = module.getUrlWithRndKeyValue(form.action);
        }
    })
    return module;
}())