function getKeyByValue(object, value) {
    var unwrappedValue = ko.utils.unwrapObservable(value);

    for (var key in object) {
        if (object.hasOwnProperty(key) && object[key] === unwrappedValue) {
            return key;
        }
    }

    return null;
}

function isNullOrUndefined(value) {
    if (!isDefinedType(value)) {
        return true;
    }

    if (isNullType(value)) {
        return true;
    }

    return false;
}

function isNullType(value) {
    return value === null;
}

function isDefinedType(value) {
    return typeof value !== 'undefined';
}

function extractLoginEventData() {
    var urlParams = urlDecode(window.location.search);
    var eventData = { };

    for (var prop in urlParams) {
        if (Object.prototype.hasOwnProperty.call(urlParams, prop)) {
            if (prop === 'evt') {
                eventData.evt = urlParams[prop];
            } else if (prop === 'dcid') {
                eventData.dcid = urlParams[prop];
            }
        }
    }

    return eventData;
}

function urlDecode(urlString, overwrite) {
    if (urlString.length < 1) {
        return {};
    }

    urlString = urlString.split("#")[0];

    var obj = {},
        pairs = urlString.slice(urlString.indexOf('?') + 1).split('&'),
        decode = decodeURIComponent,
        name,
        value;

    for (var i = 0, len = pairs.length; i < len; i++) {
        var pair = pairs[i].split('=');
        name = pair[0];
        value = decode(pair[1]);
        obj[name] = overwrite || !obj[name] ? value : [].concat(obj[name]).concat(value);
    }

    return obj;
}