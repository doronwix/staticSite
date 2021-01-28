/* eslint no-extend-native: 0 */
function addMemberOnObject(memberName, memberDefinition, targetObject) {
    if (typeof (Browser) !== "undefined" && Browser.isDefinePropertySupported()) {
        Object.defineProperty(targetObject, memberName, {
            value: memberDefinition,
            writable: true,
            enumerable: false,
            configurable: true
        });
    } else {
        targetObject[memberName] = memberDefinition;
    }
}

function addMemberOnArrayPrototype(memberName, memberDefinition) {
    addMemberOnObject(memberName, memberDefinition, Array.prototype);
}

function addMemberOnArray(memberName, memberDefinition) {
    addMemberOnObject(memberName, memberDefinition, Array);
}

addMemberOnArrayPrototype("remove",
    function (group) {
        var tmp = [];

        for (var i = 0; i < this.length; i++) {
            if (group.indexAt(this[i]) === -1) {
                tmp.push(this[i]);
            }
        }

        return tmp;
    });

//-------------------------------------------------------

addMemberOnArrayPrototype("removeItem",
    function(key) {
        var index = this.indexAt(key);

        if (index > -1) {
            this.splice(index, 1);
        }
    });

//-------------------------------------------------------

addMemberOnArrayPrototype("clear",
    function () {
        while (this.length > 0) {
            this.pop();
        }
    });

//-------------------------------------------------------

addMemberOnArrayPrototype("compareTo",
    function (testArr) {

        if (this.length !== testArr.length)
            return false;

        for (var i = 0; i < testArr.length; i++) {
            if (this[i].compare)
                if(!this[i].compare(testArr[i]))
                    return false;

            if (this[i] !== testArr[i])
                return false;
        }

        return true;
    });

//--------------------------------------------------------

addMemberOnArrayPrototype("indexAt", 
    function(what) {
        var length = this.length,
            i = 0;

        while (i < length) {
            if (this[i] === what) {
                return i;
            }

            ++i;
        }
    
        return -1;
    });

//--------------------------------------------------------

addMemberOnArrayPrototype("addUnique",
    function (what) {
        if (this.indexAt(what) === -1) {
            this.push(what);
        }

        return this;
    });

//--------------------------------------------------------

addMemberOnArrayPrototype("contains", 
    function(obj) {
        var i = this.length;
    
        while (i--) {
            if (this[i] == obj) { // eslint-disable-line
                return true;
            }
        }
    
        return false;
    });

//--------------------------------------------------------

// Polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Compatibility

if (!Array.isArray) {
    addMemberOnArray("isArray", 
        function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        });
}


//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Polyfill
if (!Array.prototype.find) {
    addMemberOnArrayPrototype("find", 
        function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                if (i in list) {
                    value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return value;
                    }
                }
            }
            return undefined;
        });


    //https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Compatibility
    if (!Array.prototype.filter) {
        addMemberOnArrayPrototype("filter", 
            function (fun /*, thisArg */) {
                "use strict";

                if (this === void 0 || this === null)
                    throw new TypeError();

                var t = Object(this);
                var len = t.length >>> 0;
                if (typeof fun !== "function")
                    throw new TypeError();

                var res = [];
                var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
                for (var i = 0; i < len; i++) {
                    if (i in t) {
                        var val = t[i];

                        // NOTE: Technically this should Object.defineProperty at
                        //       the next index, as push can be affected by
                        //       properties on Object.prototype and Array.prototype.
                        //       But that method's new, and collisions should be
                        //       rare, so use the more-compatible alternative.
                        if (fun.call(thisArg, val, i, t))
                            res.push(val);
                    }
                }

                return res;
            });
    }
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex#Polyfill
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            'use strict';
            if (this == null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        },
        enumerable: false,
        configurable: true,
        writable: true
    });
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
if (!Array.prototype.indexOf) {
    addMemberOnArrayPrototype("indexOf", 
        function (searchElement, fromIndex) {

            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                var kValue;
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        });
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill
if (!Array.prototype.map) {
    addMemberOnArrayPrototype("map", 
        function (callback, thisArg) {

            var T, A, k;

            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }

            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array( len) where Array is
            // the standard built-in constructor with that name and len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal method of callback
                    // with T as the this value and argument list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty( A, k, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        });
}

if (!Array.prototype.reduce) {
    addMemberOnArrayPrototype("reduce", {
        value: function (callback /*, initialValue*/) {
            if (this === null) {
                throw new TypeError('Array.prototype.reduce ' +
                  'called on null or undefined');
            }
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // Steps 3, 4, 5, 6, 7      
            var k = 0;
            var value;

            if (arguments.length >= 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in o)) {
                    k++;
                }

                // 3. If len is 0 and initialValue is not present,
                //    throw a TypeError exception.
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = o[k++];
            }

            // 8. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kPresent be ? HasProperty(O, Pk).
                // c. If kPresent is true, then
                //    i.  Let kValue be ? Get(O, Pk).
                //    ii. Let accumulator be ? Call(
                //          callbackfn, undefined,
                //          « accumulator, kValue, k, O »).
                if (k in o) {
                    value = callback(value, o[k], k, o);
                }

                // d. Increase k by 1.      
                k++;
            }

            // 9. Return accumulator.
            return value;
        }
    });
}

//--------------------------------------------------------

addMemberOnArrayPrototype("concatUnique",
    function (obj) {
        if (!obj || Object.prototype.toString.apply(obj) !== '[object Array]' || typeof obj === 'undefined' || typeof (value) === 'string' || obj === null || obj.length < 1)
        {
            return this;
        }
        
        var destinationArray = this;
        return this.concat(obj.filter(function isNotContainedInOtherArray(item) { return destinationArray.indexOf(item) < 0; }))
    });

addMemberOnArrayPrototype("concatUniqueObject",
    function (obj) {
        if (!obj || Object.prototype.toString.apply(obj) !== '[object Array]' || typeof obj === 'undefined' || typeof (value) === 'string' || obj === null || obj.length < 1)
        {
            return this;
        }

        var destinationArray = this;
        return this.concat(obj.filter(function isNotContainedInOtherArray(item, index) {
            return destinationArray.findIndex(
                function (destItem) { return JSON.stringify(destItem) === JSON.stringify(item); }) === -1;
        }));
    });

// find is needed for phantom js headless browser
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return undefined.
            return undefined;
        },
        configurable: true,
        writable: true
    });
}