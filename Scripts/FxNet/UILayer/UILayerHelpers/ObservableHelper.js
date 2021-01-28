define(
    'helpers/ObservableHelper',
    [
        "require",
        "knockout",
        'handlers/general',
        'helpers/KOExtensions'
    ],
    function(require) {
        var ko = require("knockout"),
            general = require('handlers/general');

        function ObservableHelper() {
            function generatePrimitiveTypeArray(koObj) {
                var obj = [];

                for (var key in koObj) {
                    if (koObj.hasOwnProperty(key)) {
                        if (!general.isFunctionType(koObj[key])) {
                            obj[key] = koObj[key];
                        }
                    }
                }

                return obj;
            }

            function cleanKoObservableSimpleObject(koObj, computablesDispose) {
                var clonedObject = general.cloneHardCopy(koObj);

                for (var key in clonedObject) {
                    if (clonedObject.hasOwnProperty(key)) {
                        var property = clonedObject[key];

                        if (!general.isFunctionType(property)) {
                            continue;
                        }

                        if (ko.isWriteableObservable(property)) {
                            property(getEmptyPropertyValue(property));
                        }

                        if (computablesDispose && ko.isComputed(property)) {
                            property.dispose();
                        }
                    }
                }

                return clonedObject;
            }

            function getEmptyPropertyValue(property) {
                if (ko.isObservableArray(property)) {
                    return [];
                }

                if (ko.isObservable(property)) {
                    var value = ko.unwrap(property);

                    if (general.isBooleanType(value)) {
                        return false;
                    }

                    if (general.isObjectType(value)) {
                        // if the observable contains an json object (like validation options)
                        // just return the object
                        return value;
                    }
                }

                return "";
            }

            return {
                GeneratePrimitiveTypeArray: generatePrimitiveTypeArray,
                CleanKoObservableSimpleObject: cleanKoObservableSimpleObject
            };
        }

        return new ObservableHelper();
    }
);