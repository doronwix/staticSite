// Platform: ios
// 4450a4cea50616e080a82e8ede9e3d6a1fe3c3ec
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/
;(function() {
var PLATFORM_VERSION_BUILD_LABEL = '4.5.4';
// file: src/scripts/require.js

/* jshint -W079 */
/* jshint -W020 */

var require;
var define;

(function () {
    var modules = {};
    // Stack of moduleIds currently being built.
    var requireStack = [];
    // Map of module ID -> index into requireStack of modules currently being built.
    var inProgressModules = {};
    var SEPARATOR = '.';

    function build (module) {
        var factory = module.factory;
        var localRequire = function (id) {
            var resultantId = id;
            // Its a relative path, so lop off the last portion and add the id (minus "./")
            if (id.charAt(0) === '.') {
                resultantId = module.id.slice(0, module.id.lastIndexOf(SEPARATOR)) + SEPARATOR + id.slice(2);
            }
            return require(resultantId);
        };
        module.exports = {};
        delete module.factory;
        factory(localRequire, module.exports, module);
        return module.exports;
    }

    require = function (id) {
        if (!modules[id]) {
            throw 'module ' + id + ' not found';
        } else if (id in inProgressModules) {
            var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
            throw 'Cycle in require graph: ' + cycle;
        }
        if (modules[id].factory) {
            try {
                inProgressModules[id] = requireStack.length;
                requireStack.push(id);
                return build(modules[id]);
            } finally {
                delete inProgressModules[id];
                requireStack.pop();
            }
        }
        return modules[id].exports;
    };

    define = function (id, factory) {
        if (modules[id]) {
            throw 'module ' + id + ' already defined';
        }

        modules[id] = {
            id: id,
            factory: factory
        };
    };

    define.remove = function (id) {
        delete modules[id];
    };

    define.moduleMap = modules;
})();

// Export for use in node
if (typeof module === 'object' && typeof require === 'function') {
    module.exports.require = require;
    module.exports.define = define;
}

// file: src/cordova.js
define("cordova", function(require, exports, module) {

// Workaround for Windows 10 in hosted environment case
// http://www.w3.org/html/wg/drafts/html/master/browsers.html#named-access-on-the-window-object
if (window.cordova && !(window.cordova instanceof HTMLElement)) { // eslint-disable-line no-undef
    throw new Error('cordova already defined');
}

var channel = require('cordova/channel');
var platform = require('cordova/platform');

/**
 * Intercept calls to addEventListener + removeEventListener and handle deviceready,
 * resume, and pause events.
 */
var m_document_addEventListener = document.addEventListener;
var m_document_removeEventListener = document.removeEventListener;
var m_window_addEventListener = window.addEventListener;
var m_window_removeEventListener = window.removeEventListener;

/**
 * Houses custom event handlers to intercept on document + window event listeners.
 */
var documentEventHandlers = {};
var windowEventHandlers = {};

document.addEventListener = function (evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof documentEventHandlers[e] !== 'undefined') {
        documentEventHandlers[e].subscribe(handler);
    } else {
        m_document_addEventListener.call(document, evt, handler, capture);
    }
};

window.addEventListener = function (evt, handler, capture) {
    var e = evt.toLowerCase();
    if (typeof windowEventHandlers[e] !== 'undefined') {
        windowEventHandlers[e].subscribe(handler);
    } else {
        m_window_addEventListener.call(window, evt, handler, capture);
    }
};

document.removeEventListener = function (evt, handler, capture) {
    var e = evt.toLowerCase();
    // If unsubscribing from an event that is handled by a plugin
    if (typeof documentEventHandlers[e] !== 'undefined') {
        documentEventHandlers[e].unsubscribe(handler);
    } else {
        m_document_removeEventListener.call(document, evt, handler, capture);
    }
};

window.removeEventListener = function (evt, handler, capture) {
    var e = evt.toLowerCase();
    // If unsubscribing from an event that is handled by a plugin
    if (typeof windowEventHandlers[e] !== 'undefined') {
        windowEventHandlers[e].unsubscribe(handler);
    } else {
        m_window_removeEventListener.call(window, evt, handler, capture);
    }
};

function createEvent (type, data) {
    var event = document.createEvent('Events');
    event.initEvent(type, false, false);
    if (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                event[i] = data[i];
            }
        }
    }
    return event;
}

/* eslint-disable no-undef */
var cordova = {
    define: define,
    require: require,
    version: PLATFORM_VERSION_BUILD_LABEL,
    platformVersion: PLATFORM_VERSION_BUILD_LABEL,
    platformId: platform.id,

    /* eslint-enable no-undef */

    /**
     * Methods to add/remove your own addEventListener hijacking on document + window.
     */
    addWindowEventHandler: function (event) {
        return (windowEventHandlers[event] = channel.create(event));
    },
    addStickyDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.createSticky(event));
    },
    addDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.create(event));
    },
    removeWindowEventHandler: function (event) {
        delete windowEventHandlers[event];
    },
    removeDocumentEventHandler: function (event) {
        delete documentEventHandlers[event];
    },
    /**
     * Retrieve original event handlers that were replaced by Cordova
     *
     * @return object
     */
    getOriginalHandlers: function () {
        return {'document': {'addEventListener': m_document_addEventListener, 'removeEventListener': m_document_removeEventListener},
            'window': {'addEventListener': m_window_addEventListener, 'removeEventListener': m_window_removeEventListener}};
    },
    /**
     * Method to fire event from native code
     * bNoDetach is required for events which cause an exception which needs to be caught in native code
     */
    fireDocumentEvent: function (type, data, bNoDetach) {
        var evt = createEvent(type, data);
        if (typeof documentEventHandlers[type] !== 'undefined') {
            if (bNoDetach) {
                documentEventHandlers[type].fire(evt);
            } else {
                setTimeout(function () {
                    // Fire deviceready on listeners that were registered before cordova.js was loaded.
                    if (type === 'deviceready') {
                        document.dispatchEvent(evt);
                    }
                    documentEventHandlers[type].fire(evt);
                }, 0);
            }
        } else {
            document.dispatchEvent(evt);
        }
    },
    fireWindowEvent: function (type, data) {
        var evt = createEvent(type, data);
        if (typeof windowEventHandlers[type] !== 'undefined') {
            setTimeout(function () {
                windowEventHandlers[type].fire(evt);
            }, 0);
        } else {
            window.dispatchEvent(evt);
        }
    },

    /**
     * Plugin callback mechanism.
     */
    // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
    // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
    callbackId: Math.floor(Math.random() * 2000000000),
    callbacks: {},
    callbackStatus: {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
    },

    /**
     * Called by native code when returning successful result from an action.
     */
    callbackSuccess: function (callbackId, args) {
        cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
    },

    /**
     * Called by native code when returning error result from an action.
     */
    callbackError: function (callbackId, args) {
        // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
        // Derive success from status.
        cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
    },

    /**
     * Called by native code when returning the result from an action.
     */
    callbackFromNative: function (callbackId, isSuccess, status, args, keepCallback) {
        try {
            var callback = cordova.callbacks[callbackId];
            if (callback) {
                if (isSuccess && status === cordova.callbackStatus.OK) {
                    callback.success && callback.success.apply(null, args);
                } else if (!isSuccess) {
                    callback.fail && callback.fail.apply(null, args);
                }
                /*
                else
                    Note, this case is intentionally not caught.
                    this can happen if isSuccess is true, but callbackStatus is NO_RESULT
                    which is used to remove a callback from the list without calling the callbacks
                    typically keepCallback is false in this case
                */
                // Clear callback if not expecting any more results
                if (!keepCallback) {
                    delete cordova.callbacks[callbackId];
                }
            }
        } catch (err) {
            var msg = 'Error in ' + (isSuccess ? 'Success' : 'Error') + ' callbackId: ' + callbackId + ' : ' + err;
            console && console.log && console.log(msg);
            cordova.fireWindowEvent('cordovacallbackerror', { 'message': msg });
            throw err;
        }
    },
    addConstructor: function (func) {
        channel.onCordovaReady.subscribe(function () {
            try {
                func();
            } catch (e) {
                console.log('Failed to run constructor: ' + e);
            }
        });
    }
};

module.exports = cordova;

});

// file: src/common/argscheck.js
define("cordova/argscheck", function(require, exports, module) {

var utils = require('cordova/utils');

var moduleExports = module.exports;

var typeMap = {
    'A': 'Array',
    'D': 'Date',
    'N': 'Number',
    'S': 'String',
    'F': 'Function',
    'O': 'Object'
};

function extractParamName (callee, argIndex) {
    return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
}

function checkArgs (spec, functionName, args, opt_callee) {
    if (!moduleExports.enableChecks) {
        return;
    }
    var errMsg = null;
    var typeName;
    for (var i = 0; i < spec.length; ++i) {
        var c = spec.charAt(i);
        var cUpper = c.toUpperCase();
        var arg = args[i];
        // Asterix means allow anything.
        if (c === '*') {
            continue;
        }
        typeName = utils.typeName(arg);
        if ((arg === null || arg === undefined) && c === cUpper) {
            continue;
        }
        if (typeName !== typeMap[cUpper]) {
            errMsg = 'Expected ' + typeMap[cUpper];
            break;
        }
    }
    if (errMsg) {
        errMsg += ', but got ' + typeName + '.';
        errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
        // Don't log when running unit tests.
        if (typeof jasmine === 'undefined') {
            console.error(errMsg);
        }
        throw TypeError(errMsg);
    }
}

function getValue (value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

moduleExports.checkArgs = checkArgs;
moduleExports.getValue = getValue;
moduleExports.enableChecks = true;

});

// file: src/common/base64.js
define("cordova/base64", function(require, exports, module) {

var base64 = exports;

base64.fromArrayBuffer = function (arrayBuffer) {
    var array = new Uint8Array(arrayBuffer);
    return uint8ToBase64(array);
};

base64.toArrayBuffer = function (str) {
    var decodedStr = typeof atob !== 'undefined' ? atob(str) : Buffer.from(str, 'base64').toString('binary'); // eslint-disable-line no-undef
    var arrayBuffer = new ArrayBuffer(decodedStr.length);
    var array = new Uint8Array(arrayBuffer);
    for (var i = 0, len = decodedStr.length; i < len; i++) {
        array[i] = decodedStr.charCodeAt(i);
    }
    return arrayBuffer;
};

// ------------------------------------------------------------------------------

/* This code is based on the performance tests at http://jsperf.com/b64tests
 * This 12-bit-at-a-time algorithm was the best performing version on all
 * platforms tested.
 */

var b64_6bit = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var b64_12bit;

var b64_12bitTable = function () {
    b64_12bit = [];
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            b64_12bit[i * 64 + j] = b64_6bit[i] + b64_6bit[j];
        }
    }
    b64_12bitTable = function () { return b64_12bit; };
    return b64_12bit;
};

function uint8ToBase64 (rawData) {
    var numBytes = rawData.byteLength;
    var output = '';
    var segment;
    var table = b64_12bitTable();
    for (var i = 0; i < numBytes - 2; i += 3) {
        segment = (rawData[i] << 16) + (rawData[i + 1] << 8) + rawData[i + 2];
        output += table[segment >> 12];
        output += table[segment & 0xfff];
    }
    if (numBytes - i === 2) {
        segment = (rawData[i] << 16) + (rawData[i + 1] << 8);
        output += table[segment >> 12];
        output += b64_6bit[(segment & 0xfff) >> 6];
        output += '=';
    } else if (numBytes - i === 1) {
        segment = (rawData[i] << 16);
        output += table[segment >> 12];
        output += '==';
    }
    return output;
}

});

// file: src/common/builder.js
define("cordova/builder", function(require, exports, module) {

var utils = require('cordova/utils');

function each (objects, func, context) {
    for (var prop in objects) {
        if (objects.hasOwnProperty(prop)) {
            func.apply(context, [objects[prop], prop]);
        }
    }
}

function clobber (obj, key, value) {
    exports.replaceHookForTesting(obj, key);
    var needsProperty = false;
    try {
        obj[key] = value;
    } catch (e) {
        needsProperty = true;
    }
    // Getters can only be overridden by getters.
    if (needsProperty || obj[key] !== value) {
        utils.defineGetter(obj, key, function () {
            return value;
        });
    }
}

function assignOrWrapInDeprecateGetter (obj, key, value, message) {
    if (message) {
        utils.defineGetter(obj, key, function () {
            console.log(message);
            delete obj[key];
            clobber(obj, key, value);
            return value;
        });
    } else {
        clobber(obj, key, value);
    }
}

function include (parent, objects, clobber, merge) {
    each(objects, function (obj, key) {
        try {
            var result = obj.path ? require(obj.path) : {};

            if (clobber) {
                // Clobber if it doesn't exist.
                if (typeof parent[key] === 'undefined') {
                    assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                } else if (typeof obj.path !== 'undefined') {
                    // If merging, merge properties onto parent, otherwise, clobber.
                    if (merge) {
                        recursiveMerge(parent[key], result);
                    } else {
                        assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                    }
                }
                result = parent[key];
            } else {
                // Overwrite if not currently defined.
                if (typeof parent[key] === 'undefined') {
                    assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
                } else {
                    // Set result to what already exists, so we can build children into it if they exist.
                    result = parent[key];
                }
            }

            if (obj.children) {
                include(result, obj.children, clobber, merge);
            }
        } catch (e) {
            utils.alert('Exception building Cordova JS globals: ' + e + ' for key "' + key + '"');
        }
    });
}

/**
 * Merge properties from one object onto another recursively.  Properties from
 * the src object will overwrite existing target property.
 *
 * @param target Object to merge properties into.
 * @param src Object to merge properties from.
 */
function recursiveMerge (target, src) {
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            if (target.prototype && target.prototype.constructor === target) {
                // If the target object is a constructor override off prototype.
                clobber(target.prototype, prop, src[prop]);
            } else {
                if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
                    recursiveMerge(target[prop], src[prop]);
                } else {
                    clobber(target, prop, src[prop]);
                }
            }
        }
    }
}

exports.buildIntoButDoNotClobber = function (objects, target) {
    include(target, objects, false, false);
};
exports.buildIntoAndClobber = function (objects, target) {
    include(target, objects, true, false);
};
exports.buildIntoAndMerge = function (objects, target) {
    include(target, objects, true, true);
};
exports.recursiveMerge = recursiveMerge;
exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;
exports.replaceHookForTesting = function () {};

});

