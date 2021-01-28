/**
 * 
 * Use it as dependency for other require modules to load a document by document id from local index db using pouchDB.
 * 
 * 
 * Example: 
 * define('MyAwesomeViewModel', ['LoadFromPouchDB!chart'], function() { 
 *     
 * });
 * 
 */
define(
    'modules/LoadFromPouchDB',
    [
        'require',
        'generalmanagers/ErrorManager',
        'dataaccess/dalPouchDB'
    ],
    function (require) {
        var errorManager = require('generalmanagers/ErrorManager'),
            dalPouchDB = require('dataaccess/dalPouchDB');

        return {
            load: function (docId, localRequire, onloadCallback) {
                dalPouchDB.Get(docId)
                    .then(function (data) {
                        if (null !== onloadCallback)
                            onloadCallback(data);
                    })
                    .catch(function (error) {
                        if (error && !(error.name === 'not_found')) {
                            errorManager.onError("dalPouchDB/get", JSON.stringify(error), eErrorSeverity.low);
                        }

                        if (null !== onloadCallback)
                            onloadCallback(null);
                    }).done();

            }
        };
    }
);