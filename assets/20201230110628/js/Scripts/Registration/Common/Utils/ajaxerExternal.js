var AjaxerExternal = function() {
    var appRelativePath = UrlResolver.getApplicationRelativePath();
    var httpRequest = createXhrObject();

    function getUrl(url) {
        var _url = url.toLowerCase(),
            _appRelativePath = appRelativePath.toLowerCase();

        var prefix = (_url.lastIndexOf(_appRelativePath) === 0 || _url.lastIndexOf('http') === 0)
            ? String.empty
            : appRelativePath;

        return UrlResolver.combine(prefix, url);
    }

    function createXhrObject() {
        var xhr;

        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            var versions = [
                "MSXML2.XmlHttp.6.0",
                "MSXML2.XmlHttp.5.0",
                "MSXML2.XmlHttp.4.0",
                "MSXML2.XmlHttp.3.0",
                "MSXML2.XmlHttp.2.0",
                "Microsoft.XmlHttp",
                "Microsoft.XMLHTTP" // old
            ];

            for (var i = 0; i < versions.length; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                } catch (e) {
                    // empty
                }
            }
        }

        return xhr;
    }

    function post(destnation, data, successCallback, errorCallback, async) {
        var url = getUrl(destnation);
        if (typeof async !== "boolean") {
            async = true;
        }
        httpRequest.open("POST", url, async);
        httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        httpRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");

        httpRequest.onload = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                if (successCallback)
                    successCallback(httpRequest.responseText);
            } else {
                if (errorCallback)
                    errorCallback(httpRequest.status);
            }
        }
        httpRequest.send(data);
    }

    return {
        post: post
    }
}();