// file: src/common/channel.js
define("cordova/channel", function(require, exports, module) {

var utils = require('cordova/utils');
var nextGuid = 1;

/**
 * Custom pub-sub "channel" that can have functions subscribed to it
 * This object is used to define and control firing of events for
 * cordova initialization, as well as for custom events thereafter.
 *
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
 * onNativeReady*              Internal event that indicates the Cordova native side is ready.
 * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
 * onDeviceReady*              User event fired to indicate that Cordova is ready
 * onResume                    User event fired to indicate a start/resume lifecycle event
 * onPause                     User event fired to indicate a pause lifecycle event
 *
 * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
 * All listeners that subscribe after the event is fired will be executed right away.
 *
 * The only Cordova events that user code should register for are:
 *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
 *      pause                 App has moved to background
 *      resume                App has returned to foreground
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 *
 * The DOM lifecycle events should be used for saving and restoring state
 *      window.onload
 *      window.onunload
 *
 */

/**
 * Channel
 * @constructor
 * @param type  String the channel name
 */
var Channel = function (type, sticky) {
    this.type = type;
    // Map of guid -> function.
    this.handlers = {};
    // 0 = Non-sticky, 1 = Sticky non-fired, 2 = Sticky fired.
    this.state = sticky ? 1 : 0;
    // Used in sticky mode to remember args passed to fire().
    this.fireArgs = null;
    // Used by onHasSubscribersChange to know if there are any listeners.
    this.numHandlers = 0;
    // Function that is called when the first listener is subscribed, or when
    // the last listener is unsubscribed.
    this.onHasSubscribersChange = null;
};
var channel = {
    /**
     * Calls the provided function only after all of the channels specified
     * have been fired. All channels must be sticky channels.
     */
    join: function (h, c) {
        var len = c.length;
        var i = len;
        var f = function () {
            if (!(--i)) h();
        };
        for (var j = 0; j < len; j++) {
            if (c[j].state === 0) {
                throw Error('Can only use join with sticky channels.');
            }
            c[j].subscribe(f);
        }
        if (!len) h();
    },
    /* eslint-disable no-return-assign */
    create: function (type) {
        return channel[type] = new Channel(type, false);
    },
    createSticky: function (type) {
        return channel[type] = new Channel(type, true);
    },
    /* eslint-enable no-return-assign */
    /**
     * cordova Channels that must fire before "deviceready" is fired.
     */
    deviceReadyChannelsArray: [],
    deviceReadyChannelsMap: {},

    /**
     * Indicate that a feature needs to be initialized before it is ready to be used.
     * This holds up Cordova's "deviceready" event until the feature has been initialized
     * and Cordova.initComplete(feature) is called.
     *
     * @param feature {String}     The unique feature name
     */
    waitForInitialization: function (feature) {
        if (feature) {
            var c = channel[feature] || this.createSticky(feature);
            this.deviceReadyChannelsMap[feature] = c;
            this.deviceReadyChannelsArray.push(c);
        }
    },

    /**
     * Indicate that initialization code has completed and the feature is ready to be used.
     *
     * @param feature {String}     The unique feature name
     */
    initializationComplete: function (feature) {
        var c = this.deviceReadyChannelsMap[feature];
        if (c) {
            c.fire();
        }
    }
};

function checkSubscriptionArgument (argument) {
    if (typeof argument !== 'function' && typeof argument.handleEvent !== 'function') {
        throw new Error(
            'Must provide a function or an EventListener object ' +
                'implementing the handleEvent interface.'
        );
    }
}

/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
Channel.prototype.subscribe = function (eventListenerOrFunction, eventListener) {
    checkSubscriptionArgument(eventListenerOrFunction);
    var handleEvent, guid;

    if (eventListenerOrFunction && typeof eventListenerOrFunction === 'object') {
        // Received an EventListener object implementing the handleEvent interface
        handleEvent = eventListenerOrFunction.handleEvent;
        eventListener = eventListenerOrFunction;
    } else {
        // Received a function to handle event
        handleEvent = eventListenerOrFunction;
    }

    if (this.state === 2) {
        handleEvent.apply(eventListener || this, this.fireArgs);
        return;
    }

    guid = eventListenerOrFunction.observer_guid;
    if (typeof eventListener === 'object') {
        handleEvent = utils.close(eventListener, handleEvent);
    }

    if (!guid) {
        // First time any channel has seen this subscriber
        guid = '' + nextGuid++;
    }
    handleEvent.observer_guid = guid;
    eventListenerOrFunction.observer_guid = guid;

    // Don't add the same handler more than once.
    if (!this.handlers[guid]) {
        this.handlers[guid] = handleEvent;
        this.numHandlers++;
        if (this.numHandlers === 1) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

/**
 * Unsubscribes the function with the given guid from the channel.
 */
Channel.prototype.unsubscribe = function (eventListenerOrFunction) {
    checkSubscriptionArgument(eventListenerOrFunction);
    var handleEvent, guid, handler;

    if (eventListenerOrFunction && typeof eventListenerOrFunction === 'object') {
        // Received an EventListener object implementing the handleEvent interface
        handleEvent = eventListenerOrFunction.handleEvent;
    } else {
        // Received a function to handle event
        handleEvent = eventListenerOrFunction;
    }

    guid = handleEvent.observer_guid;
    handler = this.handlers[guid];
    if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0) {
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

/**
 * Calls all functions subscribed to this channel.
 */
Channel.prototype.fire = function (e) {
    var fail = false; // eslint-disable-line no-unused-vars
    var fireArgs = Array.prototype.slice.call(arguments);
    // Apply stickiness.
    if (this.state === 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
    }
    if (this.numHandlers) {
        // Copy the values first so that it is safe to modify it from within
        // callbacks.
        var toCall = [];
        for (var item in this.handlers) {
            toCall.push(this.handlers[item]);
        }
        for (var i = 0; i < toCall.length; ++i) {
            toCall[i].apply(this, fireArgs);
        }
        if (this.state === 2 && this.numHandlers) {
            this.numHandlers = 0;
            this.handlers = {};
            this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
    }
};

// defining them here so they are ready super fast!
// DOM event that is received when the web page is loaded and parsed.
channel.createSticky('onDOMContentLoaded');

// Event to indicate the Cordova native side is ready.
channel.createSticky('onNativeReady');

// Event to indicate that all Cordova JavaScript objects have been created
// and it's time to run plugin constructors.
channel.createSticky('onCordovaReady');

// Event to indicate that all automatically loaded JS plugins are loaded and ready.
// FIXME remove this
channel.createSticky('onPluginsReady');

// Event to indicate that Cordova is ready
channel.createSticky('onDeviceReady');

// Event to indicate a resume lifecycle event
channel.create('onResume');

// Event to indicate a pause lifecycle event
channel.create('onPause');

// Channels that must fire before "deviceready" is fired.
channel.waitForInitialization('onCordovaReady');
channel.waitForInitialization('onDOMContentLoaded');

module.exports = channel;

});

// file: /Users/spindori/Documents/Cordova/cordova-ios/cordova-js-src/exec.js
define("cordova/exec", function(require, exports, module) {

/*global require, module, atob, document */

/**
 * Creates a gap bridge iframe used to notify the native code about queued
 * commands.
 */
var cordova = require('cordova'),
    utils = require('cordova/utils'),
    base64 = require('cordova/base64'),
    execIframe,
    commandQueue = [], // Contains pending JS->Native messages.
    isInContextOfEvalJs = 0,
    failSafeTimerId = 0;

function massageArgsJsToNative(args) {
    if (!args || utils.typeName(args) != 'Array') {
        return args;
    }
    var ret = [];
    args.forEach(function(arg, i) {
        if (utils.typeName(arg) == 'ArrayBuffer') {
            ret.push({
                'CDVType': 'ArrayBuffer',
                'data': base64.fromArrayBuffer(arg)
            });
        } else {
            ret.push(arg);
        }
    });
    return ret;
}

function massageMessageNativeToJs(message) {
    if (message.CDVType == 'ArrayBuffer') {
        var stringToArrayBuffer = function(str) {
            var ret = new Uint8Array(str.length);
            for (var i = 0; i < str.length; i++) {
                ret[i] = str.charCodeAt(i);
            }
            return ret.buffer;
        };
        var base64ToArrayBuffer = function(b64) {
            return stringToArrayBuffer(atob(b64));
        };
        message = base64ToArrayBuffer(message.data);
    }
    return message;
}

function convertMessageToArgsNativeToJs(message) {
    var args = [];
    if (!message || !message.hasOwnProperty('CDVType')) {
        args.push(message);
    } else if (message.CDVType == 'MultiPart') {
        message.messages.forEach(function(e) {
            args.push(massageMessageNativeToJs(e));
        });
    } else {
        args.push(massageMessageNativeToJs(message));
    }
    return args;
}

function iOSExec() {

    var successCallback, failCallback, service, action, actionArgs;
    var callbackId = null;
    if (typeof arguments[0] !== 'string') {
        // FORMAT ONE
        successCallback = arguments[0];
        failCallback = arguments[1];
        service = arguments[2];
        action = arguments[3];
        actionArgs = arguments[4];

        // Since we need to maintain backwards compatibility, we have to pass
        // an invalid callbackId even if no callback was provided since plugins
        // will be expecting it. The Cordova.exec() implementation allocates
        // an invalid callbackId and passes it even if no callbacks were given.
        callbackId = 'INVALID';
    } else {
        throw new Error('The old format of this exec call has been removed (deprecated since 2.1). Change to: ' +
            'cordova.exec(null, null, \'Service\', \'action\', [ arg1, arg2 ]);'
        );
    }

    // If actionArgs is not provided, default to an empty array
    actionArgs = actionArgs || [];

    // Register the callbacks and add the callbackId to the positional
    // arguments if given.
    if (successCallback || failCallback) {
        callbackId = service + cordova.callbackId++;
        cordova.callbacks[callbackId] =
            {success:successCallback, fail:failCallback};
    }

    actionArgs = massageArgsJsToNative(actionArgs);

    var command = [callbackId, service, action, actionArgs];

    // Stringify and queue the command. We stringify to command now to
    // effectively clone the command arguments in case they are mutated before
    // the command is executed.
    commandQueue.push(JSON.stringify(command));

    // If we're in the context of a stringByEvaluatingJavaScriptFromString call,
    // then the queue will be flushed when it returns; no need for a poke.
    // Also, if there is already a command in the queue, then we've already
    // poked the native side, so there is no reason to do so again.
    if (!isInContextOfEvalJs && commandQueue.length == 1) {
        pokeNative();
    }
}

// CB-10530
function proxyChanged() {
    var cexec = cordovaExec();
       
    return (execProxy !== cexec && // proxy objects are different
            iOSExec !== cexec      // proxy object is not the current iOSExec
            );
}

// CB-10106
function handleBridgeChange() {
    if (proxyChanged()) {
        var commandString = commandQueue.shift();
        while(commandString) {
            var command = JSON.parse(commandString);
            var callbackId = command[0];
            var service = command[1];
            var action = command[2];
            var actionArgs = command[3];
            var callbacks = cordova.callbacks[callbackId] || {};
            
            execProxy(callbacks.success, callbacks.fail, service, action, actionArgs);
            
            commandString = commandQueue.shift();
        };
        return true;
    }
    
    return false;
}

function pokeNative() {
    // CB-5488 - Don't attempt to create iframe before document.body is available.
    if (!document.body) {
        setTimeout(pokeNative);
        return;
    }
    
    // Check if they've removed it from the DOM, and put it back if so.
    if (execIframe && execIframe.contentWindow) {
        execIframe.contentWindow.location = 'gap://ready';
    } else {
        execIframe = document.createElement('iframe');
        execIframe.style.display = 'none';
        execIframe.src = 'gap://ready';
        document.body.appendChild(execIframe);
    }
    // Use a timer to protect against iframe being unloaded during the poke (CB-7735).
    // This makes the bridge ~ 7% slower, but works around the poke getting lost
    // when the iframe is removed from the DOM.
    // An onunload listener could be used in the case where the iframe has just been
    // created, but since unload events fire only once, it doesn't work in the normal
    // case of iframe reuse (where unload will have already fired due to the attempted
    // navigation of the page).
    failSafeTimerId = setTimeout(function() {
        if (commandQueue.length) {
            // CB-10106 - flush the queue on bridge change
            if (!handleBridgeChange()) {
                pokeNative();
             }
        }
    }, 50); // Making this > 0 improves performance (marginally) in the normal case (where it doesn't fire).
}

iOSExec.nativeFetchMessages = function() {
    // Stop listing for window detatch once native side confirms poke.
    if (failSafeTimerId) {
        clearTimeout(failSafeTimerId);
        failSafeTimerId = 0;
    }
    // Each entry in commandQueue is a JSON string already.
    if (!commandQueue.length) {
        return '';
    }
    var json = '[' + commandQueue.join(',') + ']';
    commandQueue.length = 0;
    return json;
};

iOSExec.nativeCallback = function(callbackId, status, message, keepCallback, debug) {
    return iOSExec.nativeEvalAndFetch(function() {
        var success = status === 0 || status === 1;
        var args = convertMessageToArgsNativeToJs(message);
        function nc2() {
            cordova.callbackFromNative(callbackId, success, status, args, keepCallback);
        }
        setTimeout(nc2, 0);
    });
};

iOSExec.nativeEvalAndFetch = function(func) {
    // This shouldn't be nested, but better to be safe.
    isInContextOfEvalJs++;
    try {
        func();
        return iOSExec.nativeFetchMessages();
    } finally {
        isInContextOfEvalJs--;
    }
};

// Proxy the exec for bridge changes. See CB-10106

function cordovaExec() {
    var cexec = require('cordova/exec');
    var cexec_valid = (typeof cexec.nativeFetchMessages === 'function') && (typeof cexec.nativeEvalAndFetch === 'function') && (typeof cexec.nativeCallback === 'function');
    return (cexec_valid && execProxy !== cexec)? cexec : iOSExec;
}

function execProxy() {
    cordovaExec().apply(null, arguments);
};

execProxy.nativeFetchMessages = function() {
    return cordovaExec().nativeFetchMessages.apply(null, arguments);
};

execProxy.nativeEvalAndFetch = function() {
    return cordovaExec().nativeEvalAndFetch.apply(null, arguments);
};

execProxy.nativeCallback = function() {
    return cordovaExec().nativeCallback.apply(null, arguments);
};

module.exports = execProxy;

});

// file: src/common/exec/proxy.js
define("cordova/exec/proxy", function(require, exports, module) {

// internal map of proxy function
var CommandProxyMap = {};

module.exports = {

    // example: cordova.commandProxy.add("Accelerometer",{getCurrentAcceleration: function(successCallback, errorCallback, options) {...},...);
    add: function (id, proxyObj) {
        console.log('adding proxy for ' + id);
        CommandProxyMap[id] = proxyObj;
        return proxyObj;
    },

    // cordova.commandProxy.remove("Accelerometer");
    remove: function (id) {
        var proxy = CommandProxyMap[id];
        delete CommandProxyMap[id];
        CommandProxyMap[id] = null;
        return proxy;
    },

    get: function (service, action) {
        return (CommandProxyMap[service] ? CommandProxyMap[service][action] : null);
    }
};

});

// file: src/common/init.js
define("cordova/init", function(require, exports, module) {

var channel = require('cordova/channel');
var cordova = require('cordova');
var modulemapper = require('cordova/modulemapper');
var platform = require('cordova/platform');
var pluginloader = require('cordova/pluginloader');
var utils = require('cordova/utils');

var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];

function logUnfiredChannels (arr) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i].state !== 2) {
            console.log('Channel not fired: ' + arr[i].type);
        }
    }
}

window.setTimeout(function () {
    if (channel.onDeviceReady.state !== 2) {
        console.log('deviceready has not fired after 5 seconds.');
        logUnfiredChannels(platformInitChannelsArray);
        logUnfiredChannels(channel.deviceReadyChannelsArray);
    }
}, 5000);

// Replace navigator before any modules are required(), to ensure it happens as soon as possible.
// We replace it so that properties that can't be clobbered can instead be overridden.
function replaceNavigator (origNavigator) {
    var CordovaNavigator = function () {};
    CordovaNavigator.prototype = origNavigator;
    var newNavigator = new CordovaNavigator();
    // This work-around really only applies to new APIs that are newer than Function.bind.
    // Without it, APIs such as getGamepads() break.
    if (CordovaNavigator.bind) {
        for (var key in origNavigator) {
            if (typeof origNavigator[key] === 'function') {
                newNavigator[key] = origNavigator[key].bind(origNavigator);
            } else {
                (function (k) {
                    utils.defineGetterSetter(newNavigator, key, function () {
                        return origNavigator[k];
                    });
                })(key);
            }
        }
    }
    return newNavigator;
}

if (window.navigator) {
    // Bug on IOS9 - do not replace the navigator, otherwise the navigator.userAgent is empty
    // window.navigator = replaceNavigator(window.navigator);
}

if (!window.console) {
    window.console = {
        log: function () {}
    };
}
if (!window.console.warn) {
    window.console.warn = function (msg) {
        this.log('warn: ' + msg);
    };
}

// Register pause, resume and deviceready channels as events on document.
channel.onPause = cordova.addDocumentEventHandler('pause');
channel.onResume = cordova.addDocumentEventHandler('resume');
channel.onActivated = cordova.addDocumentEventHandler('activated');
channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

// Listen for DOMContentLoaded and notify our channel subscribers.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    channel.onDOMContentLoaded.fire();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        channel.onDOMContentLoaded.fire();
    }, false);
}

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any cordova JS is ready.
if (window._nativeReady) {
    channel.onNativeReady.fire();
}

modulemapper.clobbers('cordova', 'cordova');
modulemapper.clobbers('cordova/exec', 'cordova.exec');
modulemapper.clobbers('cordova/exec', 'Cordova.exec');

// Call the platform-specific initialization.
platform.bootstrap && platform.bootstrap();

// Wrap in a setTimeout to support the use-case of having plugin JS appended to cordova.js.
// The delay allows the attached modules to be defined before the plugin loader looks for them.
setTimeout(function () {
    pluginloader.load(function () {
        channel.onPluginsReady.fire();
    });
}, 0);

/**
 * Create all cordova objects once native side is ready.
 */
channel.join(function () {
    modulemapper.mapModules(window);

    platform.initialize && platform.initialize();

    // Fire event to notify that all objects are created
    channel.onCordovaReady.fire();

    // Fire onDeviceReady event once page has fully loaded, all
    // constructors have run and cordova info has been received from native
    // side.
    channel.join(function () {
        require('cordova').fireDocumentEvent('deviceready');
    }, channel.deviceReadyChannelsArray);

}, platformInitChannelsArray);

});

// file: src/common/init_b.js
define("cordova/init_b", function(require, exports, module) {

var channel = require('cordova/channel');
var cordova = require('cordova');
var modulemapper = require('cordova/modulemapper');
var platform = require('cordova/platform');
var pluginloader = require('cordova/pluginloader');
var utils = require('cordova/utils');

var platformInitChannelsArray = [channel.onDOMContentLoaded, channel.onNativeReady, channel.onPluginsReady];

// setting exec
cordova.exec = require('cordova/exec');

function logUnfiredChannels (arr) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i].state !== 2) {
            console.log('Channel not fired: ' + arr[i].type);
        }
    }
}

window.setTimeout(function () {
    if (channel.onDeviceReady.state !== 2) {
        console.log('deviceready has not fired after 5 seconds.');
        logUnfiredChannels(platformInitChannelsArray);
        logUnfiredChannels(channel.deviceReadyChannelsArray);
    }
}, 5000);

// Replace navigator before any modules are required(), to ensure it happens as soon as possible.
// We replace it so that properties that can't be clobbered can instead be overridden.
function replaceNavigator (origNavigator) {
    var CordovaNavigator = function () {};
    CordovaNavigator.prototype = origNavigator;
    var newNavigator = new CordovaNavigator();
    // This work-around really only applies to new APIs that are newer than Function.bind.
    // Without it, APIs such as getGamepads() break.
    if (CordovaNavigator.bind) {
        for (var key in origNavigator) {
            if (typeof origNavigator[key] === 'function') {
                newNavigator[key] = origNavigator[key].bind(origNavigator);
            } else {
                (function (k) {
                    utils.defineGetterSetter(newNavigator, key, function () {
                        return origNavigator[k];
                    });
                })(key);
            }
        }
    }
    return newNavigator;
}
if (window.navigator) {
    window.navigator = replaceNavigator(window.navigator);
}

if (!window.console) {
    window.console = {
        log: function () {}
    };
}
if (!window.console.warn) {
    window.console.warn = function (msg) {
        this.log('warn: ' + msg);
    };
}

// Register pause, resume and deviceready channels as events on document.
channel.onPause = cordova.addDocumentEventHandler('pause');
channel.onResume = cordova.addDocumentEventHandler('resume');
channel.onActivated = cordova.addDocumentEventHandler('activated');
channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

// Listen for DOMContentLoaded and notify our channel subscribers.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    channel.onDOMContentLoaded.fire();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        channel.onDOMContentLoaded.fire();
    }, false);
}

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any cordova JS is ready.
if (window._nativeReady) {
    channel.onNativeReady.fire();
}

// Call the platform-specific initialization.
platform.bootstrap && platform.bootstrap();

// Wrap in a setTimeout to support the use-case of having plugin JS appended to cordova.js.
// The delay allows the attached modules to be defined before the plugin loader looks for them.
setTimeout(function () {
    pluginloader.load(function () {
        channel.onPluginsReady.fire();
    });
}, 0);

/**
 * Create all cordova objects once native side is ready.
 */
