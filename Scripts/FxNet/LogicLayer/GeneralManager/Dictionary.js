/* global General */
var Dictionary = (function Dictionary() {
    var _staticContent = {};

    function getResourceName(resourceName) {
        var _resourceName = resourceName || 'contentdata';
        return _resourceName.toLowerCase()
    }

    function getItem(key, resourceName, defaultValue) {
        resourceName = getResourceName(resourceName);

        var value = '';

        if (_staticContent.hasOwnProperty(resourceName)) {
            value = _staticContent[resourceName][key];
        }

        if (!value && !defaultValue) {
            value = String.format("***{0}", key);
            //  var warningMessage = 'Missing content for key: ' + key + ' and resource: ' + resourceName + ' on platform: ' + UrlResolver.getApplicationType();
            // Logger.warn("DictionaryContent", warningMessage, General.emptyFn, eErrorSeverity.warning);
        }

        if (!General.isNullOrUndefined(value)) {
            if (!General.isNullOrUndefined(value)) {
                return value;
            }
            else {
                if (!General.isNullOrUndefined(defaultValue)) {
                    return defaultValue;
                }
                else {
                    return value;
                }
            }
        }
        else {
            return defaultValue || "";
        }
    }

    function getAllItemsForResource(resourceName) {
        var value = null;

        if (_staticContent.hasOwnProperty(resourceName)) {
            value = _staticContent[resourceName];
        }

        return value;
    }

    function getAllKeys(resourceName) {
        var value = null;

        resourceName = getResourceName(resourceName);

        if (_staticContent.hasOwnProperty(resourceName)) {
            value = Object.keys(_staticContent[resourceName]);
        }

        return value;
    }

    function getGlobalItem(key, defaultValue) {
        return getItem(key, 'contentdata', defaultValue);
    }

    function addResource(resourceName, content) {
        resourceName = getResourceName(resourceName);
        _staticContent[resourceName] = content;
    }

    function getTemplate(key) {
        var templatesStore = getInitializedTemplatesStore();
        var value = templatesStore[key];

        if (!value) {
            value = String.format("***{0}", key);
        }

        templatesStore[key] = value;

        return value;
    }

    function getInitializedTemplatesStore() {
        if (!systemInfo.templates) {
            systemInfo.templates = {};
        }

        return systemInfo.templates;
    }

    function valueIsEmpty(key, resourceName) {
        var _resourceName = getResourceName(resourceName);

        if (!_staticContent.hasOwnProperty(_resourceName)) {
            return true;
        }

        var value = _staticContent[_resourceName][key];

        return General.isEmptyValue(value);
    }

    return {
        AddResource: addResource,
        GetItem: getItem,
        GetAllKeys: getAllKeys,
        GetAllItemsForResource: getAllItemsForResource,
        GetGlobalItem: getGlobalItem,
        GetTemplate: getTemplate,
        ValueIsEmpty: valueIsEmpty
    };
}());

define("Dictionary", function () { return Dictionary });