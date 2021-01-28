# ChatBot

## Usage (example):
## [<= Back](../README.md)

ChatBot is an amd module:

```javascript
require(['path to library'], function(_chatBot){
    // data is an object used to describe flow defined for ChatBot
    var data = [
        //array with blocks description
    ];

    var options = {
        startBlockId: 10, // block used when start (must exist on data)
        name: "FeedBack", 
        onError: logErrorEvent, //handler to call when internal error occurred
        onLoad: onLoad, // called when chatbot finish loading himself
        onClose: onClose, // called when chatbot is closing himself
        onTrack: onTrack, //handler to call things configured for tracking are happen
        onCallback: onCallback, // handler for specific internal actions (actions marked for this on "data")
        defaultStatus: 'show',// initial visibility status (hide/show)
        history: 'session',//  ChatBot save state on the browser storage for reuse; can be 'session' or 'local'
        header: { slogan: 'some', name: 'some text' }, // are displayed on header of ChatBot (header isn't displayed if are missing)
        scrollMode: 'start', // config for automatic scroll, default is 'end' (at the end of curent block),
        direction: 'rtl', // default 'ltr'
        base_url: 'assets/js/fx-chatbot' //path to location from where it is served

    }
    console.log(_chatBot.__VERSION__);

    var chatBotInstance = _chatBot(data, options, element);


    ....
});
```

## Internals
### data format
### callback signatures