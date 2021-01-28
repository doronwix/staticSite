define(
    "modules/KoComponentLoader",
    [
        "require",
        "knockout",
        'handlers/general',
        "Q"
    ],
    function(require) {
        var ko = require("knockout"),
            general = require('handlers/general'),
            Q = require("Q");

        function KoComponentLoader() {
            var components = {};
            var isRegistered = false;

            var exists = function(name) {
                return ko.components.isRegistered(name);
            };

            var preload = function(name) {
                return Q.Promise(function(resolve, reject) {
                    ko.components.get(name, function(component) {
                        if (component) {
                            resolve(component);
                        } else {
                            reject(new Error(String.format("'{0}' component could not be loaded.")));
                        }
                    });
                });
            };

            var register = function() {
                if (isRegistered) {
                    return;
                }

                var loader = {
                    loadComponent: function (componentName, config, callback) {
                        components[componentName] = false;

                        if (general.isArrayType(config.deps) && config.deps.length) {
                            require(config.deps, function () {
                                ko.components.defaultLoader.loadComponent(componentName, config, function() {
                                    components[componentName] = true;
                                    callback.apply(null, general.argsToArray(arguments));
                                });
                            });
                        } else {
                            ko.components.defaultLoader.loadComponent(componentName, config, function() {
                                components[componentName] = true;
                                callback.apply(null, general.argsToArray(arguments));
                            });
                        }
                    }
                };

                ko.components.loaders.unshift(loader);
            };

            var unregister = function() {
                if (isRegistered) {
                    ko.components.loaders.shift();
                }
            };

            return {
                Register: register,
                Unregister: unregister,
                Preload: preload,
                Exists: exists,
                Components: components
            };
        }

        return new KoComponentLoader();
    }
);