define(
    'managers/profileinstruments',
    ['knockout', "handlers/Delegate",],
    function ProfileInstrument(ko, delegate) {
        var value = ko.observable({}),
            onUpdate = new delegate();

        function updateInstrumentAmount(instrument, amount) {
            var profileInstr = value();
            var found = false;

            if (profileInstr.list) {
                for (var i = 0; i < profileInstr.list.length; i++) {
                    if (profileInstr.list[i].instrument == instrument) {
                        profileInstr.list[i].defaultAmount = amount.toString();
                        found = true;
                        break;
                    }
                }
            } else {
                profileInstr.list = [];
            }

            if (!found) {
                profileInstr.list.push({ "instrument": instrument, "defaultAmount": amount.toString() });
            }

            profileInstr.selected = instrument;
            value(profileInstr);
        }

        function getSelectedInstrument() {
            return getAll().selected;
        }

        function getAll() {
            return value();
        }

        function init(initValue) {
            value(initValue);

            value.subscribe(function(updatedValue) {
                onUpdate.Invoke(updatedValue);
            });
        }

        return {
            Init: init,
            OnUpdate: onUpdate,
            GetAll: getAll,
            GetSelected: getSelectedInstrument,
            UpdateInstrumentAmount: updateInstrumentAmount
        };
    }
);