channel.join(function () {
    modulemapper.mapModules(window);

    platform.initialize && platform.initialize();

    // Fire event to notify that all objects are created
    channel.onCordovaReady.fire();

    // Fire onDeviceReady event once page has fully loaded, all
    // constructors have run and cordova info has been received from native
    // side.
    channel.join(function () {
        require('cordova').fireDocumentEvent('deviceready');
    }, channel.deviceReadyChannelsArray);

}, platformInitChannelsArray);

});

// file: src/common/modulemapper.js
define("cordova/modulemapper", function(require, exports, module) {

var builder = require('cordova/builder');
var moduleMap = define.moduleMap; // eslint-disable-line no-undef
var symbolList;
var deprecationMap;

exports.reset = function () {
    symbolList = [];
    deprecationMap = {};
};

function addEntry (strategy, moduleName, symbolPath, opt_deprecationMessage) {
    if (!(moduleName in moduleMap)) {
        throw new Error('Module ' + moduleName + ' does not exist.');
    }
    symbolList.push(strategy, moduleName, symbolPath);
    if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
    }
}

// Note: Android 2.3 does have Function.bind().
exports.clobbers = function (moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
};

exports.merges = function (moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
};

exports.defaults = function (moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
};

exports.runs = function (moduleName) {
    addEntry('r', moduleName, null);
};

function prepareNamespace (symbolPath, context) {
    if (!symbolPath) {
        return context;
    }
    var parts = symbolPath.split('.');
    var cur = context;
    for (var i = 0, part; part = parts[i]; ++i) { // eslint-disable-line no-cond-assign
        cur = cur[part] = cur[part] || {};
    }
    return cur;
}

exports.mapModules = function (context) {
    var origSymbols = {};
    context.CDV_origSymbols = origSymbols;
    for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var module = require(moduleName);
        // <runs/>
        if (strategy === 'r') {
            continue;
        }
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf('.');
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);

        var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];

        if (strategy === 'm' && target) {
            builder.recursiveMerge(target, module);
        } else if ((strategy === 'd' && !target) || (strategy !== 'd')) {
            if (!(symbolPath in origSymbols)) {
                origSymbols[symbolPath] = target;
            }
            builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
    }
};

exports.getOriginalSymbol = function (context, symbolPath) {
    var origSymbols = context.CDV_origSymbols;
    if (origSymbols && (symbolPath in origSymbols)) {
        return origSymbols[symbolPath];
    }
    var parts = symbolPath.split('.');
    var obj = context;
    for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
    }
    return obj;
};

exports.reset();

});

// file: src/common/modulemapper_b.js
define("cordova/modulemapper_b", function(require, exports, module) {

var builder = require('cordova/builder');
var symbolList = [];
var deprecationMap;

exports.reset = function () {
    symbolList = [];
    deprecationMap = {};
};

function addEntry (strategy, moduleName, symbolPath, opt_deprecationMessage) {
    symbolList.push(strategy, moduleName, symbolPath);
    if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
    }
}

// Note: Android 2.3 does have Function.bind().
exports.clobbers = function (moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
};

exports.merges = function (moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
};

exports.defaults = function (moduleName, symbolPath, opt_deprecationMessage) {
    addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
};

exports.runs = function (moduleName) {
    addEntry('r', moduleName, null);
};

function prepareNamespace (symbolPath, context) {
    if (!symbolPath) {
        return context;
    }
    var parts = symbolPath.split('.');
    var cur = context;
    for (var i = 0, part; part = parts[i]; ++i) { // eslint-disable-line no-cond-assign
        cur = cur[part] = cur[part] || {};
    }
    return cur;
}

exports.mapModules = function (context) {
    var origSymbols = {};
    context.CDV_origSymbols = origSymbols;
    for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var module = require(moduleName);
        // <runs/>
        if (strategy === 'r') {
            continue;
        }
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf('.');
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);

        var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];

        if (strategy === 'm' && target) {
            builder.recursiveMerge(target, module);
        } else if ((strategy === 'd' && !target) || (strategy !== 'd')) {
            if (!(symbolPath in origSymbols)) {
                origSymbols[symbolPath] = target;
            }
            builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
    }
};

exports.getOriginalSymbol = function (context, symbolPath) {
    var origSymbols = context.CDV_origSymbols;
    if (origSymbols && (symbolPath in origSymbols)) {
        return origSymbols[symbolPath];
    }
    var parts = symbolPath.split('.');
    var obj = context;
    for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
    }
    return obj;
};

exports.reset();

});

// file: /Users/spindori/Documents/Cordova/cordova-ios/cordova-js-src/platform.js
define("cordova/platform", function(require, exports, module) {

module.exports = {
    id: 'ios',
    bootstrap: function () {
        // Attach the console polyfill that is iOS-only to window.console
        // see the file under plugin/ios/console.js
        require('cordova/modulemapper').clobbers('cordova/plugin/ios/console', 'window.console');

        require('cordova/channel').onNativeReady.fire();
    }
};

});

// file: /Users/spindori/Documents/Cordova/cordova-ios/cordova-js-src/plugin/ios/console.js
define("cordova/plugin/ios/console", function(require, exports, module) {

//------------------------------------------------------------------------------

var logger = require('cordova/plugin/ios/logger');

//------------------------------------------------------------------------------
// object that we're exporting
//------------------------------------------------------------------------------
var console = module.exports;

//------------------------------------------------------------------------------
// copy of the original console object
//------------------------------------------------------------------------------
var WinConsole = window.console;

//------------------------------------------------------------------------------
// whether to use the logger
//------------------------------------------------------------------------------
var UseLogger = false;

//------------------------------------------------------------------------------
// Timers
//------------------------------------------------------------------------------
var Timers = {};

//------------------------------------------------------------------------------
// used for unimplemented methods
//------------------------------------------------------------------------------
function noop() {}

//------------------------------------------------------------------------------
// used for unimplemented methods
//------------------------------------------------------------------------------
console.useLogger = function (value) {
    if (arguments.length) UseLogger = !!value;

    if (UseLogger) {
        if (logger.useConsole()) {
            throw new Error("console and logger are too intertwingly");
        }
    }

    return UseLogger;
};

//------------------------------------------------------------------------------
console.log = function() {
    if (logger.useConsole()) return;
    logger.log.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.error = function() {
    if (logger.useConsole()) return;
    logger.error.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.warn = function() {
    if (logger.useConsole()) return;
    logger.warn.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.info = function() {
    if (logger.useConsole()) return;
    logger.info.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.debug = function() {
    if (logger.useConsole()) return;
    logger.debug.apply(logger, [].slice.call(arguments));
};

//------------------------------------------------------------------------------
console.assert = function(expression) {
    if (expression) return;

    var message = logger.format.apply(logger.format, [].slice.call(arguments, 1));
    console.log("ASSERT: " + message);
};

//------------------------------------------------------------------------------
console.clear = function() {};

//------------------------------------------------------------------------------
console.dir = function(object) {
    console.log("%o", object);
};

//------------------------------------------------------------------------------
console.dirxml = function(node) {
    console.log(node.innerHTML);
};

//------------------------------------------------------------------------------
console.trace = noop;

//------------------------------------------------------------------------------
console.group = console.log;

//------------------------------------------------------------------------------
console.groupCollapsed = console.log;

//------------------------------------------------------------------------------
console.groupEnd = noop;

//------------------------------------------------------------------------------
console.time = function(name) {
    Timers[name] = new Date().valueOf();
};

//------------------------------------------------------------------------------
console.timeEnd = function(name) {
    var timeStart = Timers[name];
    if (!timeStart) {
        console.warn("unknown timer: " + name);
        return;
    }

    var timeElapsed = new Date().valueOf() - timeStart;
    console.log(name + ": " + timeElapsed + "ms");
};

//------------------------------------------------------------------------------
console.timeStamp = noop;

//------------------------------------------------------------------------------
console.profile = noop;

//------------------------------------------------------------------------------
console.profileEnd = noop;

//------------------------------------------------------------------------------
console.count = noop;

//------------------------------------------------------------------------------
console.exception = console.log;

//------------------------------------------------------------------------------
console.table = function(data, columns) {
    console.log("%o", data);
};

//------------------------------------------------------------------------------
// return a new function that calls both functions passed as args
//------------------------------------------------------------------------------
function wrappedOrigCall(orgFunc, newFunc) {
    return function() {
        var args = [].slice.call(arguments);
        try { orgFunc.apply(WinConsole, args); } catch (e) {}
        try { newFunc.apply(console,    args); } catch (e) {}
    };
}

//------------------------------------------------------------------------------
// For every function that exists in the original console object, that
// also exists in the new console object, wrap the new console method
// with one that calls both
//------------------------------------------------------------------------------
for (var key in console) {
    if (typeof WinConsole[key] == "function") {
        console[key] = wrappedOrigCall(WinConsole[key], console[key]);
    }
}

});

// file: /Users/spindori/Documents/Cordova/cordova-ios/cordova-js-src/plugin/ios/logger.js
define("cordova/plugin/ios/logger", function(require, exports, module) {

//------------------------------------------------------------------------------
// The logger module exports the following properties/functions:
//
// LOG                          - constant for the level LOG
// ERROR                        - constant for the level ERROR
// WARN                         - constant for the level WARN
// INFO                         - constant for the level INFO
// DEBUG                        - constant for the level DEBUG
// logLevel()                   - returns current log level
// logLevel(value)              - sets and returns a new log level
// useConsole()                 - returns whether logger is using console
// useConsole(value)            - sets and returns whether logger is using console
// log(message,...)             - logs a message at level LOG
// error(message,...)           - logs a message at level ERROR
// warn(message,...)            - logs a message at level WARN
// info(message,...)            - logs a message at level INFO
// debug(message,...)           - logs a message at level DEBUG
// logLevel(level,message,...)  - logs a message specified level
//
//------------------------------------------------------------------------------

var logger = exports;

var exec    = require('cordova/exec');

var UseConsole   = false;
var UseLogger    = true;
var Queued       = [];
var DeviceReady  = false;
var CurrentLevel;

var originalConsole = console;

/**
 * Logging levels
 */

var Levels = [
    "LOG",
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG"
];

/*
 * add the logging levels to the logger object and
 * to a separate levelsMap object for testing
 */

var LevelsMap = {};
for (var i=0; i<Levels.length; i++) {
    var level = Levels[i];
    LevelsMap[level] = i;
    logger[level]    = level;
}

CurrentLevel = LevelsMap.WARN;

/**
 * Getter/Setter for the logging level
 *
 * Returns the current logging level.
 *
 * When a value is passed, sets the logging level to that value.
 * The values should be one of the following constants:
 *    logger.LOG
 *    logger.ERROR
 *    logger.WARN
 *    logger.INFO
 *    logger.DEBUG
 *
 * The value used determines which messages get printed.  The logging
 * values above are in order, and only messages logged at the logging
 * level or above will actually be displayed to the user.  E.g., the
 * default level is WARN, so only messages logged with LOG, ERROR, or
 * WARN will be displayed; INFO and DEBUG messages will be ignored.
 */
logger.level = function (value) {
    if (arguments.length) {
        if (LevelsMap[value] === null) {
            throw new Error("invalid logging level: " + value);
        }
        CurrentLevel = LevelsMap[value];
    }

    return Levels[CurrentLevel];
};

/**
 * Getter/Setter for the useConsole functionality
 *
 * When useConsole is true, the logger will log via the
 * browser 'console' object.
 */
logger.useConsole = function (value) {
    if (arguments.length) UseConsole = !!value;

    if (UseConsole) {
        if (typeof console == "undefined") {
            throw new Error("global console object is not defined");
        }

        if (typeof console.log != "function") {
            throw new Error("global console object does not have a log function");
        }

        if (typeof console.useLogger == "function") {
            if (console.useLogger()) {
                throw new Error("console and logger are too intertwingly");
            }
        }
    }

    return UseConsole;
};

/**
 * Getter/Setter for the useLogger functionality
 *
 * When useLogger is true, the logger will log via the
 * native Logger plugin.
 */
logger.useLogger = function (value) {
    // Enforce boolean
    if (arguments.length) UseLogger = !!value;
    return UseLogger;
};

/**
 * Logs a message at the LOG level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.log   = function(message) { logWithArgs("LOG",   arguments); };

/**
 * Logs a message at the ERROR level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.error = function(message) { logWithArgs("ERROR", arguments); };

/**
 * Logs a message at the WARN level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.warn  = function(message) { logWithArgs("WARN",  arguments); };

/**
 * Logs a message at the INFO level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.info  = function(message) { logWithArgs("INFO",  arguments); };

/**
 * Logs a message at the DEBUG level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.debug = function(message) { logWithArgs("DEBUG", arguments); };

// log at the specified level with args
function logWithArgs(level, args) {
    args = [level].concat([].slice.call(args));
    logger.logLevel.apply(logger, args);
}

// return the correct formatString for an object
function formatStringForMessage(message) {
    return (typeof message === "string") ? "" : "%o"; 
}

/**
 * Logs a message at the specified level.
 *
 * Parameters passed after message are used applied to
 * the message with utils.format()
 */
logger.logLevel = function(level /* , ... */) {
    // format the message with the parameters
    var formatArgs = [].slice.call(arguments, 1);
    var fmtString = formatStringForMessage(formatArgs[0]);
    if (fmtString.length > 0){
        formatArgs.unshift(fmtString); // add formatString
    }

    var message    = logger.format.apply(logger.format, formatArgs);

    if (LevelsMap[level] === null) {
        throw new Error("invalid logging level: " + level);
    }

    if (LevelsMap[level] > CurrentLevel) return;

    // queue the message if not yet at deviceready
    if (!DeviceReady && !UseConsole) {
        Queued.push([level, message]);
        return;
    }

    // Log using the native logger if that is enabled
    if (UseLogger) {
        exec(null, null, "Console", "logLevel", [level, message]);
    }

    // Log using the console if that is enabled
    if (UseConsole) {
        // make sure console is not using logger
        if (console.useLogger()) {
            throw new Error("console and logger are too intertwingly");
        }

        // log to the console
        switch (level) {
            case logger.LOG:   originalConsole.log(message); break;
            case logger.ERROR: originalConsole.log("ERROR: " + message); break;
            case logger.WARN:  originalConsole.log("WARN: "  + message); break;
            case logger.INFO:  originalConsole.log("INFO: "  + message); break;
            case logger.DEBUG: originalConsole.log("DEBUG: " + message); break;
        }
    }
};


/**
 * Formats a string and arguments following it ala console.log()
 *
 * Any remaining arguments will be appended to the formatted string.
 *
 * for rationale, see FireBug's Console API:
 *    http://getfirebug.com/wiki/index.php/Console_API
 */
logger.format = function(formatString, args) {
    return __format(arguments[0], [].slice.call(arguments,1)).join(' ');
};


//------------------------------------------------------------------------------
/**
 * Formats a string and arguments following it ala vsprintf()
 *
 * format chars:
 *   %j - format arg as JSON
 *   %o - format arg as JSON
 *   %c - format arg as ''
 *   %% - replace with '%'
 * any other char following % will format it's
 * arg via toString().
 *
 * Returns an array containing the formatted string and any remaining
 * arguments.
 */
function __format(formatString, args) {
    if (formatString === null || formatString === undefined) return [""];
    if (arguments.length == 1) return [formatString.toString()];

    if (typeof formatString != "string")
        formatString = formatString.toString();

    var pattern = /(.*?)%(.)(.*)/;
    var rest    = formatString;
    var result  = [];

    while (args.length) {
        var match = pattern.exec(rest);
        if (!match) break;

        var arg   = args.shift();
        rest = match[3];
        result.push(match[1]);

        if (match[2] == '%') {
            result.push('%');
            args.unshift(arg);
            continue;
        }

        result.push(__formatted(arg, match[2]));
    }

    result.push(rest);

    var remainingArgs = [].slice.call(args);
    remainingArgs.unshift(result.join(''));
    return remainingArgs;
}

function __formatted(object, formatChar) {

    try {
        switch(formatChar) {
            case 'j':
            case 'o': return JSON.stringify(object);
            case 'c': return '';
        }
    }
    catch (e) {
        return "error JSON.stringify()ing argument: " + e;
    }

    if ((object === null) || (object === undefined)) {
        return Object.prototype.toString.call(object);
    }

    return object.toString();
}


//------------------------------------------------------------------------------
// when deviceready fires, log queued messages
logger.__onDeviceReady = function() {
    if (DeviceReady) return;

    DeviceReady = true;

    for (var i=0; i<Queued.length; i++) {
        var messageArgs = Queued[i];
        logger.logLevel(messageArgs[0], messageArgs[1]);
    }

    Queued = null;
};

// add a deviceready event to log queued messages
document.addEventListener("deviceready", logger.__onDeviceReady, false);

});

// file: src/common/pluginloader.js
define("cordova/pluginloader", function(require, exports, module) {

var modulemapper = require('cordova/modulemapper');

// Helper function to inject a <script> tag.
// Exported for testing.
exports.injectScript = function (url, onload, onerror) {
    var script = document.createElement('script');
    // onload fires even when script fails loads with an error.
    script.onload = onload;
    // onerror fires for malformed URLs.
    script.onerror = onerror;
    script.src = url;
    document.head.appendChild(script);
};

function injectIfNecessary (id, url, onload, onerror) {
    onerror = onerror || onload;
    if (id in define.moduleMap) { // eslint-disable-line no-undef
        onload();
    } else {
        exports.injectScript(url, function () {
            if (id in define.moduleMap) { // eslint-disable-line no-undef
                onload();
            } else {
                onerror();
            }
        }, onerror);
    }
}

function onScriptLoadingComplete (moduleList, finishPluginLoading) {
    // Loop through all the plugins and then through their clobbers and merges.
    for (var i = 0, module; module = moduleList[i]; i++) { // eslint-disable-line no-cond-assign
        if (module.clobbers && module.clobbers.length) {
            for (var j = 0; j < module.clobbers.length; j++) {
                modulemapper.clobbers(module.id, module.clobbers[j]);
            }
        }

        if (module.merges && module.merges.length) {
            for (var k = 0; k < module.merges.length; k++) {
                modulemapper.merges(module.id, module.merges[k]);
            }
        }

        // Finally, if runs is truthy we want to simply require() the module.
        if (module.runs) {
            modulemapper.runs(module.id);
        }
    }

    finishPluginLoading();
}

// Handler for the cordova_plugins.js content.
// See plugman's plugin_loader.js for the details of this object.
// This function is only called if the really is a plugins array that isn't empty.
// Otherwise the onerror response handler will just call finishPluginLoading().
function handlePluginsObject (path, moduleList, finishPluginLoading) {
    // Now inject the scripts.
    var scriptCounter = moduleList.length;

    if (!scriptCounter) {
        finishPluginLoading();
        return;
    }
    function scriptLoadedCallback () {
        if (!--scriptCounter) {
            onScriptLoadingComplete(moduleList, finishPluginLoading);
        }
    }

    for (var i = 0; i < moduleList.length; i++) {
        injectIfNecessary(moduleList[i].id, path + moduleList[i].file, scriptLoadedCallback);
    }
}

function findCordovaPath () {
    var path = null;
    var scripts = document.getElementsByTagName('script');
    var term = '/cordova.js';
    for (var n = scripts.length - 1; n > -1; n--) {
        var src = scripts[n].src.replace(/\?.*$/, ''); // Strip any query param (CB-6007).
        if (src.indexOf(term) === (src.length - term.length)) {
            path = src.substring(0, src.length - term.length) + '/';
            break;
        }
    }
    return path;
}

// Tries to load all plugins' js-modules.
// This is an async process, but onDeviceReady is blocked on onPluginsReady.
// onPluginsReady is fired when there are no plugins to load, or they are all done.
exports.load = function (callback) {
    var pathPrefix = findCordovaPath();
    if (pathPrefix === null) {
        console.log('Could not find cordova.js script tag. Plugin loading may fail.');
        pathPrefix = '';
    }
    injectIfNecessary('cordova/plugin_list', pathPrefix + 'cordova_plugins.js', function () {
        var moduleList = require('cordova/plugin_list');
        handlePluginsObject(pathPrefix, moduleList, callback);
    }, callback);
};

});

// file: src/common/pluginloader_b.js
define("cordova/pluginloader_b", function(require, exports, module) {

var modulemapper = require('cordova/modulemapper');

// Handler for the cordova_plugins.js content.
// See plugman's plugin_loader.js for the details of this object.
function handlePluginsObject (moduleList) {
    // if moduleList is not defined or empty, we've nothing to do
    if (!moduleList || !moduleList.length) {
        return;
    }

    // Loop through all the modules and then through their clobbers and merges.
    for (var i = 0, module; module = moduleList[i]; i++) { // eslint-disable-line no-cond-assign
        if (module.clobbers && module.clobbers.length) {
            for (var j = 0; j < module.clobbers.length; j++) {
                modulemapper.clobbers(module.id, module.clobbers[j]);
            }
        }

        if (module.merges && module.merges.length) {
            for (var k = 0; k < module.merges.length; k++) {
                modulemapper.merges(module.id, module.merges[k]);
            }
        }

        // Finally, if runs is truthy we want to simply require() the module.
        if (module.runs) {
            modulemapper.runs(module.id);
        }
    }
}

// Loads all plugins' js-modules. Plugin loading is syncronous in browserified bundle
// but the method accepts callback to be compatible with non-browserify flow.
// onDeviceReady is blocked on onPluginsReady. onPluginsReady is fired when there are
// no plugins to load, or they are all done.
exports.load = function (callback) {
    var moduleList = require('cordova/plugin_list');
    handlePluginsObject(moduleList);

    callback();
};

});

// file: src/common/urlutil.js
define("cordova/urlutil", function(require, exports, module) {

/**
 * For already absolute URLs, returns what is passed in.
 * For relative URLs, converts them to absolute ones.
 */
exports.makeAbsolute = function makeAbsolute (url) {
    var anchorEl = document.createElement('a');
    anchorEl.href = url;
    return anchorEl.href;
};

});

// file: src/common/utils.js
define("cordova/utils", function(require, exports, module) {

var utils = exports;

/**
 * Defines a property getter / setter for obj[key].
 */
utils.defineGetterSetter = function (obj, key, getFunc, opt_setFunc) {
    if (Object.defineProperty) {
        var desc = {
            get: getFunc,
            configurable: true
        };
        if (opt_setFunc) {
            desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
    } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
            obj.__defineSetter__(key, opt_setFunc);
        }
    }
};

/**
 * Defines a property getter for obj[key].
 */
utils.defineGetter = utils.defineGetterSetter;

utils.arrayIndexOf = function (a, item) {
    if (a.indexOf) {
        return a.indexOf(item);
    }
    var len = a.length;
    for (var i = 0; i < len; ++i) {
        if (a[i] === item) {
            return i;
        }
    }
    return -1;
};

/**
 * Returns whether the item was found in the array.
 */
utils.arrayRemove = function (a, item) {
    var index = utils.arrayIndexOf(a, item);
    if (index !== -1) {
        a.splice(index, 1);
    }
    return index !== -1;
};

utils.typeName = function (val) {
    return Object.prototype.toString.call(val).slice(8, -1);
};

/**
 * Returns an indication of whether the argument is an array or not
 */
utils.isArray = Array.isArray ||
                function (a) { return utils.typeName(a) === 'Array'; };

/**
 * Returns an indication of whether the argument is a Date or not
 */
utils.isDate = function (d) {
    return (d instanceof Date);
};

/**
 * Does a deep clone of the object.
 */
utils.clone = function (obj) {
    if (!obj || typeof obj === 'function' || utils.isDate(obj) || typeof obj !== 'object') {
        return obj;
    }

    var retVal, i;

    if (utils.isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
            retVal.push(utils.clone(obj[i]));
        }
        return retVal;
    }

    retVal = {};
    for (i in obj) {
        // https://issues.apache.org/jira/browse/CB-11522 'unknown' type may be returned in
        // custom protocol activation case on Windows Phone 8.1 causing "No such interface supported" exception
        // on cloning.
        if ((!(i in retVal) || retVal[i] !== obj[i]) && typeof obj[i] !== 'undefined' && typeof obj[i] !== 'unknown') { // eslint-disable-line valid-typeof
            retVal[i] = utils.clone(obj[i]);
        }
    }
    return retVal;
};

/**
 * Returns a wrapped version of the function
 */
utils.close = function (context, func, params) {
    return function () {
        var args = params || arguments;
        return func.apply(context, args);
    };
};

// ------------------------------------------------------------------------------
function UUIDcreatePart (length) {
    var uuidpart = '';
    for (var i = 0; i < length; i++) {
        var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length === 1) {
            uuidchar = '0' + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
}

/**
 * Create a UUID
 */
utils.createUUID = function () {
    return UUIDcreatePart(4) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(6);
};

/**
 * Extends a child object from a parent object using classical inheritance
 * pattern.
 */
utils.extend = (function () {
    // proxy used to establish prototype chain
    var F = function () {};
    // extend Child from Parent
    return function (Child, Parent) {

        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
    };
}());

/**
 * Alerts a message in any available way: alert or console.log.
 */
utils.alert = function (msg) {
    if (window.alert) {
        window.alert(msg);
    } else if (console && console.log) {
        console.log(msg);
    }
};

});

window.cordova = require('cordova');
// file: src/scripts/bootstrap.js

require('cordova/init');

})();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Plugins ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


//Code from plugins, regular cordova projects includes these blocks as separated files in app package.
cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
                    "navigator.splashscreen"
                    ]
    },
   {
        "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
        "id": "cordova-plugin-inappbrowser.inappbrowser",
        "pluginId": "cordova-plugin-inappbrowser",
        "clobbers": [
            "cordova.InAppBrowser.open",
            "window.open"
        ]
    },
    {
        "file": "plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",
        "id": "com.phonegap.plugins.PushPlugin.PushNotification",
        "clobbers": [
            "PushNotification"
        ]
    },
     {
        "file": "plugins/cordova-plugin-appsflyer/www/appsflyer.js",
        "id": "cordova-plugin-appsflyer.appsflyer",
        "pluginId": "cordova-plugin-appsflyer",
        "clobbers": [
                    "window.plugins.appsFlyer"
                    ]
        },
        {
            "id": "cordova-plugin-touch-id.TouchID",
            "file": "plugins/cordova-plugin-touch-id/www/TouchID.js",
            "pluginId": "cordova-plugin-touch-id",
            "clobbers": [
                         "Fingerprint"
                         ]
        },
        // apprate
        {
        "id": "cordova-plugin-dialogs.notification",
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
                   "navigator.notification"
                   ]
        },
        {
        "id": "cordova-plugin-globalization.GlobalizationError",
        "file": "plugins/cordova-plugin-globalization/www/GlobalizationError.js",
        "pluginId": "cordova-plugin-globalization",
        "clobbers": [
                     "window.GlobalizationError"
                     ]
        },
        {
        "id": "cordova-plugin-globalization.globalization",
        "file": "plugins/cordova-plugin-globalization/www/globalization.js",
        "pluginId": "cordova-plugin-globalization",
        "clobbers": [
                     "navigator.globalization"
                     ]
        },
        {
        "id": "cordova-plugin-nativestorage.mainHandle",
        "file": "plugins/cordova-plugin-nativestorage/www/mainHandle.js",
        "pluginId": "cordova-plugin-nativestorage",
        "clobbers": [
                     "NativeStorage"
                     ]
        },
        {
        "id": "cordova-plugin-nativestorage.LocalStorageHandle",
        "file": "plugins/cordova-plugin-nativestorage/www/LocalStorageHandle.js",
        "pluginId": "cordova-plugin-nativestorage"
        },
        {
        "id": "cordova-plugin-nativestorage.NativeStorageError",
        "file": "plugins/cordova-plugin-nativestorage/www/NativeStorageError.js",
        "pluginId": "cordova-plugin-nativestorage"
        },
        {
        "id": "cordova-plugin-apprate.AppRate",
        "file": "plugins/cordova-plugin-apprate/www/AppRate.js",
        "pluginId": "cordova-plugin-apprate",
        "clobbers": [
                     "AppRate"
                     ]
        },
        {
        "id": "cordova-plugin-apprate.locales",
        "file": "plugins/cordova-plugin-apprate/www/locales.js",
        "pluginId": "cordova-plugin-apprate",
        "runs": true
        },
        {
        "id": "cordova-plugin-apprate.storage",
        "file": "plugins/cordova-plugin-apprate/www/storage.js",
        "pluginId": "cordova-plugin-apprate",
        "runs": true
        },
                                 {
                                 "id": "cordova-plugin-native-logs.NativeLogs",
                                 "file": "plugins/cordova-plugin-native-logs/www/nativeLogs.js",
                                 "pluginId": "cordova-plugin-native-logs",
                                 "clobbers": [
                                              "window.NativeLogs"
                                              ]
                                 }
        
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-splashscreen": "3.2.2",
    "cordova-plugin-inappbrowser": "1.4.0",
    "com.phonegap.plugins.PushPlugin": "2.4.0",
    "cordova-plugin-appsflyer": "4.1.0",
    "cordova-plugin-touch-id": "3.3.1",
    // apprate
    "cordova-plugin-dialogs": "2.0.1",
    "cordova-plugin-globalization": "1.11.0",
    "cordova-plugin-nativestorage": "2.3.2",
    "cordova-plugin-apprate": "1.4.0",
    "cordova-plugin-native-logs": "1.0.5"
}
// BOTTOM OF METADATA
});

