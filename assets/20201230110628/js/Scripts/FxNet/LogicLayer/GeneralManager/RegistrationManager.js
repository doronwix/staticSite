define(
    'generalmanagers/RegistrationManager',
    [
        'handlers/general',
        'handlers/Delegate',
        'handlers/HashTable',
        'enums/DataMembersPositions'
    ],
    function RegistrationManager(general, delegate, hashtable) {
        var onRegistrationListChanged = new delegate();
        var registrationList = [];
        var requests = new hashtable();

        //------------------------------------------------
        // check if fromList contains every element in to list
        function compareListContents(fromList, toList) {
            for (var i = 0, len = toList.length, instrument; i < len; i += 1) {
                instrument = toList[i];
                if (fromList.indexOf(instrument) < 0) {
                    return false;
                }
            }
            return true;
        }

        //------------------------------------------------

        function register(flag, isReinitialized) {
            var requestList = buildRequestList();

            if (isReinitialized || compareListContents(registrationList, requestList) !== true) {
                registrationList = requestList.slice();

                onRegistrationListChanged.Invoke(registrationList, flag, isReinitialized);
            }
        }

        //------------------------------------------------

        function buildRequestList() {
            var list = [];

            requests.ForEach(function iterator(key, val) {
                if (val) {
                    if (typeof val === 'object') {
                        if (key == eRegistrationListName.QuotesTable || key == eRegistrationListName.Search) {
                            for (var j = 0, len = val.length; j < len; j++) {
                                list.addUnique(general.toNumeric(val[j][eQuotesUIOrder.InstrumentID]));
                            }
                        } else {
                            for (var jj = 0, lenj = val.length; jj < lenj; jj++) {
                                list.addUnique(general.toNumeric(val[jj]));
                            }
                        }
                    } else {
                        list.addUnique(general.toNumeric(val));
                    }
                }
            });

            return list;
        }

        //------------------------------------------------

        function update(controlName, iList) {
            requests.OverrideItem(controlName, iList);

            register(eSubscriptionRequestFlags.All, false);
        }

        //------------------------------------------------

        var module = window.$regManager = {
            Register: register,
            Update: update,
            OnRegistrationListChanged: onRegistrationListChanged
        };

        return module;
    }
);
