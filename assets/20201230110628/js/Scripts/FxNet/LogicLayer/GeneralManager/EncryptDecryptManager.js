define(
    "generalmanagers/EncryptDecryptManager",
    [
        "require",
        'handlers/general',
        "initdatamanagers/Customer",
        'handlers/general',
        "Vendor/sjcl"
    ],
    function EncryptDecryptManager(require) {
        var Customer = require("initdatamanagers/Customer"),
            general = require('handlers/general'),
            sjcl = require("Vendor/sjcl");

        function encrypt(value) {
            var encryptValue = null;

            if (general.isNullOrUndefined(Customer.prop.sjcKey)) {
                return encryptValue;
            }

            try {
                encryptValue = sjcl.encrypt(Customer.prop.sjcKey, value);
            } catch (err) {
                // empty 
            }

            return encryptValue;
        }

        function decrypt(value) {
            var decryptValue = null;

            if (general.isNullOrUndefined(Customer.prop.sjcKey)) {
                return decryptValue;
            }

            try {
                decryptValue = sjcl.decrypt(Customer.prop.sjcKey, value);
            } catch (err) {
                // empty 
            }

            return decryptValue;
        }

        return {
            Encrypt: encrypt,
            Decrypt: decrypt
        }
    }
);
