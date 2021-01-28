define(
    'FxNet/LogicLayer/GeneralManager/TradingInfoConnManager',
    [
        'generalmanagers/ErrorManager',
        'dataaccess/DalTradingInfoSrv',
        'configuration/initconfiguration',
        'modules/systeminfo',
        'initdatamanagers/Customer'
    ],
    function (ErrorManager, DalTradingInfoSrv, config, systemInfo, customer) {
        var economicCalendarConfig = config.EconomicCalendarConfiguration,
            sentimentsConfig = config.MarketInfoConfiguration,
            timerId,
            isDisposing = false,
            reconnectCounter = 0,
            dalSrv;

        function disconnect() {
            dalSrv.Disconnect();
        }

        function unsubscribe(hubName, args) {
            dalSrv.Unsubscribe(hubName, args);
        }

        function subscribe(hubName, args) {
            dalSrv.Subscribe(hubName, args);
        }

        function subscribeByGroup(hubName, args, groupid) {
            dalSrv.SubscribeByGroup(hubName, args, groupid);
        }

        function connect() {
            ErrorManager.onWarning("TradingInfoConnManager/connect", "connect")
            customer.GetToken().then(dalSrv.Connect);
        }

        function init() {
            dalSrv = new DalTradingInfoSrv(systemInfo.get('tradingInfoSrvUrl'));

            var disconnectCallback = function () {
                ErrorManager.onWarning("TradingInfoConnManager/disconnectCallback", "isDisposing=" + isDisposing + " timerId=" + timerId + " reconnectCounter=" + reconnectCounter)

                if (isDisposing) {
                    return;
                }

                if (timerId) {
                    clearTimeout(timerId);
                }

                timerId = setTimeout(function () {
                    reconnectCounter++;

                    //max 5 reconnects for all hubs
                    if (reconnectCounter < 5) {
                        customer.GetToken().then(dalSrv.Connect);
                    }
                }, 5000); // Restart connection after 5 seconds.
            };

            dalSrv.InitConnection(disconnectCallback);
            dalSrv.CreateHub(economicCalendarConfig.hubname);
            dalSrv.CreateHub(sentimentsConfig.hubname);

            connect();
        }

        function updateCallbacks(hubName, messageReceivedCallback, serviceAvailableCallback) {
            dalSrv.UpdateCallbacks(hubName, messageReceivedCallback, serviceAvailableCallback);
        }

        function dispose() {
            isDisposing = true;

            disconnect();
        }

        init();

        return {
            UpdateCallbacks: updateCallbacks,
            Subscribe: subscribe,
            SubscribeByGroup: subscribeByGroup,
            Unsubscribe: unsubscribe,
            Dispose: dispose,
            Connect: connect
        };
    }
);
