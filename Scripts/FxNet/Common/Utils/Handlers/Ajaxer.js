/* global UrlResolver, AjaxError, General, Q*/
function TAjaxerStatus(state, data) {
    this.State = state || eAjaxerState.None;
    this.Data = data || null;
}

function TAjaxer(rti) {
    var self = this,
        httpRequest = createXhrObject(),
        defaultMaxRetries = 0,
        defaultMaxRetriesGet = 5,
        retryInterval = rti ? rti : 1000,
        isStopRetry = false,
        retryTimer = null,
        appRelativePath = UrlResolver.getApplicationRelativePath();

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

    function prepareDeferred(onResolve, onReject, onNotify) {
        var deferred = Q.defer();

        // Normalize the handlers
        onResolve = General.isFunctionType(onResolve) ? onResolve : General.emptyFn;
        onReject = General.isFunctionType(onReject) ? onReject : General.emptyFn;
        onNotify = General.isFunctionType(onNotify) ? onNotify : General.emptyFn;

        // attach progress handler to original promise, bind it with the deferred
        deferred.promise.progress(onNotify.bind(self, deferred));

        // re-assign the promise to the deferred object, the onResolve might throw errors as well
        deferred.promise = deferred.promise.then(function (originalResponse) {
            var onResolveValue = onResolve.call(self, originalResponse);
            return onResolveValue || originalResponse;
        });

        // attach fail handler
        deferred.promise.fail(function (error) {
            onReject.call(self, error);
            throw error;
        });

        return deferred;
    }

    function onRetry(methodToRetry, defer, status) {
        status.State = status.State || eAjaxerState.None;

        if (status.State === eAjaxerState.Retry) {
            stopRetry();

            if (!General.isFunctionType(methodToRetry)) {
                return;
            }

            // Call the methodToRetry with extra parameter - the deferred object
            retryTimer = setTimeout(methodToRetry.bind(self, defer), retryInterval);
        }
    }

    function getMethod(callerInfo, url, params, onComplete, onError, tryCounter, customMaxRetries, sla, noCache, deferred) {
        noCache = General.isBooleanType(noCache) ? noCache : true;
        tryCounter = tryCounter || 1;

        var maxRetries = General.isNumber(customMaxRetries) ? Number(customMaxRetries) : defaultMaxRetriesGet,
            requestTime = Date.now(),
            onNotify;

        // If the deferred is defined, then the method is invoked from a RETRY attempt
        if (!deferred) {
            onNotify = function (defer, state) {
                tryCounter += 1;

                var methodToRetry = getMethod.bind(self,
                    state.Data.callerInfo,
                    state.Data.url,
                    null, // params already on the url query string //state.Data.params,
                    state.Data.onComplete,
                    state.Data.onError,
                    tryCounter,
                    state.Data.maxRetries,
                    state.Data.SLA,
                    null,
                    defer);

                onRetry(methodToRetry, defer, state);
            };

            deferred = prepareDeferred(onComplete, onError, onNotify);
        }

        if (!httpRequest) {
            deferred.reject(new Error("AJAXER (" +
                "description: XMLHttpRequest could not be created, " +
                "callerInfo: " + callerInfo + ", " +
                "url: " + url + ", " +
                "params: " + params + ", " +
                "request time: " + requestTime + ", " +
                "tryCounter: " + tryCounter + ", " +
                "maxRetries: " + maxRetries + ", " +
                "SLA: " + sla + "," +
                "noCahe: " + noCache + ")"
            ));
        } else {
            if (params) {
                url += (url.indexOf("?") === -1 ? "?" : "&") + params;
            }

            httpRequest.open("GET", getUrl(url, noCache), true);

            if (!UrlResolver.isCors(url)) {
                httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                httpRequest.setRequestHeader("Accept", "application/json");
            }

            httpRequest.onreadystatechange = onReadyStateChanged.bind(httpRequest, callerInfo, url, params, tryCounter, maxRetries, deferred, sla, requestTime);
            httpRequest.send();
        }

        return deferred.promise;
    }

    function postMethod(callerInfo, url, params, onComplete, onError, tryCounter, customMaxRetries, sla, deferred) {
        tryCounter = tryCounter || 1;

        var maxRetries = General.isNumber(customMaxRetries) ? Number(customMaxRetries) : defaultMaxRetries,
            requestTime = Date.now(),
            onNotify;

        // If the deferred is defined, then the method is invoked from a RETRY attempt
        if (!deferred) {
            onNotify = function (defer, state) {
                tryCounter += 1;

                var methodToRetry = postMethod.bind(self,
                    state.Data.callerInfo,
                    state.Data.url,
                    state.Data.params,
                    state.Data.onComplete,
                    state.Data.onError,
                    tryCounter,
                    state.Data.maxRetries,
                    state.Data.SLA,
                    defer);

                onRetry(methodToRetry, defer, state);
            };

            deferred = prepareDeferred(onComplete, onError, onNotify);
        }

        if (!httpRequest) {
            deferred.reject(new Error("AJAXER (" +
                "description: XMLHttpRequest could not be created, " +
                "callerInfo: " + callerInfo + ", " +
                "url: " + url + ", " +
                "params: " + params + ", " +
                "request time: " + requestTime + ", " +
                "tryCounter: " + tryCounter + ", " +
                "maxRetries: " + maxRetries + ", " +
                "SLA: " + sla + ")"
            ));
        } else if (params) {
            // here we check if the user request a security token when not authenticated(initialized)
            // to prevent a call for security token that which will return an error
            var pattern = /SecurityToken/i;
            var result = params.match(pattern);

            if (result && !$customer.isAuthenticated()) {
                deferred.reject(new Error("AJAXER (" +
                    "description: Request is not authenticated, " +
                    "callerInfo: " + callerInfo + ", " +
                    "url: " + url + ", " +
                    "params: " + params + ", " +
                    "request time: " + requestTime + ", " +
                    "tryCounter: " + tryCounter + ", " +
                    "maxRetries: " + maxRetries + ", " +
                    "SLA: " + sla + ")"
                ));
            }
        }

        if (deferred.promise.isPending()) {
            var noCache = true;

            httpRequest.open("POST", getUrl(url, noCache), true);
            httpRequest.onreadystatechange = onReadyStateChanged.bind(httpRequest, callerInfo, url, params, tryCounter, maxRetries, deferred, sla, requestTime);
            if (!UrlResolver.isCors(url)) {
                httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            }
            httpRequest.send(params);
        }

        return deferred.promise;
    }

    function jsonPostMethod(callerInfo, url, params, onComplete, onError, tryCounter, customMaxRetries, sla, deferred) {
        tryCounter = tryCounter || 1;

        var maxRetries = General.isNumber(customMaxRetries) ? Number(customMaxRetries) : defaultMaxRetries,
            requestTime = Date.now(),
            onNotify;

        // If the deferred is defined, then the method is invoked from a RETRY attempt
        if (!deferred) {
            onNotify = function (defer, state) {
                tryCounter += 1;

                var methodToRetry = jsonPostMethod.bind(self,
                    state.Data.callerInfo,
                    state.Data.url,
                    state.Data.params,
                    state.Data.onComplete,
                    state.Data.onError,
                    tryCounter,
                    state.Data.maxRetries,
                    state.Data.SLA,
                    defer);

                onRetry(methodToRetry, defer, state);
            };

            deferred = prepareDeferred(onComplete, onError, onNotify);
        }

        if (!httpRequest) {
            deferred.reject(new Error("AJAXER (" +
                "description: XMLHttpRequest could not be created, " +
                "callerInfo: " + callerInfo + ", " +
                "url: " + url + ", " +
                "params: " + params + ", " +
                "request time: " + requestTime + ", " +
                "tryCounter: " + tryCounter + ", " +
                "maxRetries: " + maxRetries + ", " +
                "SLA: " + sla + ")"
            ));
        } else {
            var noCache = true;
            httpRequest.open("POST", getUrl(url, noCache), true);
            httpRequest.onreadystatechange = onReadyStateChanged.bind(httpRequest, callerInfo, url, params, tryCounter, maxRetries, deferred, sla, requestTime, noCache);

            if (!UrlResolver.isCors(url)) {
                httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                httpRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            }

            httpRequest.send(params);
        }

        return deferred.promise;
    }

    function onReadyStateChanged(callerInfo, url, params, tryCounter, maxRetries, deferred, sla, requestTime) {
        var xhr = this,
            virtualUrl = getUrl(url),
            responseTime,
            duration;

        if (xhr.readyState == 4) {
            responseTime = Date.now();
            duration = responseTime - requestTime;
            var headers = (xhr.getAllResponseHeaders) ? xhr.getAllResponseHeaders() : '';
            switch (xhr.status) {
                case 200:
                    if (sla && requestTime && duration > sla) {
                        // SLA has been compromised
                        deferred.notify(new TAjaxerStatus(eAjaxerState.SlaCompromised, {
                            url: virtualUrl,
                            params: params,
                            "request time": requestTime,
                            "response time": responseTime,
                            duration: duration,
                            callerInfo: callerInfo,
                            tryCounter: tryCounter,
                            maxRetries: maxRetries,
                            SLA: sla
                        }));
                    }

                    if (xhr.responseText) {
                        if (xhr.responseText.indexOf("\"result\":\"ServerError\"") != -1) {
                            ErrorManager.onError(virtualUrl, "Server Error", eErrorSeverity.high);
                        } else if (xhr.responseText.indexOf("\"result\":\"SecurityError\"") != -1) {
                            ErrorManager.onError(virtualUrl, "Security Error", eErrorSeverity.high);
                        } else if (xhr.responseText.indexOf("\"result\":\"ServiceError\"") != -1) {
                            ErrorManager.onError(virtualUrl, "Service Unavailable", eErrorSeverity.low);
                        } else if (xhr.responseText.indexOf("\"status\":\"ServerError\"") != -1) {
                            deferred.reject(new AjaxError("Http500", headers, url));
                        }

                        deferred.resolve(xhr.responseText);
                    }
                    break;
                case 401: // Unauthorized
                case 403: // Forbidden
                case 420: // Version outdated
                    deferred.reject(new AjaxError(xhr.status, "http" + xhr.status, url));
                    break;
                case 417: // Double request
                    deferred.reject(new AjaxError(xhr.status, "AJAXER (" +
                        "description: Double request for resource \"" + url + "\", " +
                        "callerInfo: " + callerInfo + ", " +
                        "url: " + url + ", " +
                        "params: " + params + ", " +
                        "request time: " + requestTime + ", " +
                        "response time: " + responseTime + ", " +
                        "duration: " + duration + ", " +
                        "tryCounter: " + tryCounter + ", " +
                        "maxRetries: " + maxRetries + ", " +
                        "SLA: " + sla + ")"
                    ));
                    break;
                case 424: // Version mismatch 
                    if (!isStopRetry && tryCounter < maxRetries) {
                        // RETRY
                        deferred.notify(new TAjaxerStatus(eAjaxerState.Retry, {
                            url: virtualUrl,
                            params: params,
                            "request time": requestTime,
                            "response time": responseTime,
                            duration: duration,
                            callerInfo: callerInfo,
                            tryCounter: tryCounter,
                            maxRetries: maxRetries,
                            SLA: sla
                        }));
                    } else {
                        deferred.reject(AjaxError.fromXHR(xhr, "AJAXER (" +
                            "description: Version mismatch for resource \"" + url + "\", " +
                            "callerInfo: " + callerInfo + ", " +
                            "url: " + url + ", " +
                            "params: " + params + ", " +
                            "request time: " + requestTime + ", " +
                            "response time: " + responseTime + ", " +
                            "duration: " + duration + ", " +
                            "tryCounter: " + tryCounter + ", " +
                            "maxRetries: " + maxRetries + ", " +
                            "SLA: " + sla + ")"
                        ));
                    }
                    break;
                case 0: // Aborted request before getting the response
                    if (!isStopRetry && tryCounter < maxRetries) {
                        // RETRY
                        deferred.notify(new TAjaxerStatus(eAjaxerState.Retry, {
                            url: virtualUrl,
                            params: params,
                            "request time": requestTime,
                            "response time": responseTime,
                            duration: duration,
                            callerInfo: callerInfo,
                            tryCounter: tryCounter,
                            maxRetries: maxRetries,
                            SLA: sla
                        }));
                    } else {
                        deferred.reject(AjaxError.fromXHR(xhr, "AJAXER (" +
                            "description: Request was aborted for resource \"" + url + "\", " +
                            "callerInfo: " + callerInfo + ", " +
                            "url: " + url + ", " +
                            "params: " + params + ", " +
                            "request time: " + requestTime + ", " +
                            "response time: " + responseTime + ", " +
                            "duration: " + duration + ", " +
                            "tryCounter: " + tryCounter + ", " +
                            "maxRetries: " + maxRetries + ", " +
                            "SLA: " + sla + ")" + "response headers: " + headers
                        ));
                    }
                    break;
                default:
                    if (!isStopRetry && tryCounter < maxRetries) {
                        // RETRY
                        deferred.notify(new TAjaxerStatus(eAjaxerState.Retry, {
                            url: virtualUrl,
                            params: params,
                            "request time": requestTime,
                            "response time": responseTime,
                            duration: duration,
                            callerInfo: callerInfo,
                            tryCounter: tryCounter,
                            maxRetries: maxRetries,
                            SLA: sla
                        }));
                    } else {
                        deferred.reject(new AjaxError(xhr.status, "AJAXER (" +
                            "description: Request failed for resource \"" + url + "\", status code was " + xhr.status + ", " +
                            "callerInfo: " + callerInfo + ", " +
                            "url: " + url + ", " +
                            "params: " + params + ", " +
                            "request time: " + requestTime + ", " +
                            "response time: " + responseTime + ", " +
                            "duration: " + duration + ", " +
                            "tryCounter: " + tryCounter + ", " +
                            "maxRetries: " + maxRetries + ", " +
                            "SLA: " + sla + ")" + "response headers: " + headers
                        ));
                    }
                    break;
            }
        }
    }

    function getUrl(url, noCache) {
        var random = String.empty,
            prefix;

        
        var isdevelopermode = url.indexOf('.js') === -1 && url.indexOf('.html') === -1 && url.indexOf(port) === -1;   

        if (noCache && !isdevelopermode) {
            url = UrlResolver.getUrlWithRndKeyValue(url);
        }

        prefix = (url.startsWith(appRelativePath) || url.startsWith('http'))
            ? String.empty
            : appRelativePath;

        var port = 9005;  
        
/*         if (isdevelopermode && url.indexOf(port) === -1){
            prefix = "http://traderlocal.iforex.com:" + port + "/webpl3"
        } */
        

        return UrlResolver.combine(prefix, url, random);
    }

    function stopRetry(force) {
        isStopRetry = !!force;

        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    }

    function abort() {
        if (httpRequest) {
            stopRetry();
            httpRequest.abort();
        }
    }

    //----------------------------------------------------------------
    // When you don't need to chain, you should use these methods
    function getMethodDone() {
        var promise = getMethod.apply(self, arguments);
        promise.done();
    }

    function postMethodDone() {
        var promise = postMethod.apply(self, arguments);
        promise.done();
    }

    function jsonPostMethodDone() {
        var promise = jsonPostMethod.apply(self, arguments);
        promise.done();
    }

    //----------------------------------------------------------------

    return {
        abort: abort,
        get: getMethodDone,
        post: postMethodDone,
        jsonPost: jsonPostMethodDone,
        promises: {
            abort: abort,
            get: getMethod,
            post: postMethod,
            jsonPost: jsonPostMethod
        }
    };
}