cordova.define("cordova-plugin-native-logs.NativeLogs", function(require, exports, module) {
               
               module.exports = {
               
               pluginName: "NativeLogs",
               
               getLog:function(_nbLines,_bCopyToClipboard,successCB,failureCB){
               cordova.exec(successCB, failureCB, this.pluginName,"getLog", [_nbLines,_bCopyToClipboard]);
               },
               
               getCustomerID:function(customerID, successCB,failureCB){
               cordova.exec(successCB, failureCB, this.pluginName,"getCustomerID", [customerID]);
               }
               
               };
               
});

cordova.define("cordova-plugin-dialogs.notification", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
               
               var exec = require('cordova/exec');
               var platform = require('cordova/platform');
               
/**
 * Provides access to notifications on the device.
 */
               
               module.exports = {
               
               /**
                * Open a native alert dialog, with a customizable title and button text.
                *
                * @param {String} message              Message to print in the body of the alert
                * @param {Function} completeCallback   The callback that is called when user clicks on a button.
                * @param {String} title                Title of the alert dialog (default: Alert)
                * @param {String} buttonLabel          Label of the close button (default: OK)
                */
               alert: function (message, completeCallback, title, buttonLabel) {
               var _message = (typeof message === 'string' ? message : JSON.stringify(message));
               var _title = (typeof title === 'string' ? title : 'Alert');
               var _buttonLabel = (buttonLabel && typeof buttonLabel === 'string' ? buttonLabel : 'OK');
               exec(completeCallback, null, 'Notification', 'alert', [_message, _title, _buttonLabel]);
               },
               
               /**
                * Open a native confirm dialog, with a customizable title and button text.
                * The result that the user selects is returned to the result callback.
                *
                * @param {String} message              Message to print in the body of the alert
                * @param {Function} resultCallback     The callback that is called when user clicks on a button.
                * @param {String} title                Title of the alert dialog (default: Confirm)
                * @param {Array} buttonLabels          Array of the labels of the buttons (default: ['OK', 'Cancel'])
                */
               confirm: function (message, resultCallback, title, buttonLabels) {
               var _message = (typeof message === 'string' ? message : JSON.stringify(message));
               var _title = (typeof title === 'string' ? title : 'Confirm');
               var _buttonLabels = (buttonLabels || ['OK', 'Cancel']);
               
               // Strings are deprecated!
               if (typeof _buttonLabels === 'string') {
               console.log('Notification.confirm(string, function, string, string) is deprecated.  Use Notification.confirm(string, function, string, array).');
               }
               
               _buttonLabels = convertButtonLabels(_buttonLabels);
               
               exec(resultCallback, null, 'Notification', 'confirm', [_message, _title, _buttonLabels]);
               },
               
               /**
                * Open a native prompt dialog, with a customizable title and button text.
                * The following results are returned to the result callback:
                *  buttonIndex     Index number of the button selected.
                *  input1          The text entered in the prompt dialog box.
                *
                * @param {String} message              Dialog message to display (default: "Prompt message")
                * @param {Function} resultCallback     The callback that is called when user clicks on a button.
                * @param {String} title                Title of the dialog (default: "Prompt")
                * @param {Array} buttonLabels          Array of strings for the button labels (default: ["OK","Cancel"])
                * @param {String} defaultText          Textbox input value (default: empty string)
                */
               prompt: function (message, resultCallback, title, buttonLabels, defaultText) {
               var _message = (typeof message === 'string' ? message : JSON.stringify(message));
               var _title = (typeof title === 'string' ? title : 'Prompt');
               var _buttonLabels = (buttonLabels || ['OK', 'Cancel']);
               
               // Strings are deprecated!
               if (typeof _buttonLabels === 'string') {
               console.log('Notification.prompt(string, function, string, string) is deprecated.  Use Notification.confirm(string, function, string, array).');
               }
               
               _buttonLabels = convertButtonLabels(_buttonLabels);
               
               var _defaultText = (defaultText || '');
               exec(resultCallback, null, 'Notification', 'prompt', [_message, _title, _buttonLabels, _defaultText]);
               },
               
               /**
                * Causes the device to beep.
                * On Android, the default notification ringtone is played "count" times.
                *
                * @param {Integer} count       The number of beeps.
                */
               beep: function (count) {
               var defaultedCount = count || 1;
               exec(null, null, 'Notification', 'beep', [ defaultedCount ]);
               }
               };
               
               function convertButtonLabels (buttonLabels) {
               
               // Some platforms take an array of button label names.
               // Other platforms take a comma separated list.
               // For compatibility, we convert to the desired type based on the platform.
               if (platform.id === 'amazon-fireos' || platform.id === 'android' || platform.id === 'ios' ||
                   platform.id === 'windowsphone' || platform.id === 'firefoxos' || platform.id === 'ubuntu' ||
                   platform.id === 'windows8' || platform.id === 'windows') {
               
               if (typeof buttonLabels === 'string') {
               buttonLabels = buttonLabels.split(','); // not crazy about changing the var type here
               }
               } else {
               if (Array.isArray(buttonLabels)) {
               var buttonLabelArray = buttonLabels;
               buttonLabels = buttonLabelArray.toString();
               }
               }
               
               return buttonLabels;
               }
               
               });

cordova.define("cordova-plugin-globalization.GlobalizationError", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
               
/**
 * Globalization error object
 *
 * @constructor
 * @param code
 * @param message
 */
               var GlobalizationError = function (code, message) {
               this.code = code || null;
               this.message = message || '';
               };
               
               // Globalization error codes
               GlobalizationError.UNKNOWN_ERROR = 0;
               GlobalizationError.FORMATTING_ERROR = 1;
               GlobalizationError.PARSING_ERROR = 2;
               GlobalizationError.PATTERN_ERROR = 3;
               
               module.exports = GlobalizationError;
               
               });


