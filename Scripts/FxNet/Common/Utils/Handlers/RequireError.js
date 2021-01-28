define(
    'handlers/RequireError',
    [
        "require",
        "initdatamanagers/Customer",
        'modules/KoComponentLoader'
    ],
    function (require) {
        var Customer = require("initdatamanagers/Customer"),
            KoComponentLoader = require('modules/KoComponentLoader');

        function RequireError(message, innerError) {
            this.message = message;

            if (!Error.captureStackTrace) {
                this.stack = (new Error()).stack;
            } else {
                Error.captureStackTrace(this, this.constructor);
            }

            this.innerError = innerError;
            this.loadedUrls = Object.keys(requirejs.s.contexts._.urlFetched);
            this.pendingModules = Object.keys(requirejs.s.contexts._.registry);
            this.loadedModules = Object.keys(requirejs.s.contexts._.defined);

            var fxnetComponents = Object.keys(KoComponentLoader.Components);

            this.loadedComponents = fxnetComponents.filter(function (name) {
                return KoComponentLoader.Components[name] === true;
            });
            this.pendingComponents = fxnetComponents.filter(function (name) {
                return KoComponentLoader.Components[name] === false;
            });
        }

        RequireError.prototype = Object.create(Error.prototype);
        RequireError.prototype.constructor = RequireError;
        RequireError.prototype.getFullExceptionMessage = function () {
            var self = this;

            var messageObj = {
                Message: self.message,
                LoadedUrls: self.loadedUrls,
                PendingModules: self.pendingModules,
                //LoadedModules: self.loadedModules,
                PendingComponents: self.pendingComponents,
                //LoadedComponents: self.loadedComponents,
                StackTrace: (self.stack || '').replace(self.message, '').replace(/\n|\r\n/g, ' ').replace(/\s\s+/g, ' '),
                AccountNumber: Customer.prop.accountNumber,
                UserAgent: window.navigator.userAgent
            };

            return JSON.stringify(messageObj);
        };

        return RequireError;
    }
);
