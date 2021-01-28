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
      "مرحبًا ، أنا ماكس.",
      "...",
      [
        "لقد رأيت بانه توجد لديك رغبة  في الاستفادة من السوق والتداول. أنا هنا لمساعدتك على تحقيق أقصى إستفادة من تجربتك واستثماراتك.",
        5
      ],
      "...",
      [
        "سؤال واحد قبل ان نبدأ .....",
        1
      ],
      [
        "...",
        3
      ],
      [
        "هل لديك الخبرة في التداول على العقود مقابل الفروقات؟",
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
            "text": "ليس لدي خبرة في التداول.",
            "postback": "ليس لدي خبرة في التداول.",
            "goto": 2
          },
          {
            "id": 2,
            "type": "button",
            "text": "لدي خبرة في التداول.",
            "postback": "لدي خبرة في التداول.",
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
        "صحيح, أول شيء عليك معرفته هو أن تفهم ما تفعله. ولهذا السبب، نقدم عرضًا حصرياً خاصًا لعملائنا الجدد<b> أول صفقة بدون مخاطر أو خسارة ، بحيث يكون الربح من الصفقة ملكاً لك, والخسائر تكون علينا (حتى 50 دولارًا خسارة )</b> لذا يمكنك البدء في التداول بدون مخاطر او خسارة من جانبك , وبالتالي بهذه الطريقة يمكنك الاستمتاع بتداولات مربحة محتملة بشروطك الخاصة.",
        15
      ],
      [
        "...",
        2
      ],
      "بالإضافة إلى ذلك ، نقدم لك بعض العروض الأخرى ، وهي ...",
      [
        "...",
        2
      ],
      "<b> حساب تجريبي </ b> يمكنك البدء في التدرب عليه.",
      [
        "...",
        2
      ],
      "<b>الدخول إلى مواد iFOREX التعليمية </b>  لتشكيل وبناء  معرفتك وخبرتك .",
      [
        "...",
        2
      ],
      "سوف نقوم بمناقشة كافة التفاصيل في وقت لاحق ، لا يزال لدينا بعض المواضيع الأخرى التي يجب المرور عنها حتى تتمكن من التداول بثقة.",
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
            "text": "انا مهتم. أرني المزيد",
            "postback": "انا مهتم. أرني المزيد",
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
            "text": "أنا على استعداد لمعرفة المزيد",
            "postback": "أنا على استعداد لمعرفة المزيد",
            "goto": 11
          },
          {
            "id": 2,
            "type": "button",
            "text": "أنا مستعد للإيداع والتداول الآن",
            "postback": "أنا مستعد للإيداع والتداول الآن",
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
        "رائع ، هيا بنا  نبدأ ...",
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
        "title": "الدرس 1/3",
        "description": "ماذا يعني  تداول العقود مقابل الفروقات؟",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/CFD.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "url": "//fast.wistia.com/embed/medias/20y2z6x983?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "هل كان فيديو \"ما هو تداول العقود مقابل الفروقات\" مفيدًا  لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
            "text": "استمر",
            "postback": "استمر",
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
        "title": "الدرس 2/3",
        "description": "ما هو التداول بواسطة الرافعة المالية",
        "type": "video",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/Leverage.png",
        "url": "//fast.wistia.com/embed/medias/zsc8uagfqg?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "هل كان الفيديو \"ما هو التداول بواسطة الرافعة المالية\" مفيدًا  لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
            "text": "استمر",
            "postback": "استمر",
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
        "title": "الدرس 3/3",
        "description": "على التداول",
        "subtitle": "مثال سريع",
        "type": "lesson",
        "thumbnailDimensions": [
          49,
          48
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "url": "//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/arb/index_SimpleTradingExample_arb.html",
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
      "هل كان  الدرس \"مثال على التداول\"  مفيدًا لك ؟",
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
      "شكرا  لك على ملاحظاتك ",
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
      "رائع ، شكرا  لك على ملاحظاتك ",
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
            "text": "استمر",
            "postback": "استمر",
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
      "دعنا نتأكد من مواكبتك للدروس والمواد . إليك بعض الأسئلة .",
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
        "text": "ماذا يعني  تداول العقود مقابل الفروقات؟",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "طريقة بواسطتها يمكنك الاستفادة من تحركات الأسعار للأداة المالية الحقيقية دون امتلاكها  فعليًا",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "شراء أداة مالية حقيقية من سوق الأسهم",
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
        "text": "أية رافعة مالية قد تؤدي إلى أكبر ربح محتمل ؟ ",
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
            "text": "<b>2/2</b> أحسنت ، لقد كنت تواكب ومنتبه .",
            "goto": 37
          },
          "wrong": {
            "type": "text",
            "text": "<b>1/2</b> ليس سيئأ  نسبيا لبداية الأمر ",
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
        "text": "أية رافعة مالية قد تؤدي إلى أكبر ربح محتمل ؟ ",
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
            "text": "<b>1/2</b> ليس سيئأ  نسبيا لبداية الأمر ",
            "goto": 37
          },
          "wrong": {
            "type": "text",
            "text": "<b>0/2</b> حسنا ...هيا بنا نتقدم ",
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
            "text": "استمر",
            "postback": "استمر",
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
        "لقد ناقشنا بعض أساسيات التداول معًا ونحن على استعداد تقريبًا لاستكشاف السوق والبحث  عن الفرص. هل تشعر بأنك متحمس  ؟ يجب ان تكون كذلك  ! ولكن أولاً ، يجب أن ننظر إلى بعض الأدوات التي يمكن أن تساعدك في اتخاذ قرارات التداول ...",
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
            "text": "أنا مهتم ،<br/> أرني الأدوات",
            "postback": "أنا مهتم ،<br/> أرني الأدوات",
            "goto": 39
          },
          {
            "id": 1000,
            "type": "button",
            "text": "أنا مستعد للإيداع<br /> والتداول الآن",
            "postback": "أنا مستعد للإيداع<br /> والتداول الآن",
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
        "جيد ، كلما حصلت على مزيد من المعلومات ، أصبحت أكثر استعدادًا للاستفادة من الفرص المالية.",
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
        "title": "الدرس 1/3",
        "description": "ما هي توصيات التداول",
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
      "هل كان  الفيديو \" ما هي توصيات التداول \"  مفيدًا لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، هيا بنا ننتقل إلى الدرس التالي",
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
            "text": "استمر",
            "postback": "استمر",
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
        "title": "الدرس 2/3",
        "description": "ما هي أداة  ميول السوق",
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
      "هل كان  فيديو \" ميول السوق\" مفيدًا لك ؟",
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
      "رائع ، هيا بنا ننتقل إلى الدرس التالي",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
            "text": "استمر",
            "postback": "استمر",
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
        "title": "الدرس 3/3",
        "description": "ما هي عوامل التداول ",
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
      "هل كان  فيديو  \"عوامل التداول\"  مفيدًا لك ؟",
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
      "شكرا  لك على ملاحظاتك ",
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
      "رائع ، هيا بنا ننتقل إلى الدرس التالي",
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
            "text": "استمر",
            "postback": "استمر",
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
      "دعنا نتأكد من مواكبتك للدروس والمواد . إليك بعض الأسئلة .",
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
        "text": "يمن الممكن أن تؤثر الظواهر الجوية المتطرفة (مثل الإعصار والجفاف) على سعر ...؟",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "السلع الزراعية مثل البن والسكر والكاكاو",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "سلع ”الملاذ الآمن” مثل الذهب",
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
        "text": "ما  هي أداة  ميول السوق ؟ ",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "أداة توضح ما إذا كان غالبية المتداولين يتوقعون ارتفاع أو انخفاض زوج عملات معين",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "هي عبارة عن أداة توضح كيف يتوقع المحللون أداء زوج عملات معين ",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>2/2</b>  أحسنت ، الكثير من الفرص الاستثمارية في انتظارك",
            "goto": 88
          },
          "wrong": {
            "type": "text",
            "text": "<b>1/2 </b>ليس سيئًا ... مع التمرّس والتدريب سوف يتحسن أدائك ",
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
        "text": "ما  هي أداة  ميول السوق ؟ ",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "أداة توضح ما إذا كان غالبية المتداولين يتوقعون ارتفاع أو انخفاض زوج عملات معين",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "هي عبارة عن أداة توضح كيف يتوقع المحللون أداء زوج عملات معين ",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>1/2 </b>ليس سيئًا ... مع التمرّس والتدريب سوف يتحسن أدائك ",
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
            "text": "استمر",
            "postback": "استمر",
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
        "اذا ، فقد وضعنا الأساس للانطلاق . لديك الآن أساسيات الأمور  للبناء عليها .",
        2
      ],
      [
        "...",
        2
      ],
      [
        "لا تتردد في استخدام <b> المواد التعليمية </ b> والتمرن باستخدام <b> حسابك التجريبي </ b>.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "لا تنسى بأن صفقتك الأولى بدون مخاطر  أو خسارة ، <b> بحيث تكون أرباح الصفقة ملكا لك  والخسائر  (طبعا  إن وجدت ) ,علينا   (حتى 50 دولارًا) ، لذا يمكنك البدء في التداول بدون مخاطر  او مخاوف </ b>.",
        1
      ],
      [
        "...",
        2
      ],
      [
        "اغتنم هذه الفرصة النادرة للاستفادة من استثمارك.",
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
        " تذكر أنه يمكنك دائمًا سحب الإيداع الخاص بك ، دون أي رسوم ، أي أسئلة ،تدريب  خالي من المخاطر بنسبة 100٪. لا تفوت هذه الفرصة النادرة للاستفادة من استثمارك.",
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
            "text": "قم بالايداع وافتح الصفقة الأولى بلا مخاطرة ",
            "postback": "قم بالايداع وافتح الصفقة الأولى بلا مخاطرة"
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
            "postback": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
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
            "text": "قم بالايداع وافتح الصفقة الأولى بلا مخاطرة",
            "postback": "قم بالايداع وافتح الصفقة الأولى بلا مخاطرة"
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
        "تهانينا ، يمكنك الآن الحصول على  حزمة الإيداع الكاملة بما في ذلك المواد التعليمية والحساب التجريبي الخالي من المخاطر. لمزيد من التفاصيل ، لا تتردد في الاتصال بنا. ",
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
        "يتوجب عليك  أن تشعر بالثقة عند التعامل مع وسيطك ، ولهذا فنحن نقدم عرضاً  حصرياً خاصًا لعملائنا الجدد. <b> فبموجب هذا العرض فان الصفقة الأولى ستكون بدون مخاطرة من جانبك ،  بحيث تكون أرباح الصفقة ملكاً لك, وبالتالي تكون الخسائر علينا (حتى 50 دولارًا  خسارة) بحيث  تتمكن من بدء التداول بدون مخاطر</ b>",
        4
      ],
      [
        "...",
        2
      ],
      [
        "<b> نحن وسيط مرخص عالميًا  ونتمتع بخبرة تزيد عن 22 عامًا </ b>، نعمل في أسواق عالمية متعددة ، بحيث نقدم الخدمة بأكثر من 20 لغة لعشرات الآلاف من المتداولين الذين يختارون الاستثمار معنا.",
        3
      ],
      "...",
      [
        "بكل بساطة ،<b> لدينا سمعة لكوننا من بين الرواد في عالم التداول المالي عبر الإنترنت</b>.",
        2
      ],
      [
        "..."
      ],
      [
        "بالإضافة الى عرض \" الصفقة الأولى\" , نقدم أيضا هذه العروض : "
      ],
      "...",
      [
        "<b> كاش باك ( استرداد نقدي  ) حتى 100٪ </b> من إيداعك الثاني وما فوق .",
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
            "text": "انا مهتم . أرني المزيد",
            "postback": "انا مهتم . أرني المزيد",
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
        "<b> رافعة مالية تصل إلى 400: 1   </b>  وفروق أسعار تنافسية ( سبريد ) .",
        1
      ],
      "...",
      [
        "احصل على 3%  <b>   فائدة  <b/>  على رصيدك الصافي .",
        1.5
      ],
      "...",
      [
        "نظام  سريع لسحب ألاموال"
      ],
      "...",
      [
        "أنها مجرد البداية فقط ! هل ذكرت لك أننا نقدم لك أيضًا <b> إشارات تداول ، وحساب تجريبي بقيمة 5000 دولارًا </ b> للتمرن عليه ، و <b> مواد تعليمية </ b> للتدريب المتقدم والمزيد ..",
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
            "text": "أخبرني قليلاً عن أدوات التداول (5 دقائق)",
            "postback": "أخبرني قليلاً عن أدوات التداول (5 دقائق)",
            "goto": 104
          },
          {
            "id": 1000,
            "type": "button",
            "text": "أرني الجولة التعليمية  الكاملة (10 دقائق)",
            "postback": "أرني الجولة التعليمية  الكاملة",
            "goto": 11
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "أنا مستعد للإيداع والتداول الآن",
            "postback": "أنا مستعد للإيداع والتداول الآن",
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
        "جيد ، كلما حصلت على مزيد من المعلومات ، أصبحت أكثر استعدادًا للاستفادة من الفرص المالية.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "لقد بنينا منصتنا للمتداولين وجعلنا تجربتنا ترشدنا نحو توفير الأدوات والميزات التي يريدونها. ما غرضنا من ذلك  ؟ زيادة إمكاناتك الاستثمارية إلى أقصى حد من خلال منصتنا والتي تعتبر سهلة الاستخدام ، بالإضافة إلى مساعدتك على اتخاذ قرارات ذكية وتحقيق أقصى منفعة من استراتيجية التداول الخاصة بك.",
        7
      ],
      [
        "...",
        2
      ],
      [
        "دعنا ننتقل إليها مباشرة ..."
      ],
      [
        "...",
        1
      ],
      [
        "تتضمن منصتنا أدوات مثل:"
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
        "title": "الدرس 1/3",
        "description": "ما هي توصيات التداول",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/TradingSignals.png",
        "url": "//fast.wistia.com/embed/medias/9gqa9plyu9?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "هل كان  الفيديو \" ما هي توصيات التداول \"  مفيدًا لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
            "text": "استمر",
            "postback": "استمر",
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
        "title": "الدرس 2/3",
        "description": "مؤشرات السوق",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/Indicators.png",
        "url": "//fast.wistia.com/embed/medias/mbnkzg2lhm?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "هل كان الفيديو  \" مؤشرات السوق \"  مفيدًا لك ؟",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
            "text": "استمر",
            "postback": "استمر",
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
        "title": "الدرس 3/3",
        "description": "التحليل الفني الأساسي",
        "type": "lesson",
        "thumbnailDimensions": [
          49,
          48
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "url": "//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/arb/index_TechnicalAnalysis_arb.html",
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
      "هل كان درس \"التحليل الفني الأساسي\" مفيدًا لك ؟",
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
      "رائع ، شكرا  لك على ملاحظاتك  ",
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
      "شكرا  لك على ملاحظاتك",
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
            "text": "استمر",
            "postback": "استمر",
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
      "هل أحببت ما شاهدته؟ <b> ابدأ الآن مع أول صفقة خالية من المخاطر والخسارة  </ b> وقم بالحصول على مجموعة كاملة من الأدوات والميزات الديناميكية المتاحة على منصتنا.",
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
      "تذكر دائمًا ، إذا غيرت رأيك ، يمكنك سحب إيداعك في أي وقت ، دون طرح أي أسئلة عليك ، بدون رسوم ، 100٪ بدون مخاطر.",
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
            "text": "قم بالايداع وافتح الصفقة الأولى بلا مخاطرة ",
            "postback": "قم بالايداع وافتح الصفقة الأولى بلا مخاطرة"
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
            "postback": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
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
            "text": "الإيداع والحصول على  الحزمة",
            "postback": "الإيداع والحصول على  الحزمة"
          }
        ]
      }
    ],
    "blockid": 143
  }
]
