define(
    'dataaccess/dalPouchDB',
    [
        'require',
        'Q',
        'handlers/general',
        'vendor/pouchdb.min',
        'generalmanagers/ErrorManager',
        'initdatamanagers/Customer',
        'global/browser'
    ],
    function (require) {
        var Q = require('Q'),
            general = require('handlers/general'),
            PouchDB = require("vendor/pouchdb.min"),
            errorManager = require('generalmanagers/ErrorManager'),
            customer = require("initdatamanagers/Customer"),
            db,
            dbprefix = "db",
            initDefer = null;

        function isDisabled() {
            var _isDisabled = !window.indexedDB || (Browser.FullBrowserInfo.browser.name === "Safari" && Browser.FullBrowserInfo.browser.version < 10.00);
            return _isDisabled;
        }

        function init() {
            if (initDefer) {
                return;
            }

            initDefer = Q.defer();

            try {
                db = new PouchDB(dbprefix + customer.prop.accountNumber, { revs_limit: 1 });
                initDefer.resolve();
            } catch (e) {
                errorManager.onError("dalPouchDB", "exception general: " + e.message, eErrorSeverity.low);
                db = null;
                initDefer.reject();
            }
        }

        function get(docId) {
            var dataReady = Q.defer();

            if (isDisabled()) {
                // sample from pouchdb error:{"status":404,"name":"not_found","message":"missing","error":true,"reason":"missing","docId":"chart"}"
                dataReady.reject({ "name": "pushdb-disabled", "message": "disabled", "reason": "disabled" });
            } else {
                if (!db) {
                    init();
                }

                initDefer.promise
                    .then(function () {
                        db.get(docId)
                            .then(dataReady.resolve)
                            .catch(dataReady.reject);
                    });
            }

            return dataReady.promise;
        }

        function save(docId, doc) {
            if (isDisabled() || !general.isObjectType(db)) {
                return;
            }

            initDefer.promise
                .then(function () {
                    doc._id = docId;

                    db.get(docId).then(function (existingChart) {
                        doc._rev = existingChart._rev;
                        db.put(doc).catch(function (error) {
                            errorManager.onError("dalPouchDB/save- updating", error.message, eErrorSeverity.low);
                        });
                    }).catch(function (error2) {
                        if (error2.message === "missing") {
                            db.put(doc).catch(function (error3) {
                                errorManager.onError("dalPouchDB/save- inserting", error3.message, eErrorSeverity.low);
                            });
                        }
                    });
                })
                .catch(function () { });

            return;
        }

        if (!isDisabled()) {
            setTimeout(init, 0);
        }

        return {
            Get: get,
            Save: save
        };
    }
);