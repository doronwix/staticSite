define(
    'generalmanagers/locationWrapper',
    [],
    function () {
        return {
            GetRootUrl: function GetRootUrl() {
                var rootUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host);

                if (document.location.port || false) {
                    rootUrl += ':' + document.location.port;
                }

                return rootUrl;
            },
            GetAbsoluteLocation: function GetAbsoluteLocation() {
                return window.location.href;
            },
            GetQueryString: function GetQueryString() {
                return window.location.search;
            },
            SetAbsoluteLocation: function SetAbsoluteLocation(url) {
                window.location.href = url;
            }
        }
    }
);