cordova.define("cordova-plugin-touch-id.TouchID", function(require, exports, module) {
	function TouchID() {
	}

	TouchID.prototype.isDeviceSupportFingerprint = function (successCallback, errorCallback) {
	  function _onError(errorObj) {
	      errorCallback(window.translateIOSErrorToGeneralMessage(errorObj));
	  }
	  cordova.exec(successCallback, _onError, "TouchID", "isAvailable", []);
	};
	               
	TouchID.prototype.SetToken = function (token,successCallback, errorCallback) {
	  cordova.exec(successCallback, errorCallback, "TouchID", "SetToken", [token]);
	};
	               
	TouchID.prototype.GetToken = function (successCallback, errorCallback) {
	    cordova.exec(successCallback, errorCallback, "TouchID", "GetToken", []);
	};

	TouchID.prototype.DeleteToken = function (successCallback, errorCallback) {
	  cordova.exec(successCallback, errorCallback, "TouchID", "DeleteToken", []);
	};
	               
	TouchID.prototype.scanCancel = function (successCallback, errorCallback) {
	  cordova.exec(successCallback, errorCallback, "TouchID", "scanCancel", []);
	};
	               
	TouchID.prototype.didFingerprintDatabaseChange = function (successCallback, errorCallback) {
	  cordova.exec(successCallback, errorCallback, "TouchID", "didFingerprintDatabaseChange", []);
	};

	TouchID.prototype.verifyFingerprint = function (message, successCallback, errorCallback) {
	  cordova.exec(successCallback, errorCallback, "TouchID", "verifyFingerprint", [message]);
	};

	TouchID.prototype.verifyFingerprintWithCustomPasswordFallback = function (message, successCallback, errorCallback) {
	  cordova.exec(successCallback, errorCallback, "TouchID", "verifyFingerprintWithCustomPasswordFallback", [message]);
	};

	TouchID.prototype.show = function (config, successCallback, errorCallback) {
      cordova.exec(successCallback, errorCallback, "TouchID", "verifyFingerprintWithCustomPasswordFallbackAndEnterPasswordLabel", [config.message, '']);
    };

	TouchID.install = function () {
	  if (!window.plugins) {
	    window.plugins = {};
	  }

	  //window.plugins.touchid = new TouchID();
	  //return window.plugins.touchid;
	  Fingerprint = new TouchID();
	  return Fingerprint;
	};

	cordova.addConstructor(TouchID.install);

});

cordova.define("cordova-plugin-globalization.globalization", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
               
               var argscheck = require('cordova/argscheck');
               var exec = require('cordova/exec');
               
               var globalization = {
               
/**
 * Returns the string identifier for the client's current language.
 * It returns the language identifier string to the successCB callback with a
 * properties object as a parameter. If there is an error getting the language,
 * then the errorCB callback is invoked.
 *
 * @param {Function} successCB
 * @param {Function} errorCB
 *
 * @return Object.value {String}: The language identifier
 *
 * @error GlobalizationError.UNKNOWN_ERROR
 *
 * Example
 *    globalization.getPreferredLanguage(function (language) {alert('language:' + language.value + '\n');},
 *                                function () {});
 */
               getPreferredLanguage: function (successCB, failureCB) {
               argscheck.checkArgs('fF', 'Globalization.getPreferredLanguage', arguments);
               exec(successCB, failureCB, 'Globalization', 'getPreferredLanguage', []);
               },
               
               /**
                * Returns the string identifier for the client's current locale setting.
                * It returns the locale identifier string to the successCB callback with a
                * properties object as a parameter. If there is an error getting the locale,
                * then the errorCB callback is invoked.
                *
                * @param {Function} successCB
                * @param {Function} errorCB
                *
                * @return Object.value {String}: The locale identifier
                *
                * @error GlobalizationError.UNKNOWN_ERROR
                *
                * Example
                *    globalization.getLocaleName(function (locale) {alert('locale:' + locale.value + '\n');},
                *                                function () {});
                */
               getLocaleName: function (successCB, failureCB) {
               argscheck.checkArgs('fF', 'Globalization.getLocaleName', arguments);
               exec(successCB, failureCB, 'Globalization', 'getLocaleName', []);
               },
               
               /**
                * Returns a date formatted as a string according to the client's user preferences and
                * calendar using the time zone of the client. It returns the formatted date string to the
                * successCB callback with a properties object as a parameter. If there is an error
                * formatting the date, then the errorCB callback is invoked.
                *
                * The defaults are: formatLenght="short" and selector="date and time"
                *
                * @param {Date} date
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            formatLength {String}: 'short', 'medium', 'long', or 'full'
                *            selector {String}: 'date', 'time', or 'date and time'
                *
                * @return Object.value {String}: The localized date string
                *
                * @error GlobalizationError.FORMATTING_ERROR
                *
                * Example
                *    globalization.dateToString(new Date(),
                *                function (date) {alert('date:' + date.value + '\n');},
                *                function (errorCode) {alert(errorCode);},
                *                {formatLength:'short'});
                */
               dateToString: function (date, successCB, failureCB, options) {
               argscheck.checkArgs('dfFO', 'Globalization.dateToString', arguments);
               var dateValue = date.valueOf();
               exec(successCB, failureCB, 'Globalization', 'dateToString', [{'date': dateValue, 'options': options}]);
               },
               
               /**
                * Parses a date formatted as a string according to the client's user
                * preferences and calendar using the time zone of the client and returns
                * the corresponding date object. It returns the date to the successCB
                * callback with a properties object as a parameter. If there is an error
                * parsing the date string, then the errorCB callback is invoked.
                *
                * The defaults are: formatLength="short" and selector="date and time"
                *
                * @param {String} dateString
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            formatLength {String}: 'short', 'medium', 'long', or 'full'
                *            selector {String}: 'date', 'time', or 'date and time'
                *
                * @return    Object.year {Number}: The four digit year
                *            Object.month {Number}: The month from (0 - 11)
                *            Object.day {Number}: The day from (1 - 31)
                *            Object.hour {Number}: The hour from (0 - 23)
                *            Object.minute {Number}: The minute from (0 - 59)
                *            Object.second {Number}: The second from (0 - 59)
                *            Object.millisecond {Number}: The milliseconds (from 0 - 999),
                *                                        not available on all platforms
                *
                * @error GlobalizationError.PARSING_ERROR
                *
                * Example
                *    globalization.stringToDate('4/11/2011',
                *                function (date) { alert('Month:' + date.month + '\n' +
                *                    'Day:' + date.day + '\n' +
                *                    'Year:' + date.year + '\n');},
                *                function (errorCode) {alert(errorCode);},
                *                {selector:'date'});
                */
               stringToDate: function (dateString, successCB, failureCB, options) {
               argscheck.checkArgs('sfFO', 'Globalization.stringToDate', arguments);
               exec(successCB, failureCB, 'Globalization', 'stringToDate', [{'dateString': dateString, 'options': options}]);
               },
               
               /**
                * Returns a pattern string for formatting and parsing dates according to the client's
                * user preferences. It returns the pattern to the successCB callback with a
                * properties object as a parameter. If there is an error obtaining the pattern,
                * then the errorCB callback is invoked.
                *
                * The defaults are: formatLength="short" and selector="date and time"
                *
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            formatLength {String}: 'short', 'medium', 'long', or 'full'
                *            selector {String}: 'date', 'time', or 'date and time'
                *
                * @return    Object.pattern {String}: The date and time pattern for formatting and parsing dates.
                *                                    The patterns follow Unicode Technical Standard #35
                *                                    http://unicode.org/reports/tr35/tr35-4.html
                *            Object.timezone {String}: The abbreviated name of the time zone on the client
                *            Object.utc_offset {Number}: The current difference in seconds between the client's
                *                                        time zone and coordinated universal time.
                *            Object.dst_offset {Number}: The current daylight saving time offset in seconds
                *                                        between the client's non-daylight saving's time zone
                *                                        and the client's daylight saving's time zone.
                *
                * @error GlobalizationError.PATTERN_ERROR
                *
                * Example
                *    globalization.getDatePattern(
                *                function (date) {alert('pattern:' + date.pattern + '\n');},
                *                function () {},
                *                {formatLength:'short'});
                */
               getDatePattern: function (successCB, failureCB, options) {
               argscheck.checkArgs('fFO', 'Globalization.getDatePattern', arguments);
               exec(successCB, failureCB, 'Globalization', 'getDatePattern', [{'options': options}]);
               },
               
               /**
                * Returns an array of either the names of the months or days of the week
                * according to the client's user preferences and calendar. It returns the array of names to the
                * successCB callback with a properties object as a parameter. If there is an error obtaining the
                * names, then the errorCB callback is invoked.
                *
                * The defaults are: type="wide" and item="months"
                *
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            type {String}: 'narrow' or 'wide'
                *            item {String}: 'months', or 'days'
                *
                * @return Object.value {Array{String}}: The array of names starting from either
                *                                        the first month in the year or the
                *                                        first day of the week.
                * @error GlobalizationError.UNKNOWN_ERROR
                *
                * Example
                *    globalization.getDateNames(function (names) {
                *        for(var i = 0; i < names.value.length; i++) {
                *            alert('Month:' + names.value[i] + '\n');}},
                *        function () {});
                */
               getDateNames: function (successCB, failureCB, options) {
               argscheck.checkArgs('fFO', 'Globalization.getDateNames', arguments);
               exec(successCB, failureCB, 'Globalization', 'getDateNames', [{'options': options}]);
               },
               
               /**
                * Returns whether daylight savings time is in effect for a given date using the client's
                * time zone and calendar. It returns whether or not daylight savings time is in effect
                * to the successCB callback with a properties object as a parameter. If there is an error
                * reading the date, then the errorCB callback is invoked.
                *
                * @param {Date} date
                * @param {Function} successCB
                * @param {Function} errorCB
                *
                * @return Object.dst {Boolean}: The value "true" indicates that daylight savings time is
                *                                in effect for the given date and "false" indicate that it is not.
                *
                * @error GlobalizationError.UNKNOWN_ERROR
                *
                * Example
                *    globalization.isDayLightSavingsTime(new Date(),
                *                function (date) {alert('dst:' + date.dst + '\n');}
                *                function () {});
                */
               isDayLightSavingsTime: function (date, successCB, failureCB) {
               argscheck.checkArgs('dfF', 'Globalization.isDayLightSavingsTime', arguments);
               var dateValue = date.valueOf();
               exec(successCB, failureCB, 'Globalization', 'isDayLightSavingsTime', [{'date': dateValue}]);
               },
               
               /**
                * Returns the first day of the week according to the client's user preferences and calendar.
                * The days of the week are numbered starting from 1 where 1 is considered to be Sunday.
                * It returns the day to the successCB callback with a properties object as a parameter.
                * If there is an error obtaining the pattern, then the errorCB callback is invoked.
                *
                * @param {Function} successCB
                * @param {Function} errorCB
                *
                * @return Object.value {Number}: The number of the first day of the week.
                *
                * @error GlobalizationError.UNKNOWN_ERROR
                *
                * Example
                *    globalization.getFirstDayOfWeek(function (day)
                *                { alert('Day:' + day.value + '\n');},
                *                function () {});
                */
               getFirstDayOfWeek: function (successCB, failureCB) {
               argscheck.checkArgs('fF', 'Globalization.getFirstDayOfWeek', arguments);
               exec(successCB, failureCB, 'Globalization', 'getFirstDayOfWeek', []);
               },
               
               /**
                * Returns a number formatted as a string according to the client's user preferences.
                * It returns the formatted number string to the successCB callback with a properties object as a
                * parameter. If there is an error formatting the number, then the errorCB callback is invoked.
                *
                * The defaults are: type="decimal"
                *
                * @param {Number} number
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            type {String}: 'decimal', "percent", or 'currency'
                *
                * @return Object.value {String}: The formatted number string.
                *
                * @error GlobalizationError.FORMATTING_ERROR
                *
                * Example
                *    globalization.numberToString(3.25,
                *                function (number) {alert('number:' + number.value + '\n');},
                *                function () {},
                *                {type:'decimal'});
                */
               numberToString: function (number, successCB, failureCB, options) {
               argscheck.checkArgs('nfFO', 'Globalization.numberToString', arguments);
               exec(successCB, failureCB, 'Globalization', 'numberToString', [{'number': number, 'options': options}]);
               },
               
               /**
                * Parses a number formatted as a string according to the client's user preferences and
                * returns the corresponding number. It returns the number to the successCB callback with a
                * properties object as a parameter. If there is an error parsing the number string, then
                * the errorCB callback is invoked.
                *
                * The defaults are: type="decimal"
                *
                * @param {String} numberString
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            type {String}: 'decimal', "percent", or 'currency'
                *
                * @return Object.value {Number}: The parsed number.
                *
                * @error GlobalizationError.PARSING_ERROR
                *
                * Example
                *    globalization.stringToNumber('1234.56',
                *                function (number) {alert('Number:' + number.value + '\n');},
                *                function () { alert('Error parsing number');});
                */
               stringToNumber: function (numberString, successCB, failureCB, options) {
               argscheck.checkArgs('sfFO', 'Globalization.stringToNumber', arguments);
               exec(successCB, failureCB, 'Globalization', 'stringToNumber', [{'numberString': numberString, 'options': options}]);
               },
               
               /**
                * Returns a pattern string for formatting and parsing numbers according to the client's user
                * preferences. It returns the pattern to the successCB callback with a properties object as a
                * parameter. If there is an error obtaining the pattern, then the errorCB callback is invoked.
                *
                * The defaults are: type="decimal"
                *
                * @param {Function} successCB
                * @param {Function} errorCB
                * @param {Object} options {optional}
                *            type {String}: 'decimal', "percent", or 'currency'
                *
                * @return    Object.pattern {String}: The number pattern for formatting and parsing numbers.
                *                                    The patterns follow Unicode Technical Standard #35.
                *                                    http://unicode.org/reports/tr35/tr35-4.html
                *            Object.symbol {String}: The symbol to be used when formatting and parsing
                *                                    e.g., percent or currency symbol.
                *            Object.fraction {Number}: The number of fractional digits to use when parsing and
                *                                    formatting numbers.
                *            Object.rounding {Number}: The rounding increment to use when parsing and formatting.
                *            Object.positive {String}: The symbol to use for positive numbers when parsing and formatting.
                *            Object.negative: {String}: The symbol to use for negative numbers when parsing and formatting.
                *            Object.decimal: {String}: The decimal symbol to use for parsing and formatting.
                *            Object.grouping: {String}: The grouping symbol to use for parsing and formatting.
                *
                * @error GlobalizationError.PATTERN_ERROR
                *
                * Example
                *    globalization.getNumberPattern(
                *                function (pattern) {alert('Pattern:' + pattern.pattern + '\n');},
                *                function () {});
                */
               getNumberPattern: function (successCB, failureCB, options) {
               argscheck.checkArgs('fFO', 'Globalization.getNumberPattern', arguments);
               exec(successCB, failureCB, 'Globalization', 'getNumberPattern', [{'options': options}]);
               },
               
               /**
                * Returns a pattern string for formatting and parsing currency values according to the client's
                * user preferences and ISO 4217 currency code. It returns the pattern to the successCB callback with a
                * properties object as a parameter. If there is an error obtaining the pattern, then the errorCB
                * callback is invoked.
                *
                * @param {String} currencyCode
                * @param {Function} successCB
                * @param {Function} errorCB
                *
                * @return    Object.pattern {String}: The currency pattern for formatting and parsing currency values.
                *                                    The patterns follow Unicode Technical Standard #35
                *                                    http://unicode.org/reports/tr35/tr35-4.html
                *            Object.code {String}: The ISO 4217 currency code for the pattern.
                *            Object.fraction {Number}: The number of fractional digits to use when parsing and
                *                                    formatting currency.
                *            Object.rounding {Number}: The rounding increment to use when parsing and formatting.
                *            Object.decimal: {String}: The decimal symbol to use for parsing and formatting.
                *            Object.grouping: {String}: The grouping symbol to use for parsing and formatting.
                *
                * @error GlobalizationError.FORMATTING_ERROR
                *
                * Example
                *    globalization.getCurrencyPattern('EUR',
                *                function (currency) {alert('Pattern:' + currency.pattern + '\n');}
                *                function () {});
                */
               getCurrencyPattern: function (currencyCode, successCB, failureCB) {
               argscheck.checkArgs('sfF', 'Globalization.getCurrencyPattern', arguments);
               exec(successCB, failureCB, 'Globalization', 'getCurrencyPattern', [{'currencyCode': currencyCode}]);
               }
               
               };
               
               module.exports = globalization;
               
               });

