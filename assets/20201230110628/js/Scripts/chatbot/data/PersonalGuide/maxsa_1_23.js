[
  {
    "blockid": 1,
    "id": 1,
    "name": "welcome message",
    "onLoad": [
      "welcome-message",
      "block_id=[blockId]"
    ],
    "onClick": [
      "trading-experience-select",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "messages": [
      {
        "type": "image",
        "url": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Welcome.png",
        "for": 1
      },
      [
        "...",
        0.5
      ],
      "Hi, I'm Max.",
      "...",
      [
        "You have an interest in taking advantage of the market and trading. I'm here to help you get the most out of your experience and your investments.",
        5
      ],
      "...",
      [
        "One question...",
        1
      ],
      [
        "...",
        3
      ],
      [
        "Do you have experience trading CFD products?",
        1
      ],
      [
        "...",
        1
      ],
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "I have no trading experience",
            "postback": "I have no trading experience",
            "goto": 2
          },
          {
            "id": 2,
            "type": "button",
            "text": "I have trading experience",
            "postback": "I have trading experience",
            "goto": 100
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "onLoad": [
      "no Exp welcome",
      "block_id=[blockId]"
    ],
    "name": "no Exp welcome",
    "messages": [
      [
        "...",
        4
      ],
      [
        "Right, first thing you should know: you need to understand what you're doing. And for that, we give a special promotion to our new customer <b>first deal without risk, when the profit from the deal are yours and the losses (if any) are on us (up to $50)</b> so you can start trading with risk-free that way you get to enjoy making potentially profitable trades on your own terms.",
        15
      ],
      [
        "...",
        2
      ],
      "in addition to that,  we're giving you a few more things, namely...",
      [
        "...",
        2
      ],
      "<b>Demo account </b>that you can start practicing on. ",
      [
        "...",
        2
      ],
      "<b>Access to iFOREX's educational materials</b> to build your knowledge",
      [
        "...",
        2
      ],
      "We'll discuss details later, we still have a few more topics to cover in order for you to trade with confidence.",
      {
        "type": "goto",
        "blockId": 10
      }
    ],
    "blockid": 2
  },
  {
    "id": 3,
    "onLoad": [
      "tell-me-more",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onClick": [
      "tell me more",
      "block_id=[blockId]"
    ],
    "name": "Tell me more",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "type": "button",
            "text": "Tell me more",
            "postback": "Tell me more",
            "goto": 10
          }
        ]
      }
    ],
    "blockid": 3
  },
  {
    "id": 10,
    "name": "no ex trading Benefits",
    "onLoad": [
      "no-ex-trading-Benefits",
      "block_id=[blockId]"
    ],
    "onClick": [
      "ready-to-learn",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "I'm ready to learn more",
            "postback": "I'm ready to learn more",
            "goto": 11
          },
          {
            "id": 2,
            "type": "button",
            "text": "I'm ready to deposit and trade now",
            "postback": "I'm ready to deposit and trade now",
            "onClick": [
              "deposit",
              null,
              true
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 11,
    "name": "ready to learn",
    "onLoad": [
      "ready-to-learn",
      "block_id=[blockId]"
    ],
    "messages": [
      [
        "Great, here we go...",
        1
      ],
      "...",
      {
        "type": "goto",
        "blockId": 12
      }
    ]
  },
  {
    "id": 12,
    "onLoad": [
      "what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "onView": [
      "what-is-CFD-trading-view"
    ],
    "name": "lesson 1/3",
    "messages": [
      {
        "title": "Lesson 1/3",
        "description": "What is CFD Trading",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFD.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "url": "//fast.wistia.net/embed/iframe/mtaxxmlr2p?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 16,
        "grace": 8,
        "goto": 13
      }
    ]
  },
  {
    "id": 13,
    "onLoad": [
      "feedback-what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-what-is-CFD-trading",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 1/3 feedback",
    "messages": [
      "Did you find the \"What is CFD trading\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 15
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 14
          }
        ]
      }
    ]
  },
  {
    "id": 14,
    "onLoad": [
      "lesson-1/3-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 1/3 negative",
    "messages": [
      [
        "...",
        0.5
      ],
      "I hope you find the next lesson more helpful",
      "...",
      {
        "type": "goto",
        "blockId": 20
      }
    ]
  },
  {
    "id": 15,
    "onLoad": [
      "lesson-1/3-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 1/3 positive",
    "messages": [
      [
        "...",
        0.5
      ],
      "Great, let's continue to the next lesson",
      "...",
      {
        "type": "goto",
        "blockId": 20
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 20
          }
        ]
      }
    ],
    "name": "Lesson 1/3 timeout",
    "id": 16
  },
  {
    "id": 20,
    "onLoad": [
      "What-is-leverage-trading",
      "block_id=[blockId]"
    ],
    "onView": [
      "What-is-leverage-trading-view"
    ],
    "name": "lesson 2/3",
    "messages": [
      {
        "title": "Lesson 2/3",
        "description": "What is Leverage Trading",
        "type": "video",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Leverage.png",
        "url": "//fast.wistia.net/embed/iframe/c1lb31jj9t?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 24,
        "grace": 8,
        "goto": 21
      }
    ]
  },
  {
    "id": 21,
    "onLoad": [
      "feedback-What-is-leverage-trading",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-What-is-leverage-trading",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 2/3 feedback",
    "messages": [
      "Did you find the \"What is leverage trading\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 23
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 22
          }
        ]
      }
    ]
  },
  {
    "id": 22,
    "onLoad": [
      "lesson-2/3-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 2/3 negative",
    "messages": [
      [
        "...",
        0.5
      ],
      "I hope you find the next lesson more helpful",
      "...",
      {
        "type": "goto",
        "blockId": 27
      }
    ]
  },
  {
    "id": 23,
    "onLoad": [
      "lesson-2/3-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 2/3 positive",
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "type": "goto",
        "blockId": 27
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 27
          }
        ]
      }
    ],
    "name": "Lesson 2/3 timeout",
    "id": 24
  },
  {
    "id": 27,
    "onLoad": [
      "Trading-example",
      "block_id=[blockId]"
    ],
    "onView": [
      "Trading-example-view"
    ],
    "name": "lesson 3/3",
    "messages": [
      {
        "title": "Lesson 3/3",
        "description": "Trading Example",
        "subtitle": "Find a quick",
        "type": "lesson",
        "thumbnailDimensions": [
          49,
          48
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "url": "//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/eng/index_SimpleTradingExample.html",
        "gotoGrace": 31,
        "grace": 8,
        "goto": 28
      }
    ]
  },
  {
    "id": 28,
    "onLoad": [
      "feedback-Trading-example",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-Trading-example",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 3/3 feedback",
    "messages": [
      "Did you find the \"Trading example\" lesson helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 30
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 29
          }
        ]
      }
    ]
  },
  {
    "id": 29,
    "onLoad": [
      "lesson-3/3-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 3/3 negative",
    "messages": [
      "...",
      "Thanks for your feedback",
      "...",
      {
        "type": "goto",
        "blockId": 33
      }
    ]
  },
  {
    "id": 30,
    "onLoad": [
      "lesson-3/3-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 3/3 positive",
    "messages": [
      "...",
      "Great, thanks for the feedback",
      "...",
      {
        "type": "goto",
        "blockId": 33
      }
    ]
  },
  {
    "messages": [
      {
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 33
          }
        ],
        "type": "choices"
      }
    ],
    "name": "Lesson 3/3 timeout",
    "id": 31
  },
  {
    "id": 33,
    "onLoad": [
      "quiz1-start-message",
      "block_id=[blockId]"
    ],
    "name": "quiz start message",
    "messages": [
      "Let's make sure you're keeping up. Here are a few questions for you.",
      "...",
      {
        "type": "goto",
        "blockId": 34
      }
    ]
  },
  {
    "id": 34,
    "onLoad": [
      "quiz-what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "onClick": [
      "quiz-what-is-CFD-trading",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "quiz - what is CFD",
    "messages": [
      {
        "type": "quiz",
        "text": "What is CFD trading?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "A way to benefit from the price movements of real financial products without owning them",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "Purchasing real financial products from the stock market",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "goto": 35
          },
          "wrong": {
            "goto": 36
          }
        }
      }
    ]
  },
  {
    "id": 35,
    "onLoad": [
      "quiz-Which-leverage",
      "block_id=[blockId]"
    ],
    "onClick": [
      "quiz-Which-leverage",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "Quiz - leverage (correct)",
    "messages": [
      {
        "type": "quiz",
        "text": "Which leverage would lead to larger potential profits?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "1:400",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "1:30",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>2/2</b> You've been paying attention!",
            "goto": 37
          },
          "wrong": {
            "type": "text",
            "text": "<b>1/2</b> Not bad, let's move on",
            "goto": 37
          }
        }
      }
    ]
  },
  {
    "id": 36,
    "onLoad": [
      "quiz-Which-leverage",
      "block_id=[blockId]"
    ],
    "onClick": [
      "quiz-Which-leverage",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "quiz - leverage (wrong)",
    "messages": [
      {
        "type": "quiz",
        "text": "Which leverage would lead to larger potential profits?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "1:400",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "1:30",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>1/2</b> Not bad, let's move on",
            "goto": 37
          },
          "wrong": {
            "type": "text",
            "text": "<b>0/2</b> ok... let's move forward ",
            "goto": 37
          }
        }
      }
    ]
  },
  {
    "id": 37,
    "onLoad": [
      "continue-after-quiz1",
      "block_id=[blockId]"
    ],
    "onClick": [
      "continue-after-quiz1",
      "block_id=[blockId]"
    ],
    "name": "continue",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 38
          }
        ]
      }
    ]
  },
  {
    "id": 38,
    "onLoad": [
      "show-the-tools",
      "block_id=[blockId]"
    ],
    "onClick": [
      "show-the-tools",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "show the tools?",
    "messages": [
      [
        "Right, let's move on.<br />We've explained the basics of trading. You're almost ready to explore the market for opportunities. But first, here are some platform tools that could help you make informed decisions when trading...",
        3
      ],
      [
        "...",
        2
      ],
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "type": "button",
            "text": "I'm interested,<br />show me the tools",
            "postback": "I'm interested,<br/> show me the tools",
            "goto": 39
          },
          {
            "id": 1000,
            "type": "button",
            "text": "I'm ready to deposit<br />and trade now",
            "postback": "I'm ready to deposit<br/> and trade now",
            "onClick": [
              "deposit",
              null,
              true
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 39,
    "onLoad": [
      "interested-in-tools",
      "block_id=[blockId]"
    ],
    "name": "interested in tools",
    "messages": [
      "...",
      [
        "Good, the more information you have, the more you can take advantage of financial opportunities.",
        1
      ],
      "...",
      {
        "type": "goto",
        "blockId": 40
      }
    ]
  },
  {
    "id": 40,
    "onLoad": [
      "What-is-signals",
      "block_id=[blockId]"
    ],
    "onView": [
      "What-is-signals-view"
    ],
    "name": "lesson 4/6",
    "messages": [
      {
        "title": "Lesson 1/3",
        "description": "What are Trade Signals",
        "type": "video",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals.png",
        "url": "//fast.wistia.net/embed/iframe/g89feye8bf?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 44,
        "grace": 8,
        "goto": 41
      }
    ]
  },
  {
    "id": 41,
    "onLoad": [
      "feedback-What-are-signals",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-What-are-signals",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 4/6 feedback",
    "messages": [
      "Did you find the \"What are signals\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 43
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 42
          }
        ]
      }
    ]
  },
  {
    "id": 42,
    "onLoad": [
      "lesson-4/6-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 4/6 negative",
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "type": "goto",
        "blockId": 50
      }
    ]
  },
  {
    "id": 43,
    "onLoad": [
      "lesson-4/6-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 4/6 positive",
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "type": "goto",
        "blockId": 50
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 50
          }
        ]
      }
    ],
    "name": "Lesson 4/6 timeout",
    "id": 44
  },
  {
    "id": 50,
    "onLoad": [
      "What-is-market-sentiment",
      "block_id=[blockId]"
    ],
    "onView": [
      "What-is-market-sentiment-view"
    ],
    "name": "lesson 5/6",
    "messages": [
      {
        "title": "Lesson 2/3",
        "description": "What is market Sentiment",
        "type": "video",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Sentiment.png",
        "url": "//fast.wistia.net/embed/iframe/dvcw0o1xm9?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 54,
        "grace": 8,
        "goto": 51
      }
    ]
  },
  {
    "id": 51,
    "onLoad": [
      "feedback-What-is-market-sentiment",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-What-is-market-sentiment",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 5/6 feedback",
    "messages": [
      "Did you find the \"What is market sentiment\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 52
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 53
          }
        ]
      }
    ]
  },
  {
    "id": 52,
    "onLoad": [
      "lesson-5/6-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 5/6 positive",
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "type": "goto",
        "blockId": 60
      }
    ]
  },
  {
    "id": 53,
    "onLoad": [
      "lesson-5/6-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 5/6 negative",
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "type": "goto",
        "blockId": 60
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 60
          }
        ]
      }
    ],
    "name": "Lesson 5/6 timeout",
    "id": 54
  },
  {
    "id": 60,
    "onLoad": [
      "What-are-trading-factors",
      "block_id=[blockId]"
    ],
    "onView": [
      "What-are-trading-factors-view"
    ],
    "name": "lesson 6/6",
    "messages": [
      {
        "title": "Lesson 3/3",
        "description": "What are Trading Factors",
        "subtitle": "",
        "type": "video",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/factors.png",
        "url": "//fast.wistia.net/embed/iframe/cr4lphjpui?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 64,
        "grace": 8,
        "goto": 61
      }
    ]
  },
  {
    "id": 61,
    "onLoad": [
      "feedbac-kWhat-are-trading-factors",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-What-are-trading-factors",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 6/6 feedback",
    "messages": [
      "Did you find the \"What are trading factors\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 63
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 62
          }
        ]
      }
    ]
  },
  {
    "id": 62,
    "onLoad": [
      "lesson-6/6-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 6/6 negative",
    "messages": [
      "...",
      "Thanks for your feedback",
      "...",
      {
        "type": "goto",
        "blockId": 84
      }
    ]
  },
  {
    "id": 63,
    "onLoad": [
      "lesson-6/6-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 6/6 positive",
    "messages": [
      "...",
      "Great, Thanks for your feedback",
      "...",
      {
        "type": "goto",
        "blockId": 84
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 84
          }
        ]
      }
    ],
    "name": "Lesson 6/6 timeout",
    "id": 64
  },
  {
    "id": 84,
    "onLoad": [
      "quiz2-start-message",
      "block_id=[blockId]"
    ],
    "name": "quiz start message",
    "messages": [
      "Let's make sure you're keeping up. Here are a few questions for you.",
      "...",
      {
        "type": "goto",
        "blockId": 85
      }
    ]
  },
  {
    "id": 85,
    "onLoad": [
      "quiz-Extreme weather events",
      "block_id=[blockId]"
    ],
    "onClick": [
      "quiz-Extreme weather events",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "quiz - weather events",
    "messages": [
      {
        "type": "quiz",
        "text": "Extreme weather events (e.g.: hurricane, drought) can be expected to affect the price of…?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Agricultural commodities such as coffee, sugar and cocoa ",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "”Safe haven” commodities such as gold",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "goto": 86
          },
          "wrong": {
            "goto": 87
          }
        }
      }
    ]
  },
  {
    "id": 86,
    "onLoad": [
      "quiz-What-is-trading-sentiment",
      "block_id=[blockId]"
    ],
    "onClick": [
      "quiz-What-is-trading-sentiment",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "Quiz - sentiments (correct)",
    "messages": [
      {
        "type": "quiz",
        "text": "What is trading sentiment?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "A tool that shows whether the majority of traders expected an instrument to rise or fall ",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "A tool that shows how analysts predict an instrument to perform",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>2/2</b> Well done, a world of investment opportunities awaits you ",
            "goto": 88
          },
          "wrong": {
            "type": "text",
            "text": "<b>1/2 </b>Not bad... Remember, you gain access to all our educational materials after your deposit",
            "goto": 88
          }
        }
      }
    ]
  },
  {
    "id": 87,
    "onLoad": [
      "quiz-What-is-trading-sentiment",
      "block_id=[blockId]"
    ],
    "onClick": [
      "quiz-What-is-trading-sentiment",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "Quiz - sentiments (wrong)",
    "messages": [
      {
        "type": "quiz",
        "text": "What is trading sentiment?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "A tool that shows whether the majority of traders expected an instrument to rise or fall ",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "A tool that shows how analysts predict an instrument to perform ",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>1/2</b> Not bad... Remember, you gain access to all our educational materials after your deposit",
            "goto": 88
          },
          "wrong": {
            "type": "text",
            "text": "<b>0/2</b> mm... Remember, you gain access to all our educational materials after your deposit",
            "goto": 88
          }
        }
      }
    ]
  },
  {
    "id": 88,
    "onLoad": [
      "continue-after-quiz2",
      "block_id=[blockId]"
    ],
    "onClick": [
      "continue-after-quiz2",
      "block_id=[blockId]"
    ],
    "name": "continue",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 89
          }
        ]
      }
    ]
  },
  {
    "id": 89,
    "onLoad": [
      "laid-the-foundation",
      "block_id=[blockId]"
    ],
    "name": "laid the foundation",
    "messages": [
      [
        "...",
        3
      ],
      [
        "So, we have laid the foundation for your understanding. You now have the basics to build on.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Feel free to use the <b>educational materials</b> and practice with your own <b>demo account</b>.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Don’t forget  that your first deal is without risk, <b>when the profits from the deal are yours and the losses (if any) are onus (up to $50), so you can start trading risk-free</b>.",
        1
      ],
      [
        "...",
        2
      ],
      [
        "Take this rare opportunity to capitalise on your investment.",
        2
      ],
      {
        "type": "goto",
        "blockId": 92
      }
    ]
  },
  {
    "id": 91,
    "onLoad": [
      "The-choice-is-yours",
      "block_id=[blockId]"
    ],
    "name": "The choice is yours",
    "messages": [
      [
        "The choice is yours... after you receive the package you can start trading whenever you like, or - if you change your mind -<b> you can always withdraw your deposit, no questions asked, no charges, 100% risk-free</b>. Take this rare opportunity to capitalize on your investment.",
        3
      ],
      "...",
      {
        "type": "goto",
        "blockId": 92
      }
    ]
  },
  {
    "id": 92,
    "onLoad": [
      "end-non-exp-flow-button",
      "block_id=[blockId]"
    ],
    "onClick": [
      "walkthrough-open",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "ready to deposit?",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "onClick": [
              "deposit",
              null,
              true
            ],
            "type": "button",
            "text": "Deposit and enjoy first deal risk-free ",
            "postback": "Deposit and enjoy first deal risk-free "
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "Not 100% ready? Take a platform walkthrough tour",
            "postback": "Not 100% ready? Take a platform walkthrough tour",
            "onClick": [
              "walkthrough",
              "introduction",
              true
            ],
            "goto": 93
          }
        ]
      }
    ]
  },
  {
    "id": 93,
    "onLoad": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "onClick": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "name": "after walkthrough",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "onClick": [
              "deposit",
              null,
              true
            ],
            "type": "button",
            "text": "Deposit and enjoy first deal risk-free ",
            "postback": "Deposit and enjoy first deal risk-free "
          }
        ]
      }
    ]
  },
  {
    "id": 94,
    "name": "after deposit",
    "messages": [
      [
        "Congratulations, you can now access the full deposit package including access to educational materials, risk free demo account and 1-on-1 training. For further details, please feel free to contact us.",
        1
      ],
      null
    ]
  },
  {
    "id": 100,
    "onLoad": [
      "Exp-welcome",
      "block_id=[blockId]"
    ],
    "name": "EXp welcome",
    "messages": [
      [
        "...",
        2
      ],
      [
        "You need to feel confident with your broker, And for that, we give a special promotion  to our new customers. <b>First deal  without risk, when the profits from the deal are yours and the losses (if any) are on us (up to $50) so you can start trading with risk free</b> ",
        4
      ],
      [
        "...",
        2
      ],
      [
        "<b>We're  worldwide licensed broker with 22+ years experience</b>,  operating in multiple international markets, speaking over 20 languages to tens of thousands of traders who choose to invest with us.",
        3
      ],
      "...",
      [
        "Quite simply, <b>we have a reputation for being among the leaders in the world of online financial trading</b>.",
        2
      ],
      [
        "..."
      ],
      [
        "on top of the first deal promotion. This is what we have to offer:"
      ],
      "...",
      [
        "Up to<b> 100% cashback</b> from your 2nd deposit onwards",
        1
      ],
      {
        "type": "goto",
        "blockId": 101
      }
    ]
  },
  {
    "id": 101,
    "onLoad": [
      "show-me-more",
      "block_id=[blockId]"
    ],
    "name": "show me more",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "type": "button",
            "text": "I'm interested. Show me more",
            "postback": "I'm interested. Show me more",
            "goto": 102
          }
        ]
      }
    ]
  },
  {
    "id": 102,
    "onLoad": [
      "Exp-benefits",
      "block_id=[blockId]"
    ],
    "name": "EXp BENEFITS",
    "messages": [
      [
        "...",
        1
      ],
      [
        "Up to <b> 400:1 leverage </b> and competitive spreads.",
        1
      ],
      "...",
      [
        "Earn <b>3% interest </b> on your net balance.",
        1.5
      ],
      "...",
      [
        "Rapid withdrawal system"
      ],
      "...",
      [
        "This is just the start! Did I mention that we also give you <b>trading signals, a $5,000 demo account</b> to practice on, <b>educational materials</b> for advanced training and much, much more..",
        4
      ],
      "...",
      {
        "type": "goto",
        "blockId": 103
      }
    ]
  },
  {
    "id": 103,
    "name": "ready to learn?",
    "onLoad": [
      "buttons-trading-tools",
      "block_id=[blockId]"
    ],
    "onClick": [
      "trading-tools",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "type": "button",
            "text": "Tell me a bit about the trading tools (5 mins)",
            "postback": "Tell me a bit about the trading tools (5 mins)",
            "goto": 104
          },
          {
            "id": 1000,
            "type": "button",
            "text": "Give me the full tour (10 mins)",
            "postback": "Give me the full tour",
            "goto": 11
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "I'm ready to deposit and trade now",
            "postback": "I'm ready to deposit and trade now",
            "onClick": [
              "deposit",
              null,
              true
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 104,
    "onLoad": [
      "good-information",
      "block_id=[blockId]"
    ],
    "name": "good information",
    "messages": [
      [
        "...",
        2
      ],
      [
        "Good, the more information you have, the more you can take advantage of financial opportunities.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "We built our platform for traders and let our experience guide us towards providing the tools and features they want.  Our purpose? To maximize your investment potential with our easy-to-use platform, as well as helping you make better-informed decisions and getting the most out of your trading strategies.",
        7
      ],
      [
        "...",
        2
      ],
      [
        "Let's get straight to it… ."
      ],
      [
        "...",
        1
      ],
      [
        "Our platform offer includes tools such as:"
      ],
      "...",
      {
        "type": "goto",
        "blockId": 110
      }
    ]
  },
  {
    "id": 110,
    "onLoad": [
      "What-are-signals",
      "block_id=[blockId]"
    ],
    "onView": [
      "What-are-signals-view"
    ],
    "name": "lesson 1/3",
    "messages": [
      {
        "title": "Lesson 1/3",
        "description": "What are Trade Signals",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals.png",
        "url": "//fast.wistia.net/embed/iframe/g89feye8bf?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 114,
        "grace": 8,
        "goto": 111
      }
    ]
  },
  {
    "id": 111,
    "onLoad": [
      "feedback-What-is-signals",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-What-is-signals",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 1/3 feedback",
    "messages": [
      "Did you find the \"What are signals\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 113
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 112
          }
        ]
      }
    ]
  },
  {
    "id": 112,
    "onLoad": [
      "lesson-1/3-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 1/3 negaitive",
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "type": "goto",
        "blockId": 120
      }
    ]
  },
  {
    "id": 113,
    "onLoad": [
      "lesson-1/3-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 1/3 positive",
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "type": "goto",
        "blockId": 120
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 120
          }
        ]
      }
    ],
    "name": "Lesson 1/3 timeout",
    "id": 114
  },
  {
    "id": 120,
    "onLoad": [
      "feedback-What-is-signals",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-What-is-signals",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "Lesson 2/3",
    "messages": [
      {
        "title": "Lesson 2/3",
        "description": "Market Indicators",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Indicators.png",
        "url": "//fast.wistia.net/embed/iframe/yassecsbp6?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "gotoGrace": 124,
        "grace": 5,
        "goto": 121
      }
    ]
  },
  {
    "id": 121,
    "onLoad": [
      "feedback-Market-indicators",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-Market-indicators",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 2/3 feedback",
    "messages": [
      "Did you find the \"Market Indicators\" video helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 122
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 123
          }
        ]
      }
    ]
  },
  {
    "id": 122,
    "onLoad": [
      "lesson-2/3-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 2/3 positive",
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "type": "goto",
        "blockId": 130
      }
    ]
  },
  {
    "id": 123,
    "onLoad": [
      "lesson-2/3-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 2/3 negaitive",
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "type": "goto",
        "blockId": 130
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 130
          }
        ]
      }
    ],
    "name": "Lesson 2/3 timeout",
    "id": 124
  },
  {
    "id": 130,
    "onLoad": [
      "basic-technical-analysis",
      "block_id=[blockId]"
    ],
    "onView": [
      "basic-technical-analysis-view"
    ],
    "name": "Lesson 3/3",
    "messages": [
      {
        "title": "Lesson 3/3",
        "description": "Basic Technical Analysis",
        "type": "lesson",
        "thumbnailDimensions": [
          49,
          48
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "url": "//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/eng/index_TechnicalAnalysis.html",
        "gotoGrace": 134,
        "grace": 5,
        "goto": 131
      }
    ]
  },
  {
    "id": 131,
    "onLoad": [
      "feedback-basic-technical-analysis",
      "block_id=[blockId]"
    ],
    "onClick": [
      "video-feedback-basic-technical-analysis",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "name": "lesson 3/3 feedback",
    "messages": [
      "Did you find the \"basic technical analysis\" lesson helpful?",
      {
        "type": "feedback",
        "choices": [
          {
            "id": 1000,
            "type": "positive",
            "goto": 132
          },
          {
            "id": 1001,
            "type": "negative",
            "goto": 133
          }
        ]
      }
    ]
  },
  {
    "id": 132,
    "onLoad": [
      "lesson-3/3-positive",
      "block_id=[blockId]"
    ],
    "name": "lesson 3/3 positive",
    "messages": [
      "...",
      "Great, Thanks for your feedback",
      "...",
      {
        "type": "goto",
        "blockId": 140
      }
    ]
  },
  {
    "id": 133,
    "onLoad": [
      "lesson-3/3-negative",
      "block_id=[blockId]"
    ],
    "name": "lesson 3/3 negaitive",
    "messages": [
      "...",
      "Thanks for your feedback",
      "...",
      {
        "type": "goto",
        "blockId": 140
      }
    ]
  },
  {
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Continue",
            "postback": "Continue",
            "goto": 140
          }
        ]
      }
    ],
    "name": "Lesson 3/3 timeout",
    "id": 134
  },
  {
    "id": 140,
    "onLoad": [
      "Like-what-you-see",
      "block_id=[blockId]"
    ],
    "name": "Like what you see?",
    "messages": [
      "...",
      "Like what you see? <b>Start now with first deal risk free </b>and  complete access to the full range of dynamic tools and features available on our platform.",
      "...",
      {
        "type": "goto",
        "blockId": 142
      }
    ]
  },
  {
    "id": 141,
    "onLoad": [
      "if-you-change-your-mind",
      "block_id=[blockId]"
    ],
    "name": "if you change your mind",
    "messages": [
      "...",
      "Always remember, if you change your mind, you can withdraw your deposit anytime, no questions asked, no charges, 100% risk-free.",
      "...",
      {
        "type": "goto",
        "blockId": 142
      }
    ]
  },
  {
    "id": 142,
    "onLoad": [
      "end-exp-flow-button",
      "block_id=[blockId]"
    ],
    "onClick": [
      "end-exp-flow-button",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "name": "Deposit",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "onClick": [
              "deposit",
              null,
              true
            ],
            "type": "button",
            "text": "Deposit and enjoy first deal risk-free ",
            "postback": "Deposit and enjoy first deal risk-free "
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "Not 100% ready? Take a platform walkthrough tour",
            "postback": "Not 100% ready? Take a platform walkthrough tour",
            "onClick": [
              "walkthrough",
              "introduction",
              true
            ],
            "goto": 143
          }
        ]
      }
    ],
    "blockid": 142
  },
  {
    "id": 143,
    "onLoad": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "onClick": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "name": "after walkthrough",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "id": 1000,
            "onClick": [
              "deposit",
              null,
              true
            ],
            "type": "button",
            "text": "Deposit and collect package",
            "postback": "Deposit and collect package"
          }
        ]
      }
    ],
    "blockid": 143
  }
]
