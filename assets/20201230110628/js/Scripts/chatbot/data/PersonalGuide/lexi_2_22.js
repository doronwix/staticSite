﻿[
  {
    "messages": [
      {
        "for": 1,
        "url": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Lexiv2_image.jpg",
        "type": "image"
      },
      [
        "...",
        0.5
      ],
      [
        "Hello, my name's Lexi.",
        1
      ],
      [
        "...",
        1
      ],
      [
        "Together, we'll navigate your path through our trading platform and connect you to financial opportunities.",
        4
      ],
      [
        "...",
        1
      ],
      [
        "Let's start with a question:"
      ],
      [
        "...",
        1
      ],
      [
        "Do you have experience trading CFD products?"
      ],
      [
        "...",
        1
      ],
      {
        "choices": [
          {
            "goto": 2,
            "postback": "I have no trading experience",
            "text": "I have no trading experience",
            "type": "button",
            "id": 1
          },
          {
            "goto": 100,
            "postback": "I have trading experience",
            "text": "I have trading experience",
            "type": "button",
            "id": 2
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "trading-experience-select",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "welcome-message",
      "block_id=[blockId]"
    ],
    "name": "welcome message",
    "id": 1,
    "blockid": 1
  },
  {
    "blockid": 2,
    "messages": [
      [
        "...",
        1
      ],
      [
        "Well, you're in luck! Our platform connects people to global financial opportunities. However, many  traders don't know how to get started.",
        3
      ],
      [
        "...",
        2
      ],
      [
        "So, we used our 20+ years of experience  to set up a 'tour' for traders just like you.",
        5
      ],
      [
        "...",
        2
      ],
      [
        "We're about to start your personal trading “tour”, where we will learn about the advantages - and the risks - of CFD trading. ",
        4
      ],
      [
        "...",
        2
      ],
      [
        "To assist you on your way, we will give you...  ",
        3
      ],
      [
        "...",
        2
      ],
      [
        "<b>Free 1-on-1 training </b>for a personal touch or to ask questions ",
        1
      ],
      [
        "...",
        2
      ],
      {
        "blockId": 10,
        "type": "goto"
      }
    ],
    "name": "no Exp welcome",
    "onLoad": [
      "no Exp welcome",
      "block_id=[blockId]"
    ],
    "id": 2
  },
  {
    "blockid": 3,
    "messages": [
      {
        "choices": [
          {
            "goto": 10,
            "postback": "I'm interested. Show me more? ",
            "text": "I'm interested. Show me more ",
            "type": "button",
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "I'm interested. Show me more",
    "onClick": [
      "I'm interested. Show me more",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "I'm interested. Show me more",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "id": 3
  },
  {
    "messages": [
      [
        "Access to <b>educational tutorials</b> and a <b>demo account</b> for risk-free practice.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Keep in mind you also get up to <b> 50% trading bonus on your deposit</b>.",
        4
      ],
      [
        "...",
        2
      ],
      "You get all of this with your deposit package. Wait, that comes later, we still have a few more things to show you…",
      [
        "...",
        2
      ],
      {
        "choices": [
          {
            "goto": 11,
            "postback": "Give me the full tour (10 mins)",
            "text": "Give me the full tour (10 mins)",
            "type": "button",
            "id": 1
          },
          {
            "goto": 39,
            "postback": "Tell me about your trading tools (5 mins)",
            "text": "Tell me about your trading tools (5 mins)",
            "type": "button",
            "id": 1
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "I'm ready to deposit and trade now",
            "text": "I'm ready to deposit and trade now",
            "type": "button",
            "id": 2
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "ready-to-learn",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "no-ex-trading-Benefits",
      "block_id=[blockId]"
    ],
    "name": "no ex trading Benefits",
    "id": 10
  },
  {
    "messages": [
      [
        "Great, here we go...",
        1
      ],
      "...",
      {
        "blockId": 12,
        "type": "goto"
      }
    ],
    "onLoad": [
      "ready-to-learn",
      "block_id=[blockId]"
    ],
    "name": "ready to learn",
    "id": 11
  },
  {
    "messages": [
      {
        "goto": 13,
        "grace": 8,
        "gotoGrace": 16,
        "url": "//fast.wistia.net/embed/iframe/mtaxxmlr2p?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFD.png",
        "type": "video",
        "description": "What is CFD Trading",
        "title": "Lesson 1/3"
      }
    ],
    "name": "lesson 1/3",
    "onView": [
      "what-is-CFD-trading-view"
    ],
    "onLoad": [
      "what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "id": 12
  },
  {
    "messages": [
      "Did you find the \"What is CFD trading\" video helpful?",
      {
        "choices": [
          {
            "goto": 15,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 14,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 1/3 feedback",
    "onClick": [
      "video-feedback-what-is-CFD-trading",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "id": 13
  },
  {
    "messages": [
      [
        "...",
        0.5
      ],
      "I hope you find the next lesson more helpful",
      "...",
      {
        "blockId": 20,
        "type": "goto"
      }
    ],
    "name": "lesson 1/3 negative",
    "onLoad": [
      "lesson-1/3-negative",
      "block_id=[blockId]"
    ],
    "id": 14
  },
  {
    "messages": [
      [
        "...",
        0.5
      ],
      "Great, let's continue to the next lesson",
      "...",
      {
        "blockId": 20,
        "type": "goto"
      }
    ],
    "name": "lesson 1/3 positive",
    "onLoad": [
      "lesson-1/3-positive",
      "block_id=[blockId]"
    ],
    "id": 15
  },
  {
    "id": 16,
    "name": "Lesson 1/3 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 20,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      {
        "goto": 21,
        "grace": 8,
        "gotoGrace": 24,
        "url": "//fast.wistia.net/embed/iframe/c1lb31jj9t?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Leverage.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "What is Leverage Trading",
        "title": "Lesson 2/3"
      }
    ],
    "name": "lesson 2/3",
    "onView": [
      "What-is-leverage-trading-view"
    ],
    "onLoad": [
      "What-is-leverage-trading",
      "block_id=[blockId]"
    ],
    "id": 20
  },
  {
    "messages": [
      "Did you find the \"What is leverage trading\" video helpful?",
      {
        "choices": [
          {
            "goto": 23,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 22,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 2/3 feedback",
    "onClick": [
      "video-feedback-What-is-leverage-trading",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-What-is-leverage-trading",
      "block_id=[blockId]"
    ],
    "id": 21
  },
  {
    "messages": [
      [
        "...",
        0.5
      ],
      "I hope you find the next lesson more helpful",
      "...",
      {
        "blockId": 27,
        "type": "goto"
      }
    ],
    "name": "lesson 2/3 negative",
    "onLoad": [
      "lesson-2/3-negative",
      "block_id=[blockId]"
    ],
    "id": 22
  },
  {
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "blockId": 27,
        "type": "goto"
      }
    ],
    "name": "lesson 2/3 positive",
    "onLoad": [
      "lesson-2/3-positive",
      "block_id=[blockId]"
    ],
    "id": 23
  },
  {
    "id": 24,
    "name": "Lesson 2/3 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 27,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      {
        "goto": 28,
        "grace": 8,
        "gotoGrace": 31,
        "url": "//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/kor/index_SimpleTradingExample_kor.html",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "thumbnailDimensions": [
          49,
          48
        ],
        "type": "lesson",
        "subtitle": "Find a quick",
        "description": "Trading Example",
        "title": "Lesson 3/3"
      }
    ],
    "name": "lesson 3/3",
    "onView": [
      "Trading-example-view"
    ],
    "onLoad": [
      "Trading-example",
      "block_id=[blockId]"
    ],
    "id": 27
  },
  {
    "messages": [
      "Did you find the \"Trading example\" lesson helpful?",
      {
        "choices": [
          {
            "goto": 30,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 29,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 3/3 feedback",
    "onClick": [
      "video-feedback-Trading-example",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-Trading-example",
      "block_id=[blockId]"
    ],
    "id": 28
  },
  {
    "messages": [
      "...",
      "Thanks for your feedback",
      "...",
      {
        "blockId": 33,
        "type": "goto"
      }
    ],
    "name": "lesson 3/3 negative",
    "onLoad": [
      "lesson-3/3-negative",
      "block_id=[blockId]"
    ],
    "id": 29
  },
  {
    "messages": [
      "...",
      "Great, thanks for the feedback",
      "...",
      {
        "blockId": 33,
        "type": "goto"
      }
    ],
    "name": "lesson 3/3 positive",
    "onLoad": [
      "lesson-3/3-positive",
      "block_id=[blockId]"
    ],
    "id": 30
  },
  {
    "id": 31,
    "name": "Lesson 3/3 timeout",
    "messages": [
      {
        "type": "choices",
        "choices": [
          {
            "goto": 33,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ]
      }
    ]
  },
  {
    "messages": [
      "Let's make sure you're keeping up. Here are a few questions for you.",
      "...",
      {
        "blockId": 34,
        "type": "goto"
      }
    ],
    "name": "quiz start message",
    "onLoad": [
      "quiz1-start-message",
      "block_id=[blockId]"
    ],
    "id": 33
  },
  {
    "messages": [
      {
        "response": {
          "wrong": {
            "goto": 36
          },
          "correct": {
            "goto": 35
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "A way to benefit from the price movements of real financial products without owning them",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "Purchasing real financial products from the stock market",
            "type": "button",
            "id": 2
          }
        ],
        "text": "What is CFD trading?",
        "type": "quiz"
      }
    ],
    "name": "quiz - what is CFD",
    "onClick": [
      "quiz-what-is-CFD-trading",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "quiz-what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "id": 34
  },
  {
    "messages": [
      {
        "response": {
          "wrong": {
            "goto": 37,
            "text": "<b>1/2</b> Not bad for a start",
            "type": "text"
          },
          "correct": {
            "goto": 37,
            "text": "<b>2/2</b> Well done, you've been paying attention.",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "1:400",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "1:30",
            "type": "button",
            "id": 2
          }
        ],
        "text": "Which leverage would lead to larger potential profits?",
        "type": "quiz"
      }
    ],
    "name": "Quiz - leverage (correct)",
    "onClick": [
      "quiz-Which-leverage",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "quiz-Which-leverage",
      "block_id=[blockId]"
    ],
    "id": 35
  },
  {
    "messages": [
      {
        "response": {
          "wrong": {
            "goto": 37,
            "text": "<b>0/2</b> Learning new stuff is difficult, but don't worry, we'll get there ",
            "type": "text"
          },
          "correct": {
            "goto": 37,
            "text": "<b>1/2</b> Not bad for a start",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "1:400",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "1:30",
            "type": "button",
            "id": 2
          }
        ],
        "text": "Which leverage would lead to larger potential profits?",
        "type": "quiz"
      }
    ],
    "name": "quiz - leverage (wrong)",
    "onClick": [
      "quiz-Which-leverage",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "quiz-Which-leverage",
      "block_id=[blockId]"
    ],
    "id": 36
  },
  {
    "messages": [
      {
        "choices": [
          {
            "goto": 38,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "continue",
    "onClick": [
      "continue-after-quiz1",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "continue-after-quiz1",
      "block_id=[blockId]"
    ],
    "id": 37
  },
  {
    "messages": [
      [
        "We've discussed some of the basics of trading together and we're almost ready to explore the market for opportunities. Are you feeling excited?",
        3
      ],
      [
        "...",
        2
      ],
      [
        " You should be! But first, we should look at some tools that could help you make trading decisions…",
        2
      ],
      {
        "choices": [
          {
            "goto": 39,
            "postback": "I'm interested,<br/> show me the tools",
            "text": "I'm interested,<br />show me the tools",
            "type": "button",
            "id": 1000
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "I'm ready to deposit<br/> and trade now",
            "text": "I'm ready to deposit<br />and trade now",
            "type": "button",
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "show the tools?",
    "onClick": [
      "show-the-tools",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "show-the-tools",
      "block_id=[blockId]"
    ],
    "id": 38
  },
  {
    "messages": [
      "...",
      [
        "Good, the more you know about our trading tools and how to use them, the better it will be for you to take advantage of financial opportunities.",
        4
      ],
      "...",
      {
        "blockId": 40,
        "type": "goto"
      }
    ],
    "name": "interested in tools",
    "onLoad": [
      "interested-in-tools",
      "block_id=[blockId]"
    ],
    "id": 39
  },
  {
    "messages": [
      {
        "goto": 41,
        "grace": 8,
        "gotoGrace": 44,
        "url": "//fast.wistia.net/embed/iframe/g89feye8bf?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "What are Trade Signals",
        "title": "Lesson 1/3"
      }
    ],
    "name": "lesson 4/6",
    "onView": [
      "What-is-signals-view"
    ],
    "onLoad": [
      "What-is-signals",
      "block_id=[blockId]"
    ],
    "id": 40
  },
  {
    "messages": [
      "Did you find the \"What are signals\" video helpful?",
      {
        "choices": [
          {
            "goto": 43,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 42,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 4/6 feedback",
    "onClick": [
      "video-feedback-What-are-signals",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-What-are-signals",
      "block_id=[blockId]"
    ],
    "id": 41
  },
  {
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "blockId": 50,
        "type": "goto"
      }
    ],
    "name": "lesson 4/6 negative",
    "onLoad": [
      "lesson-4/6-negative",
      "block_id=[blockId]"
    ],
    "id": 42
  },
  {
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "blockId": 50,
        "type": "goto"
      }
    ],
    "name": "lesson 4/6 positive",
    "onLoad": [
      "lesson-4/6-positive",
      "block_id=[blockId]"
    ],
    "id": 43
  },
  {
    "id": 44,
    "name": "Lesson 4/6 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 50,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      {
        "goto": 51,
        "grace": 8,
        "gotoGrace": 54,
        "url": "//fast.wistia.net/embed/iframe/dvcw0o1xm9?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Sentiment.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "What is Market Sentiment",
        "title": "Lesson 2/3"
      }
    ],
    "name": "lesson 5/6",
    "onView": [
      "What-is-market-sentiment-view"
    ],
    "onLoad": [
      "What-is-market-sentiment",
      "block_id=[blockId]"
    ],
    "id": 50
  },
  {
    "messages": [
      "Did you find the \"What is market sentiment\" video helpful?",
      {
        "choices": [
          {
            "goto": 52,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 53,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 5/6 feedback",
    "onClick": [
      "video-feedback-What-is-market-sentiment",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-What-is-market-sentiment",
      "block_id=[blockId]"
    ],
    "id": 51
  },
  {
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "blockId": 60,
        "type": "goto"
      }
    ],
    "name": "lesson 5/6 positive",
    "onLoad": [
      "lesson-5/6-positive",
      "block_id=[blockId]"
    ],
    "id": 52
  },
  {
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "blockId": 60,
        "type": "goto"
      }
    ],
    "name": "lesson 5/6 negative",
    "onLoad": [
      "lesson-5/6-negative",
      "block_id=[blockId]"
    ],
    "id": 53
  },
  {
    "id": 54,
    "name": "Lesson 5/6 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 60,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      {
        "goto": 61,
        "grace": 8,
        "gotoGrace": 64,
        "url": "//fast.wistia.net/embed/iframe/cr4lphjpui?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/factors.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "subtitle": "",
        "description": "What are Trading Factors",
        "title": "Lesson 3/3"
      }
    ],
    "name": "lesson 6/6",
    "onView": [
      "What-are-trading-factors-view"
    ],
    "onLoad": [
      "What-are-trading-factors",
      "block_id=[blockId]"
    ],
    "id": 60
  },
  {
    "messages": [
      "Did you find the \"What are trading factors\" video helpful?",
      {
        "choices": [
          {
            "goto": 63,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 62,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 6/6 feedback",
    "onClick": [
      "video-feedback-What-are-trading-factors",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedbac-kWhat-are-trading-factors",
      "block_id=[blockId]"
    ],
    "id": 61
  },
  {
    "messages": [
      "...",
      "Thanks for your feedback",
      "...",
      {
        "blockId": 84,
        "type": "goto"
      }
    ],
    "name": "lesson 6/6 negative",
    "onLoad": [
      "lesson-6/6-negative",
      "block_id=[blockId]"
    ],
    "id": 62
  },
  {
    "messages": [
      "...",
      "Great, Thanks for your feedback",
      "...",
      {
        "blockId": 84,
        "type": "goto"
      }
    ],
    "name": "lesson 6/6 positive",
    "onLoad": [
      "lesson-6/6-positive",
      "block_id=[blockId]"
    ],
    "id": 63
  },
  {
    "id": 64,
    "name": "Lesson 6/6 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 84,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      "Let's make sure you're keeping up. Here are a few questions for you.",
      "...",
      {
        "blockId": 85,
        "type": "goto"
      }
    ],
    "name": "quiz start message",
    "onLoad": [
      "quiz2-start-message",
      "block_id=[blockId]"
    ],
    "id": 84
  },
  {
    "messages": [
      {
        "response": {
          "wrong": {
            "goto": 87
          },
          "correct": {
            "goto": 86
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "Agricultural commodities such as coffee, sugar and cocoa ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "”Safe haven” commodities such as gold",
            "type": "button",
            "id": 2
          }
        ],
        "text": "Extreme weather events (e.g.: hurricane, drought) can be expected to affect the price of…?",
        "type": "quiz"
      }
    ],
    "name": "quiz - weather events",
    "onClick": [
      "quiz-Extreme weather events",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "quiz-Extreme weather events",
      "block_id=[blockId]"
    ],
    "id": 85
  },
  {
    "messages": [
      {
        "response": {
          "wrong": {
            "goto": 88,
            "text": "<b>1/2 </b>Not bad, with experience you'll improve.",
            "type": "text"
          },
          "correct": {
            "goto": 88,
            "text": "<b>2/2</b> Well done, a world of investment opportunities awaits you ",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "A tool that shows whether the majority of traders expected an instrument to rise or fall ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "A tool that shows how analysts predict an instrument to perform",
            "type": "button",
            "id": 2
          }
        ],
        "text": "What is trading sentiment?",
        "type": "quiz"
      }
    ],
    "name": "Quiz - sentiments (correct)",
    "onClick": [
      "quiz-What-is-trading-sentiment",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "quiz-What-is-trading-sentiment",
      "block_id=[blockId]"
    ],
    "id": 86
  },
  {
    "messages": [
      {
        "response": {
          "wrong": {
            "goto": 88,
            "text": "<b>0/2</b> Learning new stuff is difficult, but don't worry, we'll get there",
            "type": "text"
          },
          "correct": {
            "goto": 88,
            "text": "<b>1/2</b> Not bad, with experience you'll improve.",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "A tool that shows whether the majority of traders expected an instrument to rise or fall ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "A tool that shows how analysts predict an instrument to perform ",
            "type": "button",
            "id": 2
          }
        ],
        "text": "What is trading sentiment?",
        "type": "quiz"
      }
    ],
    "name": "Quiz - sentiments (wrong)",
    "onClick": [
      "quiz-What-is-trading-sentiment",
      "answer=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "quiz-What-is-trading-sentiment",
      "block_id=[blockId]"
    ],
    "id": 87
  },
  {
    "messages": [
      {
        "choices": [
          {
            "goto": 89,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "continue",
    "onClick": [
      "continue-after-quiz2",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "continue-after-quiz2",
      "block_id=[blockId]"
    ],
    "id": 88
  },
  {
    "messages": [
      [
        "...",
        1
      ],
      [
        "We started this conversation with a sentence... \"determine your value\"...",
        3
      ],
      [
        "...",
        1
      ],
      [
        "Well, I can't wait to see the value you gain from trading. You have the basics to get started and I will be here whenever you need me.",
        5
      ],
      [
        "...",
        2
      ],
      [
        "Right now, you should go collect your deposit package (includes <B>1-on-1 training</B>, free <B>educational materials</B>, a risk-free <B>demo account</B> PLUS up to <B>50% trading bonus</B> on your deposit). You can start practising on your demo account or trade with real money as soon as you deposit.",
        10
      ],
      [
        "...",
        4
      ],
      {
        "blockId": 91,
        "type": "goto"
      }
    ],
    "name": "laid the foundation",
    "onLoad": [
      "laid-the-foundation",
      "block_id=[blockId]"
    ],
    "id": 89
  },
  {
    "messages": [
      [
        "Remember, you can always withdraw your deposit, no charges, no questions asked, 100% risk-free. Don't miss this rare opportunity to capitalise on your investment. ",
        5
      ],
      "...",
      {
        "blockId": 92,
        "type": "goto"
      }
    ],
    "name": "The choice is yours",
    "onLoad": [
      "The-choice-is-yours",
      "block_id=[blockId]"
    ],
    "id": 91
  },
  {
    "messages": [
      {
        "choices": [
          {
            "postback": "Deposit and collect package",
            "text": "Deposit and collect package",
            "type": "button",
            "onClick": [
              "deposit",
              null,
              true
            ],
            "id": 1000
          },
          {
            "goto": 93,
            "onClick": [
              "walkthrough",
              "introduction",
              true
            ],
            "postback": "Not 100% ready? Take a platform walkthrough tour",
            "text": "Not 100% ready? Take a platform walkthrough tour",
            "type": "buton",
            "id": 1001
          }
        ],
        "type": "choices"
      }
    ],
    "name": "ready to deposit?",
    "onClick": [
      "walkthrough-open",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "end-non-exp-flow-button",
      "block_id=[blockId]"
    ],
    "id": 92
  },
  {
    "messages": [
      {
        "choices": [
          {
            "postback": "Deposit and collect package",
            "text": "Deposit and collect package",
            "type": "button",
            "onClick": [
              "deposit",
              null,
              true
            ],
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "after walkthrough",
    "onClick": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "id": 93
  },
  {
    "messages": [
      [
        "Congratulations, you can now access the full deposit package including access to educational materials, risk free demo account and 1-on-1 training. For further details, please feel free to contact us.",
        1
      ],
      null
    ],
    "name": "after deposit",
    "id": 94
  },
  {
    "messages": [
      [
        "...",
        2
      ],
      [
        "Great, we're experienced ourselves, with over 22 years as part of the iFOREX Group, operating in multiple international markets as a licensed broker, so hopefully, we're both looking for the same thing… great opportunities! ",
        7
      ],
      [
        "...",
        2
      ],
      [
        "Our proprietary platform is optimized to suit experienced traders, with a variety of unique product features and tools that set us apart from the rest.",
        5.5
      ],
      "...",
      [
        "Let's get started, shall we?",
        2
      ],
      [
        "...",
        1
      ],
      [
        "Our opening offer to you is a <b>trading bonus of up to 50% on your 1st deposit.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Wait, that's not all… we also want to give you cash back, let's say <b>up to 100% Cashback from your 2nd deposit onwards",
        2
      ],
      {
        "blockId": 101,
        "type": "goto"
      }
    ],
    "name": "EXp welcome",
    "onLoad": [
      "Exp-welcome",
      "block_id=[blockId]"
    ],
    "id": 100
  },
  {
    "messages": [
      {
        "choices": [
          {
            "goto": 102,
            "postback": "I'm interested. Show me more",
            "text": "I'm interested. Show me more",
            "type": "button",
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "show me more",
    "onLoad": [
      "show-me-more",
      "block_id=[blockId]"
    ],
    "id": 101
  },
  {
    "messages": [
      [
        "...",
        1
      ],
      [
        "We also provide:",
        1
      ],
      [
        "...",
        1
      ],
      [
        "<b>Up to 400:1 leverage</b> and competitive spreads",
        1.5
      ],
      "...",
      [
        "<b>Dedicated account manager </b> that speaks your language.",
        2
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
        "Sound good?"
      ],
      "...",
      [
        "That's just the start, because with our deposit package, we also give you trading signals, a $5,000 demo account to practice on, educational materials for advanced training and much, much more.",
        6
      ],
      {
        "blockId": 103,
        "type": "goto"
      }
    ],
    "name": "EXp BENEFITS",
    "onLoad": [
      "Exp-benefits",
      "block_id=[blockId]"
    ],
    "id": 102
  },
  {
    "messages": [
      {
        "choices": [
          {
            "goto": 104,
            "postback": "Tell me a bit about the trading tools (5 mins)",
            "text": "Tell me a bit about the trading tools (5 mins)",
            "type": "button",
            "id": 1000
          },
          {
            "goto": 11,
            "postback": "Give me the full tour",
            "text": "Give me the full tour (10 mins)",
            "type": "button",
            "id": 1000
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "I'm ready to deposit and trade now",
            "text": "I'm ready to deposit and trade now",
            "type": "buton",
            "id": 1001
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "trading-tools",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "buttons-trading-tools",
      "block_id=[blockId]"
    ],
    "name": "ready to learn?",
    "id": 103
  },
  {
    "messages": [
      [
        "...",
        2
      ],
      [
        "Sure, the more familiar you are with our tools, the more likely you are to enjoy your trading experience with us :-)",
        2
      ],
      [
        "...",
        2
      ],
      [
        "The purpose of our tools is to maximize your investment potential with our easy-to-use platform, as well as helping you make better-informed decisions while getting the most out of your trading strategies.",
        7
      ],
      [
        "...",
        2
      ],
      [
        "Let's get straight to it…"
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
        "blockId": 110,
        "type": "goto"
      }
    ],
    "name": "good information",
    "onLoad": [
      "good-information",
      "block_id=[blockId]"
    ],
    "id": 104
  },
  {
    "messages": [
      {
        "goto": 111,
        "grace": 8,
        "gotoGrace": 114,
        "url": "//fast.wistia.net/embed/iframe/g89feye8bf?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals.png",
        "type": "video",
        "description": "What are Trade Signals",
        "title": "Lesson 1/3"
      }
    ],
    "name": "lesson 1/3",
    "onView": [
      "What-are-signals-view"
    ],
    "onLoad": [
      "What-are-signals",
      "block_id=[blockId]"
    ],
    "id": 110
  },
  {
    "messages": [
      "Did you find the \"What are signals\" video helpful?",
      {
        "choices": [
          {
            "goto": 113,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 112,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 1/3 feedback",
    "onClick": [
      "video-feedback-What-is-signals",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-What-is-signals",
      "block_id=[blockId]"
    ],
    "id": 111
  },
  {
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "blockId": 120,
        "type": "goto"
      }
    ],
    "name": "lesson 1/3 negaitive",
    "onLoad": [
      "lesson-1/3-negative",
      "block_id=[blockId]"
    ],
    "id": 112
  },
  {
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "blockId": 120,
        "type": "goto"
      }
    ],
    "name": "lesson 1/3 positive",
    "onLoad": [
      "lesson-1/3-positive",
      "block_id=[blockId]"
    ],
    "id": 113
  },
  {
    "id": 114,
    "name": "Lesson 1/3 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 120,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      {
        "goto": 121,
        "grace": 5,
        "gotoGrace": 124,
        "url": "//fast.wistia.net/embed/iframe/yassecsbp6?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Indicators.png",
        "type": "video",
        "description": "Market Indicators",
        "title": "Lesson 2/3"
      }
    ],
    "name": "Lesson 2/3",
    "onClick": [
      "video-feedback-What-is-signals",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-What-is-signals",
      "block_id=[blockId]"
    ],
    "id": 120
  },
  {
    "messages": [
      "Did you find the \"Market Indicators\" video helpful?",
      {
        "choices": [
          {
            "goto": 122,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 123,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 2/3 feedback",
    "onClick": [
      "video-feedback-Market-indicators",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-Market-indicators",
      "block_id=[blockId]"
    ],
    "id": 121
  },
  {
    "messages": [
      "...",
      "Great, let's continue to the next lesson",
      "...",
      {
        "blockId": 130,
        "type": "goto"
      }
    ],
    "name": "lesson 2/3 positive",
    "onLoad": [
      "lesson-2/3-positive",
      "block_id=[blockId]"
    ],
    "id": 122
  },
  {
    "messages": [
      "...",
      "I hope you find the next lesson more helpful",
      "...",
      {
        "blockId": 130,
        "type": "goto"
      }
    ],
    "name": "lesson 2/3 negaitive",
    "onLoad": [
      "lesson-2/3-negative",
      "block_id=[blockId]"
    ],
    "id": 123
  },
  {
    "id": 124,
    "name": "Lesson 2/3 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 130,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      {
        "goto": 131,
        "grace": 5,
        "gotoGrace": 134,
        "url": "//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/kor/index_TechnicalAnalysis_kor.html",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "thumbnailDimensions": [
          49,
          48
        ],
        "type": "lesson",
        "description": "Basic Technical Analysis",
        "title": "Lesson 3/3"
      }
    ],
    "name": "Lesson 3/3",
    "onView": [
      "basic-technical-analysis-view"
    ],
    "onLoad": [
      "basic-technical-analysis",
      "block_id=[blockId]"
    ],
    "id": 130
  },
  {
    "messages": [
      "Did you find the \"basic technical analysis\" lesson helpful?",
      {
        "choices": [
          {
            "goto": 132,
            "type": "positive",
            "id": 1000
          },
          {
            "goto": 133,
            "type": "negative",
            "id": 1001
          }
        ],
        "type": "feedback"
      }
    ],
    "name": "lesson 3/3 feedback",
    "onClick": [
      "video-feedback-basic-technical-analysis",
      "feedback_type=[TYPE]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "feedback-basic-technical-analysis",
      "block_id=[blockId]"
    ],
    "id": 131
  },
  {
    "messages": [
      "...",
      "Great, Thanks for your feedback",
      "...",
      {
        "blockId": 140,
        "type": "goto"
      }
    ],
    "name": "lesson 3/3 positive",
    "onLoad": [
      "lesson-3/3-positive",
      "block_id=[blockId]"
    ],
    "id": 132
  },
  {
    "messages": [
      "...",
      "Thanks for your feedback",
      "...",
      {
        "blockId": 140,
        "type": "goto"
      }
    ],
    "name": "lesson 3/3 negaitive",
    "onLoad": [
      "lesson-3/3-negative",
      "block_id=[blockId]"
    ],
    "id": 133
  },
  {
    "id": 134,
    "name": "Lesson 3/3 timeout",
    "messages": [
      {
        "choices": [
          {
            "goto": 140,
            "postback": "Continue",
            "text": "Continue",
            "type": "button",
            "id": 1
          }
        ],
        "type": "choices"
      }
    ]
  },
  {
    "messages": [
      "...",
      [
        "Like what you see? <br> Get our deposit package  now and enjoy using the full range of dynamic tools and features available in our platform to capitalize on the markets.",
        3.5
      ],
      "...",
      {
        "blockId": 141,
        "type": "goto"
      }
    ],
    "name": "Like what you see?",
    "onLoad": [
      "Like-what-you-see",
      "block_id=[blockId]"
    ],
    "id": 140
  },
  {
    "messages": [
      "...",
      [
        "Always remember, if you change your mind, you can withdraw your deposit anytime, no questions asked, no charges, 100% risk-free.",
        3
      ],
      "...",
      {
        "blockId": 142,
        "type": "goto"
      }
    ],
    "name": "if you change your mind",
    "onLoad": [
      "if-you-change-your-mind",
      "block_id=[blockId]"
    ],
    "id": 141
  },
  {
    "blockid": 142,
    "messages": [
      {
        "choices": [
          {
            "postback": "Deposit and collect package",
            "text": "Deposit and collect package",
            "type": "button",
            "onClick": [
              "deposit",
              null,
              true
            ],
            "id": 1000
          },
          {
            "goto": 143,
            "onClick": [
              "walkthrough",
              "introduction",
              true
            ],
            "postback": "Not 100% ready? Take a platform walkthrough tour",
            "text": "Not 100% ready? Take a platform walkthrough tour",
            "type": "buton",
            "id": 1001
          }
        ],
        "type": "choices"
      }
    ],
    "name": "Deposit",
    "onClick": [
      "end-exp-flow-button",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "end-exp-flow-button",
      "block_id=[blockId]"
    ],
    "id": 142
  },
  {
    "blockid": 143,
    "messages": [
      {
        "choices": [
          {
            "postback": "Deposit and collect package",
            "text": "Deposit and collect package",
            "type": "button",
            "onClick": [
              "deposit",
              null,
              true
            ],
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "after walkthrough",
    "onClick": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "after-walkthrough",
      "block_id=[blockId]"
    ],
    "id": 143
  }
]