cordova.define("cordova-plugin-apprate.AppRate", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */;
               var AppRate, Locales, localeObj, exec, Storage;
               
               Locales = require('./locales');
               
               exec = require('cordova/exec');
               
               Storage = require('./storage')
               
               AppRate = (function() {
                          var FLAG_NATIVE_CODE_SUPPORTED, LOCAL_STORAGE_COUNTER, PREF_STORE_URL_FORMAT_IOS, counter, getAppTitle, getAppVersion, promptForRatingWindowButtonClickHandler, showDialog, updateCounter;
                          
                          function AppRate() {}
                          
                          LOCAL_STORAGE_COUNTER = 'counter';
                          LOCAL_STORAGE_IOS_RATING = 'iosRating';
                          
                          FLAG_NATIVE_CODE_SUPPORTED = /(iPhone|iPod|iPad|Android)/i.test(navigator.userAgent.toLowerCase());
                          
                          PREF_STORE_URL_PREFIX_IOS9 = "itms-apps://itunes.apple.com/app/viewContentsUserReviews/id";
                          PREF_STORE_URL_POSTFIX_IOS9 = "?action=write-review";
                          PREF_STORE_URL_FORMAT_IOS8 = "http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?pageNumber=0&sortOrdering=1&type=Purple+Software&mt=8&id=";
                          
                          counter = {
                          applicationVersion: void 0,
                          countdown: 0
                          };
                          
                          var iOSRating = {
                          timesPrompted: 0,
                          lastPromptDate: null
                          };
                          
                          promptForAppRatingWindowButtonClickHandler = function (buttonIndex) {
                          var base = AppRate.preferences.callbacks, currentBtn = null;
                          switch (buttonIndex) {
                          case 0:
                          updateCounter('reset');
                          break;
                          case 1:
                          currentBtn = localeObj.noButtonLabel;
                          if(typeof base.handleNegativeFeedback === "function") {
                          navigator.notification.confirm(localeObj.feedbackPromptMessage, promptForFeedbackWindowButtonClickHandler, localeObj.feedbackPromptTitle, [localeObj.noButtonLabel, localeObj.yesButtonLabel]);
                          }
                          break;
                          case 2:
                          currentBtn = localeObj.yesButtonLabel;
                          navigator.notification.confirm(localeObj.message, promptForStoreRatingWindowButtonClickHandler, localeObj.title, [localeObj.cancelButtonLabel, localeObj.laterButtonLabel, localeObj.rateButtonLabel])
                          break;
                          }
                          return typeof base.onButtonClicked === "function" ? base.onButtonClicked(buttonIndex, currentBtn, "AppRatingPrompt") : function(){ };
                          };
                          
                          promptForStoreRatingWindowButtonClickHandler = function(buttonIndex) {
                          var base = AppRate.preferences.callbacks, currentBtn = null;
                          switch (buttonIndex) {
                          case 0:
                          updateCounter('reset');
                          break;
                          case 1:
                          currentBtn = localeObj.cancelButtonLabel;
                          updateCounter('stop');
                          break;
                          case 2:
                          currentBtn = localeObj.laterButtonLabel;
                          updateCounter('reset');
                          break;
                          case 3:
                          currentBtn = localeObj.rateButtonLabel;
                          updateCounter('stop');
                          AppRate.navigateToAppStore();
                          break;
                          }
                          //This is called only in case the user clicked on a button
                          typeof base.onButtonClicked === "function" ? base.onButtonClicked(buttonIndex, currentBtn, "StoreRatingPrompt") : function(){ };
                          //This one is called anyway once the process is done
                          return typeof base.done === "function" ? base.done() : function(){ };
                          };
                          
                          promptForFeedbackWindowButtonClickHandler = function(buttonIndex) {
                          var base = AppRate.preferences.callbacks, currentBtn = null;
                          switch (buttonIndex) {
                          case 1:
                          currentBtn = localeObj.noButtonLabel;
                          updateCounter('stop');
                          break;
                          case 2:
                          currentBtn = localeObj.yesButtonLabel;
                          updateCounter('stop');
                          base.handleNegativeFeedback();
                          break;
                          }
                          return typeof base.onButtonClicked === "function" ? base.onButtonClicked(buttonIndex, currentBtn, "FeedbackPrompt") : function(){ };
                          };
                          
                          updateCounter = function(action) {
                          if (action == null) {
                          action = 'increment';
                          }
                          switch (action) {
                          case 'increment':
                          if (counter.countdown <= AppRate.preferences.usesUntilPrompt) {
                          counter.countdown++;
                          }
                          break;
                          case 'reset':
                          counter.countdown = 0;
                          break;
                          case 'stop':
                          counter.countdown = AppRate.preferences.usesUntilPrompt + 1;
                          }
                          Storage.set(LOCAL_STORAGE_COUNTER, counter);
                          return counter;
                          };
                          
                          updateiOSRatingData = function() {
                          if (checkIfDateIsAfter(iOSRating.lastPromptDate, 365)) {
                          iOSRating.timesPrompted = 0;
                          }
                          
                          iOSRating.timesPrompted++;
                          iOSRating.lastPromptDate = new Date();
                          
                          Storage.set(LOCAL_STORAGE_IOS_RATING, iOSRating);
                          }
                          
                          showDialog = function(immediately) {
                          var base = AppRate.preferences.callbacks;
                          if (counter.countdown === AppRate.preferences.usesUntilPrompt || immediately) {
                          localeObj = Locales.getLocale(AppRate.preferences.useLanguage, AppRate.preferences.displayAppName, AppRate.preferences.customLocale);
                          
                          if(AppRate.preferences.simpleMode) {
                          navigator.notification.confirm(localeObj.message, promptForStoreRatingWindowButtonClickHandler, localeObj.title, [localeObj.cancelButtonLabel, localeObj.laterButtonLabel, localeObj.rateButtonLabel]);
                          } else {
                          navigator.notification.confirm(localeObj.appRatePromptMessage, promptForAppRatingWindowButtonClickHandler, localeObj.appRatePromptTitle, [localeObj.noButtonLabel, localeObj.yesButtonLabel]);
                          }
                          
                          if (typeof base.onRateDialogShow === "function") {
                          base.onRateDialogShow(promptForStoreRatingWindowButtonClickHandler);
                          }
                          }
                          return AppRate;
                          };
                          
                          getAppVersion = function(successCallback, errorCallback) {
                          if (FLAG_NATIVE_CODE_SUPPORTED) {
                          exec(successCallback, errorCallback, 'AppRate', 'getAppVersion', []);
                          } else {
                          successCallback(counter.applicationVersion);
                          }
                          return AppRate;
                          };
                          
                          getAppTitle = function(successCallback, errorCallback) {
                          if (FLAG_NATIVE_CODE_SUPPORTED) {
                          exec(successCallback, errorCallback, 'AppRate', 'getAppTitle', []);
                          } else {
                          successCallback(AppRate.preferences.displayAppName);
                          }
                          return AppRate;
                          };
                          
                          AppRate.init = function() {
                          AppRate.ready = Promise.all([
                                                       Storage.get(LOCAL_STORAGE_COUNTER).then(function (storedCounter) {
                                                                                               counter = storedCounter || counter
                                                                                               }),
                                                       Storage.get(LOCAL_STORAGE_IOS_RATING).then(function (storedRating) {
                                                                                                  iOSRating = storedRating || iOSRating
                                                                                                  
                                                                                                  if (iOSRating.lastPromptDate) {
                                                                                                  iOSRating.lastPromptDate = new Date(iOSRating.lastPromptDate);
                                                                                                  }
                                                                                                  })
                                                       ])
                          
                          getAppVersion((function(_this) {
                                         return function(applicationVersion) {
                                         if (counter.applicationVersion !== applicationVersion) {
                                         counter.applicationVersion = applicationVersion;
                                         if (_this.preferences.promptAgainForEachNewVersion) {
                                         updateCounter('reset');
                                         }
                                         }
                                         return _this;
                                         };
                                         })(this));
                          getAppTitle((function(_this) {
                                       return function(displayAppName) {
                                       _this.preferences.displayAppName = displayAppName;
                                       return _this;
                                       };
                                       })(this));
                          return this;
                          };
                          
                          AppRate.locales = Locales;
                          
                          // test eyal - apprate
                          /*
                           
                           AppRate.preferences = {
                           useLanguage: null,
                           displayAppName: '',
                           simpleMode: false,
                           promptAgainForEachNewVersion: true,
                           usesUntilPrompt: 3,
                           inAppReview: true,
                           callbacks: {
                           onButtonClicked: null,
                           onRateDialogShow: null,
                           handleNegativeFeedback: null,
                           done: null
                           },
                           storeAppURL: {
                           // test eyal - apprate
                           ios: '1352785967',
                           android: null,
                           blackberry: null,
                           windows8: null,
                           windows: null
                           },
                           customLocale: null
                           };
                           */
                          
                          // test eyal - apprate
                          AppRate.preferences = {
                          displayAppName: 'My custom app title',
                          simpleMode: true,
                          useCustomRateDialog: true,
                          usesUntilPrompt: 1,
                          promptAgainForEachNewVersion: true,
                          inAppReview: true,
                          storeAppURL: {
                          ios: '1232534951',
                          android: 'market://details?id=<package_name>',
                          windows: 'ms-windows-store://pdp/?ProductId=<the apps Store ID>',
                          blackberry: 'appworld://content/[App Id]/',
                          windows8: 'ms-windows-store:Review?name=<the Package Family Name of the application>'
                          },
                          
                          customLocale: {
                          title: "Would you mind rating %@?",
                          message: "It wont take more than a minute and helps to promote our app. Thanks for your support!",
                          cancelButtonLabel: "No, Thanks",
                          laterButtonLabel: "Remind Me Later",
                          rateButtonLabel: "Rate It Now",
                          yesButtonLabel: "Yes!",
                          noButtonLabel: "Not really",
                          appRatePromptTitle: 'Do you like using %@',
                          feedbackPromptTitle: 'Mind giving us some feedback?',
                          },
                          
                          callbacks: {
                          handleNegativeFeedback: function(){
                          window.open('mailto:feedback@example.com','_system');
                          },
                          /*
                           onRateDialogShow: function(callback){
                           callback(1) // cause immediate click on 'Rate Now' button
                           },
                           */
                          onRateDialogShow: null,
                          onButtonClicked: function(buttonIndex){
                          console.log("onButtonClicked -> " + buttonIndex);
                          }
                          }
                          
                          
                          
                          };
                          
                          AppRate.promptForRating = function(immediately) {
                          AppRate.ready.then(function() {
                                             if (immediately == null) {
                                             immediately = true;
                                             }
                                             if (AppRate.preferences.useLanguage === null) {
                                             navigator.globalization.getPreferredLanguage((function(_this) {
                                                                                           return function(language) {
                                                                                           _this.preferences.useLanguage = language.value;
                                                                                           return showDialog(immediately);
                                                                                           };
                                                                                           })(AppRate));
                                             } else {
                                             showDialog(immediately);
                                             }
                                             updateCounter();
                                             });
                          return this;
                          };
                          
                          AppRate.navigateToAppStore = function(successCallback, errorCallback) {
                          var iOSVersion;
                          var iOSStoreUrl;
                          
                          if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent.toLowerCase())) {
                          if (this.preferences.inAppReview) {
                          updateiOSRatingData();
                          // test eyal - apprate - many times! - changes when needed
                          var showNativePrompt = iOSRating.timesPrompted < 4;
                          
                          // test eyal - apprate - orig function
                          //exec(null, null, 'AppRate', 'launchiOSReview', [this.preferences.storeAppURL.ios, showNativePrompt]);
                          // test eyal - apprate - with callbacks
                          exec(successCallback, errorCallback, 'AppRate', 'launchiOSReview', [this.preferences.storeAppURL.ios, showNativePrompt]);
                          
                          } else {
                          iOSVersion = navigator.userAgent.match(/OS\s+([\d\_]+)/i)[0].replace(/_/g, '.').replace('OS ', '').split('.');
                          iOSVersion = parseInt(iOSVersion[0]) + (parseInt(iOSVersion[1]) || 0) / 10;
                          if (iOSVersion < 9) {
                          iOSStoreUrl = PREF_STORE_URL_FORMAT_IOS8 + this.preferences.storeAppURL.ios;
                          } else {
                          iOSStoreUrl = PREF_STORE_URL_PREFIX_IOS9 + this.preferences.storeAppURL.ios + PREF_STORE_URL_POSTFIX_IOS9;
                          }
                          cordova.InAppBrowser.open(iOSStoreUrl, '_system', 'location=no');
                          }
                          } else if (/(Android)/i.test(navigator.userAgent.toLowerCase())) {
                          cordova.InAppBrowser.open(this.preferences.storeAppURL.android, '_system', 'location=no');
                          } else if (/(Windows|Edge)/i.test(navigator.userAgent.toLowerCase())) {
                          cordova.InAppBrowser.open(this.preferences.storeAppURL.windows, '_blank', 'location=no');
                          } else if (/(BlackBerry)/i.test(navigator.userAgent.toLowerCase())) {
                          cordova.InAppBrowser.open(this.preferences.storeAppURL.blackberry, '_system', 'location=no');
                          } else if (/(IEMobile|Windows Phone)/i.test(navigator.userAgent.toLowerCase())) {
                          cordova.InAppBrowser.open(this.preferences.storeAppURL.windows8, '_system', 'location=no');
                          }
                          return this;
                          };
                          
                          return AppRate;
                          
                          })();
               
               AppRate.init();
               
               function checkIfDateIsAfter(date, minimumDifference) {
               if (!date) {
               return false;
               }
               
               var dateTimestamp = date.getTime();
               var todayTimestamp = new Date().getTime();
               var differenceInDays = Math.abs((todayTimestamp - dateTimestamp) / (3600 * 24 * 1000));
               
               return differenceInDays > minimumDifference;
               }
               
               module.exports = AppRate;
               
               });

