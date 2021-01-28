# ChatBot
A JavaScript chat bot (previous named emily)

## Public api and usage

ChatBot is an amd module:

```javascript
require(['path to library'], function(_chatBot){
    // data is an array of objects used to describe flow defined for ChatBot
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
});

```

### Data sample (see [examples.txt](./examples.txt) for more)

```
var data = [
    [
      {
        id: 1000,
        messages: [
          {
            type: 'text',
            text: 'how are you today?'
          },
          {
            type: 'choices',
            choices: [
              {
                id: 1000,
                type: 'button',
                text: 'Good',
                postback: 'I am good, thank you.',
                goto: 2
              },
              {
                id: 1001,
                type: 'buton',
                text: 'Bad',
                postback: 'Feeling bad',
                goto: 3
              }
            ]
          },

        ]
      },
]
```

## Developing with Chatbot

Will find iFOREX.Clients.Web.ChatBot on tfs under: 
```$/FXNET/Branches/Dev-FX3/iFOREX Framework/IFOREX.Clients/iFOREX.Clients.Web.ChatBot```

after any change execute:

``` npm run build:dev ```

and output will be copied in ```iFOREX.Clients.Web\assets\[currentversion]\js\fx-chatbot```
simple refresh of the page will download recompiled version withh all changes

next command will do the same think but in watch mode: after any change module is rebuild, and output will go to the same foder

``` npm run build:dev -- --watch```

## Publish to ```http://nuget.efix.local/feeds/DevNpm```

If you are doing checkin on tfs, build and publish will be done automatically by Jenkins tasks (thanks Bogdan P.)

If you need (for beta tests) you can publish manually:

increment version on ```package.json``` and excute:

``` npm publish ```
