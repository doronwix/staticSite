define(
    'cachemanagers/ClientStateFlagsManager',
    [
        'handlers/Delegate'
    ],
    function TClientStateFlagsManager(delegate) {
        var onChange = new delegate(),
            csFlags = {
                exposureCoverageAlert: '',
                equityAlert: '',
                exposureAlert: '',
                marketState: '',
                systemMode: '',
                limitMultiplier: ''
            };

        function processData(csflags) {
            if (csflags[eCSFlags.isUpdated]) {
                updateData(csflags);
                onChange.Invoke(csFlags);
            }
        }

        function updateData(csflags) {
            csFlags.exposureCoverageAlert = csflags[eCSFlags.exposureCoverageAlert];
            csFlags.equityAlert = csflags[eCSFlags.equityAlert];
            csFlags.exposureAlert = csflags[eCSFlags.exposureAlert];
            csFlags.marketState = csflags[eCSFlags.marketState];
            csFlags.systemMode = csflags[eCSFlags.systemMode];
            csFlags.limitMultiplier = csflags[eCSFlags.limitMultiplier];
        }

        return {
            CSFlags: csFlags,
            OnChange: onChange,
            ProcessData: processData
        };
    }
);