cordova.define("cordova-plugin-apprate.locales", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
               ;
               var Locale, Locales;
               
               Locale = (function () {
                         function Locale(arg) {
                         for (var index in arg) {
                         if (arg.hasOwnProperty(index)) {
                         this[index] = arg[index] || '';
                         }
                         }
                         this;
                         }
                         
                         return Locale;
                         
                         })();
               
               Locales = (function() {
                          var LOCALE_DEFAULT, locales;
                          
                          function Locales() {}
                          
                          LOCALE_DEFAULT = 'en';
                          
                          locales = {};
                          
                          Locales.addLocale = function(localeObject) {
                          return locales[localeObject.language] = localeObject;
                          };
                          
                          Locales.getLocale = function(language, applicationTitle, customLocale) {
                          var localeObject;
                          if (applicationTitle == null) {
                          applicationTitle = '';
                          }
                          localeObject = customLocale || locales[language] || locales[language.split(/-/)[0]] || locales[LOCALE_DEFAULT];
                          localeObject.title = localeObject.title.replace(/%@/g, applicationTitle);
                          localeObject.appRatePromptTitle = (localeObject.appRatePromptTitle || '').replace(/%@/g, applicationTitle);
                          localeObject.feedbackPromptTitle = (localeObject.feedbackPromptTitle || '').replace(/%@/g, applicationTitle);
                          localeObject.appRatePromptMessage = (localeObject.appRatePromptMessage || '').replace(/%@/g, applicationTitle);
                          localeObject.feedbackPromptMessage = (localeObject.feedbackPromptMessage || '').replace(/%@/g, applicationTitle);
                          localeObject.message = localeObject.message.replace(/%@/g, applicationTitle);
                          return localeObject;
                          };
                          
                          Locales.getLocalesNames = function () {
                          var locale, results;
                          results = [];
                          for (locale in locales) {
                          results.push(locale);
                          }
                          return results;
                          };
                          
                          return Locales;
                          
                          })();
               
               Locales.addLocale(new Locale({
                                            language: 'ar',
                                            title: "قيِّم %@",
                                            message: "إذا أعجبك برنامج %@، هل تمانع من أخذ دقيقة لتقييمه؟ شكرا لدعمك",
                                            cancelButtonLabel: "لا، شكراً",
                                            laterButtonLabel: "ذكرني لاحقاً",
                                            rateButtonLabel: "قيم البرنامج الآن"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'bn',
                                            title: "রেট %@",
                                            message: "আপনি %@ ব্যবহার করে ভোগ, আপনি এটি রেট একটি মুহূর্ত গ্রহণ কিছু মনে করবে? এটি একটি মিনিট চেয়ে বেশি গ্রহণ করা হবে না. আপনার সমর্থনের জন্য ধন্যবাদ!",
                                            cancelButtonLabel: "না, ধন্যবাদ",
                                            laterButtonLabel: "পরে আমাকে মনে করিয়ে দিন",
                                            rateButtonLabel: "এখন এটি রেটিং করুন"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'bn',
                                            title: "রেট %@",
                                            message: "আপনি %@ ব্যবহার করে ভোগ, আপনি এটি রেট একটি মুহূর্ত গ্রহণ কিছু মনে করবে? এটি একটি মিনিট চেয়ে বেশি গ্রহণ করা হবে না. আপনার সমর্থনের জন্য ধন্যবাদ!",
                                            cancelButtonLabel: "না, ধন্যবাদ",
                                            laterButtonLabel: "পরে আমাকে মনে করিয়ে দিন",
                                            rateButtonLabel: "এখন এটি রেটিং করুন"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ca',
                                            title: "Ressenya %@",
                                            message: "Si t'agrada %@, podries escriure una ressenya? No et prendrà més d'un minut. Gràcies pel teu suport!",
                                            cancelButtonLabel: "No, gràcies",
                                            laterButtonLabel: "Recorda-m'ho més tard",
                                            rateButtonLabel: "Escriure una ressenya ara"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'cs',
                                            title: "Ohodnotit %@",
                                            message: "Pokud se vám líbí %@, našli byste si chvilku na ohodnocení aplikace? Nebude to trvat víc než minutu.\nDěkujeme za vaši podporu!",
                                            cancelButtonLabel: "Ne, děkuji",
                                            laterButtonLabel: "Připomenout později",
                                            rateButtonLabel: "Ohodnotit nyní"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'da',
                                            title: "Vurdér %@",
                                            message: "Hvis du kan lide at bruge %@, vil du så ikke bruge et øjeblik på at give en vurdering? Det tager ikke mere end et minut. Mange tak for hjælpen!",
                                            cancelButtonLabel: "Nej tak",
                                            laterButtonLabel: "Påmind mig senere",
                                            rateButtonLabel: "Vurdér nu"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'de',
                                            title: "Bewerte %@",
                                            message: "Wenn dir %@ gefällt, würdest Du es bitte bewerten? Dies wird nicht länger als eine Minute dauern. Danke für die Unterstützung!",
                                            cancelButtonLabel: "Nein, danke",
                                            laterButtonLabel: "Später erinnern",
                                            rateButtonLabel: "Jetzt bewerten"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'de-AT',
                                            title: "Bewerte %@",
                                            message: "Wenn dir %@ gefällt, würdest Du es bitte bewerten? Dies wird nicht länger als eine Minute dauern.\nDanke für die Unterstützung!",
                                            cancelButtonLabel: "Nein, danke",
                                            laterButtonLabel: "Später erinnern",
                                            rateButtonLabel: "Jetzt bewerten"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'el',
                                            title: "Αξιολόγησε %@",
                                            message: "Αν σ' αρέσει η εφαρμογή %@, θα μπορούσες να αφιερώσεις ένα δευτερόλεπτο για να την αξιολογήσεις; Ευχαριστούμε για την υποστήριξη!",
                                            cancelButtonLabel: "Όχι, ευχαριστώ",
                                            laterButtonLabel: "Υπενθύμιση αργότερα",
                                            rateButtonLabel: "Αξιολόγησε τώρα"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'en',
                                            title: "Would you mind rating %@?",
                                            message: "It won’t take more than a minute and helps to promote our app. Thanks for your support!",
                                            cancelButtonLabel: "No, Thanks",
                                            laterButtonLabel: "Remind Me Later",
                                            rateButtonLabel: "Rate It Now",
                                            yesButtonLabel: "Yes!",
                                            noButtonLabel: "Not really",
                                            appRatePromptTitle: 'Do you like using %@',
                                            feedbackPromptTitle: 'Mind giving us some feedback?',
                                            appRatePromptMessage:'',
                                            feedbackPromptMessage:''
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'es',
                                            title: "Reseña %@",
                                            message: "Si te gusta %@, ¿podrías escribirnos una reseña? No te tomará más de un minuto. ¡Gracias por tu apoyo!",
                                            cancelButtonLabel: "No, gracias",
                                            laterButtonLabel: "Recordarme más tarde",
                                            rateButtonLabel: "Escribir reseña ahora"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'fa',
                                            title: "نرخ %@",
                                            message: "اگر شما با استفاده از %@ لذت بردن از، اشکالی ندارد یک لحظه به امتیاز دهی هستند؟ آن را نمی خواهد بیشتر از یک دقیقه طول بکشد. با تشکر از حمایت شما!",
                                            cancelButtonLabel: "نه، با تشکر",
                                            laterButtonLabel: "یادآوری من بعد",
                                            rateButtonLabel: "آن را دوست ندارم حالا"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'fi',
                                            title: "Arvostele %@",
                                            message: "Jos tykkäät %@ sovelluksesta, haluatko kirjoittaa sille arvostelun? Arvostelun kirjoittamiseen ei mene montaa minuuttia. Kiitos tuestasi!",
                                            cancelButtonLabel: "Ei kiitos",
                                            laterButtonLabel: "Muistuta minua myöhemmin",
                                            rateButtonLabel: "Arvostele nyt"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'fr',
                                            title: "Notez %@",
                                            message: "Si vous aimez utiliser %@, n’oubliez pas de voter sur l’App Store. Cela ne prend qu’une minute. Merci d’avance pour votre soutien !",
                                            cancelButtonLabel: "Non, merci",
                                            laterButtonLabel: "Me le rappeler ultérieurement",
                                            rateButtonLabel: "Votez maintenant"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'he',
                                            title: "דרג את %@",
                                            message: "אם אתה נהנה להשתמש ב- %@, אתה מוכן לקחת רגע כדי לדרג את התוכנה? זה לא ייקח יותר מדקה. תודה על התמיכה!",
                                            cancelButtonLabel: "לא, תודה",
                                            laterButtonLabel: "הזכר לי מאוחר יותר",
                                            rateButtonLabel: "דרג עכשיו"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'hi',
                                            title: "दर %@",
                                            message: "आप %@ उपयोग का आनंद ले, तो आप यह दर क्षण ले मन होगा? यह एक मिनट से अधिक नहीं ले जाएगा. आपके समर्थन के लिए धन्यवाद!",
                                            cancelButtonLabel: "नहीं, धन्यवाद",
                                            laterButtonLabel: "मुझे बाद में याद दिलाएं",
                                            rateButtonLabel: "अब यह दर"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'id',
                                            title: "Beri Nilai %@",
                                            message: "Jika anda senang menggunakan %@, maukah anda memberikan nilai? Ini Hanya Sebentar. Terima kasih atas dukungan Anda!",
                                            cancelButtonLabel: "Tidak, Terimakasih",
                                            laterButtonLabel: "Ingatkan saya lagi",
                                            rateButtonLabel: "Berikan nilai sekarang!"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'it',
                                            title: "Valuta %@",
                                            message: "Ti piace %@? Puoi dare il tuo voto nello store. Ti basterà un minuto! Grazie!",
                                            cancelButtonLabel: "No, grazie",
                                            laterButtonLabel: "Più tardi",
                                            rateButtonLabel: "Valuta ora"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ja',
                                            title: "%@の評価",
                                            message: "%@をお使いいただき大変ありがとうございます。もしよろしければ1分程で済みますので、このアプリの評価をお願いします。ご協力感謝いたします！",
                                            cancelButtonLabel: "いえ、結構です",
                                            laterButtonLabel: "後でする",
                                            rateButtonLabel: "今すぐ評価する"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ko',
                                            title: "%@ 평가하기",
                                            message: "%@ 앱을 사용해 보신 소감이 어떠신가요? 리뷰 작성을 부탁 드립니다. 길어도 1분이면 작성하실 수 있을 것입니다. 도움 감사 드립니다.",
                                            cancelButtonLabel: "괜찮습니다",
                                            laterButtonLabel: "나중에 다시 알림",
                                            rateButtonLabel: "지금 평가하기"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'nl',
                                            title: "Beoordeel %@",
                                            message: "Als het gebruik van %@ je bevalt, wil je dan een moment nemen om het te beoordelen? Het duurt nog geen minuut. Bedankt voor je steun!",
                                            cancelButtonLabel: "Nee, bedankt",
                                            laterButtonLabel: "Herinner me er later aan",
                                            rateButtonLabel: "Beoordeel nu"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'no',
                                            title: "Vurder %@",
                                            message: "Hvis du liker å bruke %@, ville du vært grei å vurdere appen? Det vil ikke ta mer enn et minutt. Takk for hjelpen!",
                                            cancelButtonLabel: "Ellers takk",
                                            laterButtonLabel: "Påminn meg senere",
                                            rateButtonLabel: "Vurder nå"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'pa',
                                            title: "ਦਰ %@",
                                            message: "ਤੁਹਾਨੂੰ %@ ਵਰਤ ਆਨੰਦ ਹੋ, ਤੁਹਾਨੂੰ ਇਸ ਨੂੰ ਦਾ ਦਰਜਾ ਦਿੰਦੇ ਹਨ ਕਰਨ ਲਈ ਇੱਕ ਪਲ ਲੈ ਕੇ ਯਾਦ ਹੋਵੇਗਾ? ਇਸ ਨੂੰ ਇੱਕ ਮਿੰਟ ਵੀ ਵੱਧ ਲੱਗ ਨਹ ਹੋਵੇਗਾ. ਤੁਹਾਡੇ ਸਹਿਯੋਗ ਲਈ ਲਈ ਧੰਨਵਾਦ!",
                                            cancelButtonLabel: "ਕੋਈ, ਦਾ ਧੰਨਵਾਦ ਹੈ",
                                            laterButtonLabel: "ਮੈਨੂੰ ਬਾਅਦ ਵਿੱਚ ਯਾਦ",
                                            rateButtonLabel: "ਹੁਣ ਇਹ ਦਰ ਨੂੰ"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'pl',
                                            title: "Oceń %@",
                                            message: "Jeśli lubisz %@, czy mógłbyś poświęcić chwilę na ocenienie? To nie zajmie więcej niż minutę. Dziękujemy za wsparcie!",
                                            cancelButtonLabel: "Nie, dziękuję",
                                            laterButtonLabel: "Przypomnij później",
                                            rateButtonLabel: "Oceń teraz"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'pt',
                                            title: "Avaliar %@",
                                            message: "Se você gostou de usar o %@, você se importaria de avaliá-lo? Não vai demorar mais de um minuto. Obrigado por seu apoio!",
                                            cancelButtonLabel: "Não, obrigado",
                                            laterButtonLabel: "Lembrar mais tarde",
                                            rateButtonLabel: "Avaliar Agora",
                                            yesButtonLabel: "Sim!",
                                            noButtonLabel: "Não",
                                            appRatePromptTitle: "Você gosta de usar %@",
                                            feedbackPromptTitle: "Poderia nos dar um feedback?",
                                            appRatePromptMessage: "",
                                            feedbackPromptMessage: ""
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'pt-PT',
                                            title: "Avaliar %@",
                                            message: "Se gostou de utilizar o %@, importa-se de o avaliar? Não vai demorar mais do que um minuto. Obrigado pelo seu apoio!",
                                            cancelButtonLabel: "Não, obrigado",
                                            laterButtonLabel: "Lembrar mais tarde",
                                            rateButtonLabel: "Avaliar agora",
                                            yesButtonLabel: "Sim!",
                                            noButtonLabel: "Não",
                                            appRatePromptTitle: "Você gosta de utilizar %@",
                                            feedbackPromptTitle: "Poderia nos dar um feedback?",
                                            appRatePromptMessage: "",
                                            feedbackPromptMessage: ""
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ru',
                                            title: "Оцените %@",
                                            message: "Если вам нравится пользоваться %@, не будете ли вы возражать против того, чтобы уделить минуту и оценить его?\nСпасибо вам за поддержку!",
                                            cancelButtonLabel: "Нет, спасибо",
                                            laterButtonLabel: "Напомнить позже",
                                            rateButtonLabel: "Оценить сейчас"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'sk',
                                            title: "Ohodnotiť %@",
                                            message: "Ak sa vám páči %@, našli by ste si chvíľku na ohodnotenie aplikácie? Nebude to trvať viac ako minútu.\nĎakujeme za vašu podporu!",
                                            cancelButtonLabel: "Nie, Ďakujem",
                                            laterButtonLabel: "Pripomenúť neskôr",
                                            rateButtonLabel: "Ohodnotiť teraz"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'sl',
                                            title: "Oceni %@",
                                            message: "Če vam je %@ všeč, bi vas prosili, da si vzamete moment in ocenite? Ne bo vam vzelo več kot minuto. Hvala za vašo podporo!",
                                            cancelButtonLabel: "Ne, hvala",
                                            laterButtonLabel: "Spomni me kasneje",
                                            rateButtonLabel: "Oceni zdaj"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'sv',
                                            title: "Betygsätt %@",
                                            message: "Gillar du %@ och kan tänka dig att betygsätta den? Det tar inte mer än en minut. Tack för ditt stöd!",
                                            cancelButtonLabel: "Nej tack",
                                            laterButtonLabel: "Påminn mig senare",
                                            rateButtonLabel: "Betygsätt nu!"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ta',
                                            title: "%@ மதிப்பிடு",
                                            message: "%@ பிடித்திருந்தால், நீங்கள் அதை மதிப்பிட ஒரு கணம் எடுக்க முடியுமா? அது ஒரு நிமிடம் தான் எடுக்கும். உங்கள் ஒத்துழைப்புக்கு நன்றி!",
                                            cancelButtonLabel: "இல்லை, நன்றி",
                                            laterButtonLabel: "பின்னர் நினைவூட்டு",
                                            rateButtonLabel: "இப்போது மதிப்பிடு"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'th',
                                            title: "อัตรา %@",
                                            message: "หากคุณเพลิดเพลินกับการใช้ %@ คุณจะคิดสละเวลาให้คะแนนมันได้หรือไม่ มันจะไม่ใช้เวลานานกว่าหนึ่งนาที ขอบคุณสำหรับการสนับสนุนของคุณ",
                                            cancelButtonLabel: "ไม่ขอบคุณ",
                                            laterButtonLabel: "กรุณาเตือนผมมา",
                                            rateButtonLabel: "ให้คะแนนตอนนี้"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'tr',
                                            title: "Oy %@",
                                            message: "Eğer %@ uygulamamız hoşunuza gittiyse, oy vermek ister misiniz? Bir dakikadan fazla sürmeyecektir. Desteğiniz için teşekkürler!",
                                            cancelButtonLabel: "Teşekkürler, Hayır",
                                            laterButtonLabel: "Sonra Hatırlat",
                                            rateButtonLabel: "Şimdi Oyla"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'uk',
                                            title: "Оцінити %@",
                                            message: "Якщо вам подобається користуватися %@, чи не будете ви заперечувати проти того, щоб приділити хвилинку та оцінити її? Спасибі вам за підтримку!",
                                            cancelButtonLabel: "Ні, дякую",
                                            laterButtonLabel: "Нагадати пізніше",
                                            rateButtonLabel: "Оцінити зараз"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ur',
                                            title: "شرح %@",
                                            message: "اگر آپ نے %@ کا استعمال کرتے ہوئے سے لطف اندوز ہوتے، تو آپ کو ایک درجہ لمحے لینے میں کوئی اعتراض کریں گے؟ یہ ایک منٹ سے زیادہ نہیں لگے گا. آپ کی حمایت کے لئے شکریہ!",
                                            cancelButtonLabel: "نہیں، شکریہ",
                                            laterButtonLabel: "مجھے بعد میں یاد دلائیں",
                                            rateButtonLabel: "شرح اب یہ"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ur-IN',
                                            title: "کو ریٹ کیجیے %@",
                                            message: "اگر آپ نے %@ کو مفید پایا ہے تو کیا آپ اپنے قیمتی وقت میں سے چند لمحے نکال کر اس کو ریٹ کریں گے؟ اس میں ایک منٹ سے زیادہ نہیں لگے گا، آپ کے تعاون کا شکریہ!",
                                            cancelButtonLabel: "نہیں، شکریہ",
                                            laterButtonLabel: "مجھے بعد میں یاد دلائیں",
                                            rateButtonLabel: "ابھی ریٹ کیجیے"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'ur-PK',
                                            title: "کو ریٹ کیجیے %@",
                                            message: "اگر آپ نے %@ کو مفید پایا ہے تو کیا آپ اپنے قیمتی وقت میں سے چند لمحے نکال کر اس کو ریٹ کریں گے؟ اس میں ایک منٹ سے زیادہ نہیں لگے گا، آپ کے تعاون کا شکریہ!",
                                            cancelButtonLabel: "نہیں، شکریہ",
                                            laterButtonLabel: "مجھے بعد میں یاد دلائیں",
                                            rateButtonLabel: "ابھی ریٹ کیجیے"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'vi',
                                            title: "Đánh giá %@",
                                            message: "Nếu thích sử dụng %@, bạn có muốn giành một chút thời gian để đánh giá nó? Sẽ không lâu hơn một phút. Cảm ơn sự hỗ trợ của bạn!",
                                            cancelButtonLabel: "Không, Cảm ơn",
                                            laterButtonLabel: "Nhắc Tôi Sau",
                                            rateButtonLabel: "Đánh Giá Ngay"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'zh-TW',
                                            title: "評分 %@",
                                            message: "如果你喜歡使用 %@, 是否介意耽誤您一點時間來給我們一個評分呢？ 該動作不會超過一分鐘。 謝謝您的支持！",
                                            cancelButtonLabel: "不，謝謝",
                                            laterButtonLabel: "稍後通知我",
                                            rateButtonLabel: "現在評分"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'zh-Hans',
                                            title: "为“%@”评分",
                                            message: "如果您觉得“%@”很好用，可否为其评一个分数？评分过程只需花费很少的时间。感谢您的支持！",
                                            cancelButtonLabel: "不了，谢谢",
                                            laterButtonLabel: "稍后再说",
                                            rateButtonLabel: "现在去评分"
                                            }));
               
               Locales.addLocale(new Locale({
                                            language: 'zh-Hant',
                                            title: "評分 %@",
                                            message: "如果您喜歡用 %@，是否願意花一些時間打個分數？其過程將不超過一分鐘。 謝謝您的支持！",
                                            cancelButtonLabel: "不，謝謝",
                                            laterButtonLabel: "稍後提醒我",
                                            rateButtonLabel: "現在評分"
                                            }));
               
               module.exports = Locales;
               
               });

cordova.define("cordova-plugin-apprate.storage", function(require, exports, module) {
               module.exports = {
               get: function (key) {
               return new Promise(function(resolve, reject) {
                                  NativeStorage.getItem(key, resolve, function(e) {
                                                        if (e.code === 2) {
                                                        resolve(null)
                                                        } else {
                                                        reject(e)
                                                        }
                                                        })
                                  })
               },
               set: function (key, value) {
               return new Promise(function(resolve, reject) {
                                  NativeStorage.setItem(key, value, resolve, reject);
                                  })
               }
               }
               
               });

cordova.define("cordova-plugin-nativestorage.LocalStorageHandle", function(require, exports, module) {
               var NativeStorageError = require('./NativeStorageError');
               
               // args = [reference, variable]
               function LocalStorageHandle(success, error, intent, operation, args) {
               var reference = args[0];
               var variable = args[1];
               
               if (operation.startsWith('put') || operation.startsWith('set')) {
               try {
               var varAsString = JSON.stringify(variable);
               if (reference === null) {
               error(NativeStorageError.NULL_REFERENCE);
               return;
               }
               localStorage.setItem(reference, varAsString);
               success(variable);
               } catch (err) {
               error(NativeStorageError.JSON_ERROR);
               }
               } else if (operation.startsWith('get')) {
               var item = {};
               item = localStorage.getItem(reference);
               if (item === null) {
               error(NativeStorageError.ITEM_NOT_FOUND);
               return;
               }
               try {
               var obj = JSON.parse(item);
               //console.log("LocalStorage Reading: "+obj);
               success(obj);
               } catch (err) {
               error(NativeStorageError.JSON_ERROR);
               }
               } else if (operation === 'keys') {
               var keys = [];
               for(var i = 0; i < localStorage.length; i++){
               keys.push(localStorage.key(i));
               }
               success(keys);
               }
               }
               module.exports = LocalStorageHandle;
               
               });

cordova.define("cordova-plugin-nativestorage.mainHandle", function(require, exports, module) {
               var inBrowser = false;
               var NativeStorageError = require('./NativeStorageError');
               
               
               function isInBrowser() {
               inBrowser = (window.cordova && (window.cordova.platformId === 'browser' || window.cordova.platformId === 'osx')) || !(window.phonegap || window.cordova);
               return inBrowser;
               }
               
               function storageSupportAnalyse() {
               if (!isInBrowser()) {
               return 0;
               //storageHandlerDelegate = exec;
               } else {
               if (window.localStorage) {
               return 1;
               //storageHandlerDelegate = localStorageHandle;
               } else {
               return 2;
               //console.log("ALERT! localstorage isn't supported");
               }
               }
               }
               
               //if storage not available gracefully fails, no error message for now
               function StorageHandle() {
               this.storageSupport = storageSupportAnalyse();
               switch (this.storageSupport) {
               case 0:
               var exec = require('cordova/exec');
               this.storageHandlerDelegate = exec;
               break;
               case 1:
               var localStorageHandle = require('./LocalStorageHandle');
               this.storageHandlerDelegate = localStorageHandle;
               break;
               case 2:
               console.log("ALERT! localstorage isn't supported");
               break;
               default:
               console.log("StorageSupport Error");
               break;
               }
               }
               
               StorageHandle.prototype.initWithSuiteName = function(suiteName, success, error) {
               if (suiteName === null) {
               error("Null suiteName isn't supported");
               return;
               }
               this.storageHandlerDelegate(success, error, "NativeStorage", "initWithSuiteName", [suiteName]);
               };
               
               StorageHandle.prototype.set = function(reference, value, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("The reference can't be null");
               return;
               }
               if (value === null) {
               error("a Null value isn't supported");
               return;
               }
               switch (typeof value) {
               case 'undefined':
               error("an undefined type isn't supported");
               break;
               case 'boolean': {
               this.putBoolean(reference, value, success, error);
               break;
               }
               case 'number': {
               // Good now check if it's a float or an int
               if (value === +value) {
               if (value === (value | 0)) {
               // it's an int
               this.putInt(reference, value, success, error);
               } else if (value !== (value | 0)) {
               this.putDouble(reference, value, success, error);
               }
               } else {
               error("The value doesn't seem to be a number");
               }
               break;
               }
               case 'string': {
               this.putString(reference, value, success, error);
               break;
               }
               case 'object': {
               this.putObject(reference, value, success, error);
               break;
               }
               default:
               error("The type isn't supported or isn't been recognized");
               break;
               }
               };
               
/* removing */
               StorageHandle.prototype.remove = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               
               if (inBrowser) {
               try {
               localStorage.removeItem(reference);
               success();
               } catch (e) {
               error(e);
               }
               } else {
               this.storageHandlerDelegate(success, error, "NativeStorage", "remove", [reference]);
               }
               };
               
