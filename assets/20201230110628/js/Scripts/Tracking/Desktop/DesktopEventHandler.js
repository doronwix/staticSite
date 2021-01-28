// singleton module
(function () {


    var tabsRefeffer;
    var isDebug = false;
    


    // todo tracking take from internal TrackingData.js
    var mapFolderTypeData = function (folderTypeId, isLive, isPending) {
        switch (folderTypeId) {
            case 0: return 'None';
            case 1: return 'Other';
            case 2:
                {
                    if (isLive) {
                        return 'Live';
                    }
                    if (isPending) {
                        return 'Pending';
                    }
                    return 'Other';
                }
            case 3: return 'Other';
            case 4: return 'Nostro';
            case 5: return 'PTA';
            case 6: return 'Debit\Fraud';
            case 9: return 'Demo\Game';
        }
        return 'Other';
    };

    // global one entry point interface for desktop invoke script api
    window.gtmScRaiseEvent = function (name, jsonData) {

        var dataObj = JSON.parse(jsonData);
        var realTimeLastReferrer;
        var eventData = {};
        
        // add common data
        this.Object.assign(eventData, trackingData.getProperties());
        // handle event data
        /////////////////////////

        if (dataObj.EventData) {
            // handle size data
            if (dataObj.EventData.Size) {
                dataObj.EventData.Size = dataObj.EventData.Size.Width + "x" + dataObj.EventData.Size.Height;
            }          
            // handle referrer from event data
            // if referrer is in event data use it
            if (dataObj.EventData.Referrer || dataObj.EventData.Referrer === null) {
                eventData.Referrer = dataObj.EventData.Referrer;
                delete dataObj.EventData.Referrer;
            }
            if (dataObj.EventData.CurrentView ==="") {
                dataObj.EventData.CurrentView = dataObj.RealTimeData.LastReferrer;
            }
            $.extend(eventData, dataObj.EventData);

        }

        // handle static data
        /////////////////////////////////
        if (dataObj.StaticData) {
            // handle scmm
            if (dataObj.StaticData.Scmm) {
                var scmmData = JSON.parse(dataObj.StaticData.Scmm);
                $.extend(eventData, scmmData[0]);
                delete dataObj.StaticData.Scmm;
            }
            $.extend(eventData, dataObj.StaticData);
            // override some properties
            eventData.Country = window.systemInfo.countries[eventData.Country];
            eventData.AccountType = eventData.AccountType === 39 ? "Practice" : "Real";
            eventData.FolderType = mapFolderTypeData(eventData.FolderTypeId, eventData.IsLive, eventData.IsPending);
            switch (eventData.AML) {
                case '0':
                    eventData.AML='Not Required';
                    break;
                case '1':
                    eventData.AML='Unverified';
                    break;
                case '2':
                    eventData.AML='Denied AML Verification';
                    break;
                case '3':
                    eventData.AML='Approved';
                    break;
                case '4':
                    eventData.AML='Pending';
                    break;
                case '5':
                    eventData.AML='Restricted';
                    break;
            }

            // remove redundant properties
            delete eventData.IsLive;
            delete eventData.IsPending;
            delete eventData.FolderTypeId;
        }
        
        // handle real time data
        ///////////////////////////////////
        if (dataObj.RealTimeData) {
            // account summary
            if (dataObj.RealTimeData.DataAccountSummery) {
                
                $.extend(eventData, dataObj.RealTimeData.DataAccountSummery);
                delete dataObj.RealTimeData.DataAccountSummery;
            }
            // handle referrer: if missing than from real time last referrer
            //  else use the last referrer from real time object
            if (dataObj.RealTimeData.hasOwnProperty('LastReferrer')) {
                if (eventData.Referrer === null) {
                    eventData.Referrer = dataObj.RealTimeData.LastReferrer;
                }
                realTimeLastReferrer = dataObj.RealTimeData.LastReferrer;
                delete dataObj.RealTimeData.LastReferrer;
            }
            $.extend(eventData, dataObj.RealTimeData);
        }

        // remove null or undefined properties
        for (var el in eventData) {
            if (eventData.hasOwnProperty(el)) {
                if (eventData[el] === null || eventData[el] === undefined) {
                    delete eventData[el];
                }
            }
        }
        /// special event handling, parameter referrer 
        if (name === 'switch-tab') {
            tabsRefeffer = realTimeLastReferrer;
        }

        // handle new deal accumulator
       else if (name === 'deal-slip-success') {
            trackingData.incrementDealsNumber();
       }
       else if ((name === 'deal-slip-view') && eventData.Referrer && (eventData.Referrer.toString().indexOf('/')>-1)) {
            eventData.Referrer = tabsRefeffer +" + "+ eventData.Referrer;
        }

        window.trackingEventsCollector.consumeEvent(name, eventData);


        // print LIFO stack, most recent above
        var stringifyDataLayer = JSON.stringify(dataLayer.reverse(), 0, 4);

        if (isDebug) {

            var dataLayerView = document.getElementsByTagName('pre');
            // if not exist create
            if (dataLayerView.length < 1) {
                dataLayerView = document.createElement('pre');
                document.body.appendChild(dataLayerView);
            } else {
                dataLayerView = dataLayerView[0];
            }

            
            dataLayerView.innerText = stringifyDataLayer;

            // separator
            document.body.appendChild(document.createElement('br'));
            document.body.appendChild(document.createElement('hr'));
            document.body.appendChild(document.createElement('br'));

            // this event data as recieved
            var eventRaised = document.createElement('div');
            eventRaised.innerHTML = '<div>' + name + '</div>' + '<pre>' + jsonData + '</pre>';
            document.body.appendChild(eventRaised);
        }

        return stringifyDataLayer;
    };



}());