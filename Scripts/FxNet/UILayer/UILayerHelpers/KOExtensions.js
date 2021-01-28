define("helpers/KOExtensions", ['knockout','handlers/general', 'vendor/knockout-postbox'], function(ko, general){
    ko.observableArray.fn.pushSorted = function(sortPropName, asc, value) {
        var array = this();
        var rawValue = ko.toJS(value[sortPropName]);
        var len = array.length;
        var i = 0;

        if (len > 0) {
            var current = ko.toJS(array[len - 1][sortPropName]);
            var comparison = general.CompareValues(current, rawValue, asc);
            if (comparison <= 0) {
                this.push(value);
                return len - 1;
            }

            do {
                current = ko.toJS(array[i][sortPropName]);
                comparison = general.CompareValues(current, rawValue, asc);
                if (comparison >= 0) {
                    this.splice(i, 0, value);
                    return i;
                }

            } while (i++ < len)
        }

        this.push(value);
        return i;
    };

    ko.isObservableArray = function(instance) {
        if (!instance)
            return false;
        return typeof instance["remove"] == "function" &&
            typeof instance["removeAll"] == "function" &&
            typeof instance["destroy"] == "function" &&
            typeof instance["destroyAll"] == "function" &&
            typeof instance["indexOf"] == "function" &&
            typeof instance["replace"] == "function";
    };

    ko.observableArray.fn.sortByProperty = function(sortPropName, asc) {
        this.sort(function(left, right) {
            var rawLeft = ko.toJS(left[sortPropName]);
            var rawRight = ko.toJS(right[sortPropName]);
            return general.CompareValues(rawLeft, rawRight, asc);
        });
    };

    ko.utils.updateShallowFrom = function(source, target, trackProperty) {
        var propertyChanged = false;

        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (prop in target) {
                    var rawValue = ko.toJS(source[prop]);
                    var needsTracking = typeof(trackProperty) != 'undefined' && prop == trackProperty;

                    if (ko.isObservable(target[prop])) {
                        if (ko.isWriteableObservable(target[prop])) {
                            if (target[prop]() != rawValue) {
                                propertyChanged = needsTracking;
                                target[prop](rawValue);
                            }
                        }
                    } else {
                        if (target[prop] != rawValue) {
                            propertyChanged = needsTracking;
                            target[prop] = rawValue;
                        }
                    }
                }
            }
        }

        return propertyChanged;
    };

    ko.utils.updateDeepFrom = function (source, target, trackProperty) {
        var propertyChanged = false;

        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (prop in target) {
                    var rawValue = ko.toJS(source[prop]);
                    var needsTracking = typeof (trackProperty) != 'undefined' && prop == trackProperty;

                    if (ko.isObservable(target[prop])) {
                        if (ko.isWriteableObservable(target[prop])) {
                            propertyChanged = needsTracking;
                            target[prop](rawValue);
                        }
                    } else {
                        propertyChanged = needsTracking;
                        target[prop] = rawValue;
                    }
                }
            }
        }

        return propertyChanged;
    };

    ko.utils.dirtyGroup = function (target, objects) {
        if (!general.isObjectType(target)) {
            target = {};
        }
        var group = [];
        $.each(objects, function () {
            group.push(this);
        });
        target.dirtyGroup = [];

        var checkdirtygroup = function () {
            ko.utils.arrayForEach(group, function (observable) {
                if (observable && observable.isDirty()) target.dirtyGroup.push(observable);
            });
        };

        //checkdirtygroup();

        target.isDirty = ko.computed(function () {
            target.dirtyGroup = [];
            checkdirtygroup();
            return target.dirtyGroup.length > 0;
        });
    };

    ko.subscribable.fn.subscribeChanged = function (callback) {
        var previousValue;

        this.subscribe(function (_previousValue) {
            previousValue = _previousValue;
        }, null, 'beforeChange');

        return this.subscribe(function (latestValue) {
            callback(latestValue, previousValue);
        });
    };

    
    ko.extenders.asyncValidation = function (target, config) {
        var cfg = ko.utils.extend({ withAsyncValidationFix: true },config);
        if (cfg.withAsyncValidationFix) {
            var normalIsValid = target.isValid;
            target.isValid = function() {
                return !target.isValidating() && normalIsValid.apply(this, arguments);
            }
        }
        target.extend({ asyncValidator: cfg.asyncFunction });
    };

    ko.extenders.initialyVisible = function(target, config) {
        if (config === true) {
            target.isVisible = ko.observable(true);
        } else {
            target.isVisible = ko.observable(false);
        }
    };

    require(['vendor/knockout.validation'],function(){
        ko.validation.registerExtenders();
    });
    
    (function(){
        var emptySubscription = { dispose: function() {} };
        var currentSubscriptions = {};

        function subscribeSingleton(topic, action, target, initializeWithLatestValue) {
            (currentSubscriptions[topic] || emptySubscription).dispose();

            var newSub = ko.postbox.subscribe(topic, action, target, initializeWithLatestValue);
            var originalDispose = newSub.dispose.bind(newSub);

            newSub.dispose = function dispose() {
                originalDispose();
                delete currentSubscriptions[topic];
            }

            currentSubscriptions[topic] = newSub;

            return newSub;
        }

        ko.postbox.subscribeSingleton = subscribeSingleton;
    }());

    ko.extenders.intersectArray = function (target, options) {
        var intersectedArray = ko.pureComputed({
            read: function() {
                var firstArray = target();
                if (!Array.isArray(firstArray) || firstArray.length <= 0) {
                    return [];
                }

                /*eslint no-eq-null: 0*/
                if (options == null || options.withArray == null) {
                    return firstArray;
                }

                var secondArray = options.withArray();
                if (!Array.isArray(secondArray) || secondArray.length <= 0) {
                    if (options.allowEmptyArray){
                        return [];
                    }
                    else {
                        return firstArray;
                    }
                }

                var prop = options.prop;
                var withProp = options.withProp;
                return ko.utils.arrayFilter(firstArray, function (firstItem) {
                    return ko.utils.arrayFirst(secondArray, function (secondItem) {
                        var firstItemCompareValue = (prop ? firstItem[prop] : firstItem).toString();
                        var secondItemCompareValue = (withProp ? secondItem[withProp] : secondItem).toString();
                        return firstItemCompareValue === secondItemCompareValue;
                    });
                });
            },
            write: function(value) {
                target(value);
            }
        }).extend({ notify: 'always' });

        return intersectedArray;
    };
    return ko
});