/* clearing */
               StorageHandle.prototype.clear = function(success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (inBrowser) {
               try {
               localStorage.clear();
               success();
               } catch (e) {
               error(e);
               }
               } else {
               this.storageHandlerDelegate(success, error, "NativeStorage", "clear", []);
               }
               };
               
               
/* boolean storage */
               StorageHandle.prototype.putBoolean = function(reference, aBoolean, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               
               if (aBoolean === null) {
               error("a Null value isn't supported");
               return;
               }
               
               if (typeof aBoolean === 'boolean') {
               this.storageHandlerDelegate(function(returnedBool) {
                                           if ('string' === typeof returnedBool) {
                                           if ( (returnedBool === 'true') ) {
                                           success(true);
                                           } else if ( (returnedBool === 'false') ) {
                                           success(false);
                                           } else {
                                           error("The returned boolean from SharedPreferences was not recognized: " + returnedBool);
                                           }
                                           } else {
                                           success(returnedBool);
                                           }
                                           }, error, "NativeStorage", "putBoolean", [reference, aBoolean]);
               } else {
               error("Only boolean types are supported");
               }
               };
               
               
               StorageHandle.prototype.getBoolean = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(function(returnedBool) {
                                           if ('string' === typeof returnedBool) {
                                           if ( (returnedBool === 'true') ) {
                                           success(true);
                                           } else if ( (returnedBool === 'false') ) {
                                           success(false);
                                           } else {
                                           error("The returned boolean from SharedPreferences was not recognized: " + returnedBool);
                                           }
                                           } else {
                                           success(returnedBool);
                                           }
                                           }, error, "NativeStorage", "getBoolean", [reference]);
               };
               
/* int storage */
               StorageHandle.prototype.putInt = function(reference, anInt, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(success, error, "NativeStorage", "putInt", [reference, anInt]);
               };
               
               StorageHandle.prototype.getInt = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(success, error, "NativeStorage", "getInt", [reference]);
               };
               
               
/* float storage */
               StorageHandle.prototype.putDouble = function(reference, aFloat, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(success, error, "NativeStorage", "putDouble", [reference, aFloat]);
               };
               
               StorageHandle.prototype.getDouble = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(function(data) {
                                           if (isNaN(data)) {
                                           error('Expected double but got non-number');
                                           } else {
                                           success(parseFloat(data));
                                           }
                                           }, error, "NativeStorage", "getDouble", [reference]);
               };
               
/* string storage */
               StorageHandle.prototype.putString = function(reference, s, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(success, error, "NativeStorage", "putString", [reference, s]);
               };
               
               StorageHandle.prototype.getString = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error("Null reference isn't supported");
               return;
               }
               this.storageHandlerDelegate(success, error, "NativeStorage", "getString", [reference]);
               };
               
/* object storage  COMPOSITE AND DOESNT CARE FOR BROWSER*/
               StorageHandle.prototype.putObject = function(reference, obj, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               var objAsString = "";
               try {
               objAsString = JSON.stringify(obj);
               } catch (err) {
               error(err);
               }
               this.putString(reference, objAsString, function(data) {
                              var obj = {};
                              try {
                              obj = JSON.parse(data);
                              success(obj);
                              } catch (err) {
                              error(err);
                              }
                              }, error);
               };
               
               StorageHandle.prototype.getObject = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               this.getString(reference, function(data) {
                              var obj = {};
                              try {
                              obj = JSON.parse(data);
                              success(obj);
                              } catch (err) {
                              error(err);
                              }
                              }, error);
               };
               
/* API >= 2 */
               StorageHandle.prototype.setItem = function(reference, obj, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               var objAsString = "";
               try {
               objAsString = JSON.stringify(obj);
               } catch (err) {
               error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
               return;
               }
               if (reference === null) {
               error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
               return;
               }
               this.storageHandlerDelegate(function(data) {
                                           try {
                                           obj = JSON.parse(data);
                                           success(obj);
                                           } catch (err) {
                                           error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
                                           }
                                           }, function(code) {
                                           error(new NativeStorageError(code, "Native", ""));
                                           }, "NativeStorage", "setItem", [reference, objAsString]);
               };
               
               StorageHandle.prototype.getItem = function(reference, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
               return;
               }
               var obj = {};
               
               this.storageHandlerDelegate(
                                           function(data) {
                                           try {
                                           obj = JSON.parse(data);
                                           success(obj);
                                           } catch (err) {
                                           error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
                                           }
                                           },
                                           function(code) {
                                           error(new NativeStorageError(code, "Native", ""));
                                           }, "NativeStorage", "getItem", [reference]);
               };
               
/* API >= 2 */
               StorageHandle.prototype.setSecretItem = function(reference, obj, encryptConfig, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               var objAsString = "";
               try {
               objAsString = JSON.stringify(obj);
               } catch (err) {
               error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
               return;
               }
               if (reference === null) {
               error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
               return;
               }
               
               var action = "setItem";
               var params = [reference, objAsString];
               switch (encryptConfig.mode) {
               case "password":
               action = "setItemWithPassword";
               params = [reference, objAsString, encryptConfig.value];
               break;
               case "key":
               action = "setItemWithKey";
               break;
               case "none":
               break;
               default: {
               error(new NativeStorageError(NativeStorageError.WRONG_PARAMETER, "JS", ""));
               return;
               }
               }
               this.storageHandlerDelegate(function(data) {
                                           try {
                                           obj = JSON.parse(data);
                                           success(obj);
                                           } catch (err) {
                                           error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
                                           }
                                           }, function(code) {
                                           error(new NativeStorageError(code, "Native", ""));
                                           }, "NativeStorage", action, params);
               };
               
               StorageHandle.prototype.getSecretItem = function(reference, encryptConfig, success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               if (reference === null) {
               error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
               return;
               }
               var obj = {};
               
               var action = "getItem";
               var params = [reference];
               switch (encryptConfig.mode) {
               case "password":
               action = "getItemWithPassword";
               params = [reference, encryptConfig.value];
               break;
               case "key":
               action = "getItemWithKey";
               break;
               case "none":
               break;
               default: {
               error(new NativeStorageError(NativeStorageError.WRONG_PARAMETER, "JS", ""));
               return;
               }
               }
               
               this.storageHandlerDelegate(
                                           function(data) {
                                           try {
                                           obj = JSON.parse(data);
                                           success(obj);
                                           } catch (err) {
                                           error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
                                           }
                                           },
                                           function(code) {
                                           error(new NativeStorageError(code, "Native", ""));
                                           }, "NativeStorage", action, params);
               };
               
/* list keys */
               StorageHandle.prototype.keys = function(success, error) {
               
               //if error is null then replace with empty function to silence warnings
               if(!error){
               error = function(){};
               }
               
               this.storageHandlerDelegate(success, error, "NativeStorage", "keys", []);
               };
               
               
               var storageHandle = new StorageHandle();
               module.exports = storageHandle;
               
               });

cordova.define("cordova-plugin-nativestorage.NativeStorageError", function(require, exports, module) {
/**
 * NativeStorageError
 * @constructor
 */
               var NativeStorageError = function(code, source, exception) {
               this.code = code || null;
               this.source = source || null;
               this.exception = exception || null;
               };
               
               // Make NativeStorageError a real Error, you can test with `instanceof Error`
               NativeStorageError.prototype = Object.create(Error.prototype, {
                                                            constructor: { value: NativeStorageError }
                                                            });
               
               NativeStorageError.NATIVE_WRITE_FAILED = 1;
               NativeStorageError.ITEM_NOT_FOUND = 2;
               NativeStorageError.NULL_REFERENCE = 3;
               NativeStorageError.UNDEFINED_TYPE = 4;
               NativeStorageError.JSON_ERROR = 5;
               NativeStorageError.WRONG_PARAMETER = 6;
               
               module.exports = NativeStorageError;
               
               });

cordova.define("cordova-plugin-inappbrowser.inappbrowser", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

(function() {
    // special patch to correctly work on Ripple emulator (CB-9760)
    if (window.parent && !!window.parent.ripple) { // https://gist.github.com/triceam/4658021
        module.exports = window.open.bind(window); // fallback to default window.open behaviour
        return;
    }

    var exec = require('cordova/exec');
    var channel = require('cordova/channel');
    var modulemapper = require('cordova/modulemapper');
    var urlutil = require('cordova/urlutil');

    function InAppBrowser() {
       this.channels = {
            'loadstart': channel.create('loadstart'),
            'loadstop' : channel.create('loadstop'),
            'loaderror' : channel.create('loaderror'),
            'exit' : channel.create('exit')
       };
    }

    InAppBrowser.prototype = {
        _eventHandler: function (event) {
            if (event && (event.type in this.channels)) {
                this.channels[event.type].fire(event);
            }
        },
        close: function (eventname) {
            exec(null, null, "InAppBrowser", "close", []);
        },
        show: function (eventname) {
          exec(null, null, "InAppBrowser", "show", []);
        },
        addEventListener: function (eventname,f) {
            if (eventname in this.channels) {
                this.channels[eventname].subscribe(f);
            }
        },
        removeEventListener: function(eventname, f) {
            if (eventname in this.channels) {
                this.channels[eventname].unsubscribe(f);
            }
        },

        executeScript: function(injectDetails, cb) {
            if (injectDetails.code) {
                exec(cb, null, "InAppBrowser", "injectScriptCode", [injectDetails.code, !!cb]);
            } else if (injectDetails.file) {
                exec(cb, null, "InAppBrowser", "injectScriptFile", [injectDetails.file, !!cb]);
            } else {
                throw new Error('executeScript requires exactly one of code or file to be specified');
            }
        },

        insertCSS: function(injectDetails, cb) {
            if (injectDetails.code) {
                exec(cb, null, "InAppBrowser", "injectStyleCode", [injectDetails.code, !!cb]);
            } else if (injectDetails.file) {
                exec(cb, null, "InAppBrowser", "injectStyleFile", [injectDetails.file, !!cb]);
            } else {
                throw new Error('insertCSS requires exactly one of code or file to be specified');
            }
        }
    };

    module.exports = function(strUrl, strWindowName, strWindowFeatures, callbacks) {
        // Don't catch calls that write to existing frames (e.g. named iframes).
        if (window.frames && window.frames[strWindowName]) {
            var origOpenFunc = modulemapper.getOriginalSymbol(window, 'open');
            return origOpenFunc.apply(window, arguments);
        }

        strUrl = urlutil.makeAbsolute(strUrl);
        var iab = new InAppBrowser();

        callbacks = callbacks || {};
        for (var callbackName in callbacks) {
            iab.addEventListener(callbackName, callbacks[callbackName]);
        }

        var cb = function(eventname) {
           iab._eventHandler(eventname);
        };

        strWindowFeatures = strWindowFeatures || "";

        exec(cb, cb, "InAppBrowser", "open", [strUrl, strWindowName, strWindowFeatures]);
        return iab;
    };
})();

});


cordova.define("cordova-plugin-splashscreen.SplashScreen", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var exec = require('cordova/exec');

var splashscreen = {
    show:function() {
        exec(null, null, "SplashScreen", "show", []);
    },
    hide:function() {
        exec(null, null, "SplashScreen", "hide", []);
    }
};

module.exports = splashscreen;

});

cordova.define("cordova-plugin-appsflyer.appsflyer", function(require, exports, module) {
if(!window.CustomEvent) {
	window.CustomEvent = function(type, config) {
		var e = document.createEvent("CustomEvent");
		e.initCustomEvent(type, true, true, config.detail);
		return e;
	}
}
(function (global) {
	var AppsFlyer;
	AppsFlyer = function () {
	};

	AppsFlyer.prototype.initSdk = function (args) {
    	cordova.exec(null, null, "AppsFlyerPlugin", "initSdk", args);
	};
	
	AppsFlyer.prototype.setCurrencyCode = function (currencyId) {
    	cordova.exec(null, null, "AppsFlyerPlugin", "setCurrencyCode", [currencyId]);
	};
	
	AppsFlyer.prototype.setAppUserId = function (customerUserId) {
    	cordova.exec(null, null, "AppsFlyerPlugin", "setAppUserId", [customerUserId]);
	};

	AppsFlyer.prototype.getAppsFlyerUID = function (callbackFn) {
        cordova.exec(function(result){
            callbackFn(result);
        }, null,
           "AppsFlyerPlugin",
           "getAppsFlyerUID",
        []);
	};
	
	AppsFlyer.prototype.trackEvent = function(eventName, eventValue) {
    	cordova.exec(null, null, "AppsFlyerPlugin", "trackEvent", [eventName,eventValue]);
	};

	AppsFlyer.prototype.onInstallConversionDataLoaded = function(conversionData) {
        var data = conversionData,
            event;
        if (typeof data === "string") {
            data = JSON.parse(conversionData);
        }
		event = new CustomEvent('onInstallConversionDataLoaded', {'detail': data});
		global.document.dispatchEvent(event);
	};

	global.cordova.addConstructor(function() {
		if (!global.Cordova) {
			global.Cordova = global.cordova;
		};

		if (!global.plugins) {
			global.plugins = {};
		}

		global.plugins.appsFlyer = new AppsFlyer();
	});
}(window));

});

cordova.define("com.phonegap.plugins.PushPlugin.PushNotification", function (require, exports, module) {
    var PushNotification = function () {
    };


    // Call this to register for push notifications. Content of [options] depends on whether we are working with APNS (iOS) or GCM (Android)
    PushNotification.prototype.register = function (successCallback, errorCallback, options) {

        if (errorCallback == null) { errorCallback = function () { } }

        if (typeof errorCallback != "function") {
            alert('errorCallback... of PushNotification.register');
            console.log("PushNotification.register failure: failure parameter not a function");
            return
        }

        if (typeof successCallback != "function") {
            console.log("PushNotification.register failure: success callback parameter must be a function");
            return
        }

        cordova.exec(successCallback, errorCallback, "PushPlugin", "register", [options]);
    };

    // Call this to unregister for push notifications
    PushNotification.prototype.unregister = function (successCallback, errorCallback, options) {
        if (errorCallback == null) { errorCallback = function () { } }

        if (typeof errorCallback != "function") {
            console.log("PushNotification.unregister failure: failure parameter not a function");
            return
        }

        if (typeof successCallback != "function") {
            console.log("PushNotification.unregister failure: success callback parameter must be a function");
            return
        }

        cordova.exec(successCallback, errorCallback, "PushPlugin", "unregister", [options]);
    };

    // Call this if you want to show toast notification on WP8
    PushNotification.prototype.showToastNotification = function (successCallback, errorCallback, options) {
        if (errorCallback == null) { errorCallback = function () { } }

        if (typeof errorCallback != "function") {
            console.log("PushNotification.register failure: failure parameter not a function");
            return
        }

        cordova.exec(successCallback, errorCallback, "PushPlugin", "showToastNotification", [options]);
    }
    // Call this to set the application icon badge
    PushNotification.prototype.setApplicationIconBadgeNumber = function (successCallback, errorCallback, badge) {
        if (errorCallback == null) { errorCallback = function () { } }

        if (typeof errorCallback != "function") {
            console.log("PushNotification.setApplicationIconBadgeNumber failure: failure parameter not a function");
            return
        }

        if (typeof successCallback != "function") {
            console.log("PushNotification.setApplicationIconBadgeNumber failure: success callback parameter must be a function");
            return
        }

        cordova.exec(successCallback, errorCallback, "PushPlugin", "setApplicationIconBadgeNumber", [{ badge: badge }]);
    };

    //-------------------------------------------------------------------

    if (!window.plugins) {
        window.plugins = {};
    }
    if (!window.plugins.pushNotification) {
        window.plugins.pushNotification = new PushNotification();
    }

    if (typeof module != 'undefined' && module.exports) {
        module.exports = PushNotification;
    }
});

function tokenHandler(result) {

    if (typeof result == "object") {
        // new scmmSettingsModule.updateCustomerPushNotificationToken function
        var token = result.token;
        var isNotificationEnabled = result.isNotificationEnabled;
        var versionCode = result.versionCode;
        var bundleName = result.bundleName;
    } else {
        // support old versions
        var token = result;
        var isNotificationEnabled = "";
        var versionCode = "";
        var bundleName = "";
    }

    if (isNotificationEnabled == "true") {
        isNotificationEnabled = 1;
    } else {
        isNotificationEnabled = 0;
    }

    /*
    alert('token is: ' + token);
    alert('isNotificationEnabled is: ' + isNotificationEnabled);
    alert('versionCode is: ' + versionCode);
    alert('bundleName is: ' + bundleName);
    */
    
    scmmSettingsModule.updateCustomerPushNotificationToken(token, isNotificationEnabled, versionCode, bundleName, scmmSettingsModule.deviceType.iOS);
    
    // test eyal - native logs
    NativeLogsTools.GetCustomerID();
}

function onNotificationAPN(event) {
    if (event.alert) {
        navigator.notification.alert(event.alert);
    }

    if (event.sound) {
        var snd = new Media(event.sound);
        snd.play();
    }

    if (event.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}
// result contains any error description text returned from the plugin call
function errorHandler(error) {
    console.log('error = ' + error);
}