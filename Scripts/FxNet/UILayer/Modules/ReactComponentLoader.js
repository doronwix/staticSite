define('modules/ReactComponentLoader', ["require", "knockout", "Q", "fx-core-api/Components", "fx-core-api/KoBindings"], function (require, ko, Q, components, kobinding) {
    var isRegistered = false;

    function ReactComponentLoader(store) {
        var config = {
            template: '<div data-bind="react: reactComponent, store: store"/>',
            //storeModule: 'fxnet/Store',
            //componentsModule: "fx-core-api/Components",
            //koBindingModule: "fx-core-api/KoBindings"
        };

        var baseDependencies = [];

        function promiseRequire(moduleArray) {
            return Q.Promise(function (resolve, reject) {
                try {
                    require(moduleArray, function () {
                        // equivalent of object spread resolve(...args)
                        resolve(Array.prototype.slice.call(arguments));
                    });
                }
                catch (err) {
                    reject(err);
                }
            });
        }

        function registerHandler(bindingModule) {
            if (ko.bindingHandlers.react) {
                return;
            } else {
                ko.bindingHandlers.react = bindingModule.createBinding();
            }
        }

        // this will return Promise<Store, KoBindings, Components>
        // deps are not resolved directly - most of the time is dictionary so they get added to dictionary
        function getAllDependencies(deps) {
            return promiseRequire(
                baseDependencies.concat(deps)
            );
        }

        function loadComponent(_componentName, componentConfig, callback) {
            if (componentConfig.react) {
                if (!componentConfig.deps) {
                    componentConfig.deps = [];
                }

                getAllDependencies(componentConfig.deps)
                    // resolved deps = [store, kobindings, components]
                    .then(function (resolvedDeps) {
                        registerHandler(kobinding);
                        callback({
                            template: ko.utils.parseHtmlFragment(config.template),
                            createViewModel: function () {
                                return {
                                    reactComponent: componentConfig.react,

                                    store: store,
                                };
                            },
                        });
                    })
                    .fail(function (error) {
                        callback(null);
                    });
            }
            else {
                callback(null);
            }
        }

        return {
            loadComponent: loadComponent,
        };
    }

    var register = function (store) {

        if (isRegistered) {
            return;
        } else {
            var reactLoader = new ReactComponentLoader(store);
            ko.components.loaders.unshift(reactLoader);
            isRegistered = true;
        }
    };

    /*     var unregister = function () {
            if (isRegistered) {
                ko.components.loaders.shift(reactLoader);
            }
        } */

    return {
        Register: register,
        // Unregister: unregister
    }
});