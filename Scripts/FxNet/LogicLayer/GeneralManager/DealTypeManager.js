define(
    "generalmanagers/DealTypeManager",
    [
        "require",
        "initdatamanagers/Customer",
        "enums/enums",
        "handlers/StateMachine"
    ],
    function DealTypeManager(require) {
        var Customer = require("initdatamanagers/Customer"),
            dealTypeStateMachine,
            cDealPermitTypeStates = [
                {
                    'name': 'initial',
                    'initial': true,
                    'events': {
                        'islamic': eDealType.Islamic,
                        'spot_or_spotonly_no_future': eDealType.Spot,
                        'future': eDealType.Future,
                        'share': eDealType.Share
                    }
                },
                {
                    'name': eDealType.Islamic,
                    'events': {}
                },
                {
                    'name': eDealType.Spot,
                    'events': {
                        'future': eDealType.Future,
                        'share': eDealType.Share
                    }
                },
                {
                    'name': eDealType.Future,
                    'events': {
                        'spot_or_spotonly_no_future': eDealType.Spot,
                        'share': eDealType.Share
                    }
                },
                {
                    'name': eDealType.Share,
                    'events': {
                        'spot_or_spotonly_no_future': eDealType.Spot,
                        'future': eDealType.Future
                    }
                }
            ];

        function init() {
            dealTypeStateMachine = new TStateMachine();
            dealTypeStateMachine.Init(cDealPermitTypeStates);

            setContext();
        }

        function getStatus() {
            return dealTypeStateMachine.GetStatus();
        }

        function consumeEvent(e) {
            setContext();

            dealTypeStateMachine.ConsumeEvent(e);
        }

        function setContext() {
            switch (Customer.prop.dealPermit) {
                case eDealPermit.SpotOnly:
                case eDealPermit.ZeroSpread:
                    dealTypeStateMachine.ConsumeEvent('spot_or_spotonly_no_future');
                    break;

                case eDealPermit.Islamic:
                    dealTypeStateMachine.ConsumeEvent('islamic');
                    break;
            }
        }

        return {
            Init: init,
            GetStatus: getStatus,
            ConsumeEvent: consumeEvent
        };
    }
);
