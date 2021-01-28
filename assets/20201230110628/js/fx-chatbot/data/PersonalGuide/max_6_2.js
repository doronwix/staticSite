[
  {
    "messages": [
      {
        "for": 1,
        "url": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Welcome.png",
        "type": "image"
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
        "هل لديك الخبرة في التداول على العقود مقابل الفروقات؟ (أريد فقط أن أتأكد من إعطائك المواد المناسبة مثل المواد التعليمية ، التدريب 1 على 1 ، البونوص  الترحيبي ، إلخ.)",
        1
      ],
      [
        "...",
        1
      ],
      {
        "choices": [
          {
            "goto": 2,
            "postback": "ليس لدي خبرة في التداول.",
            "text": "ليس لدي خبرة في التداول.",
            "type": "button",
            "id": 1
          },
          {
            "goto": 100,
            "postback": "لدي خبرة في التداول.",
            "text": "لدي خبرة في التداول.",
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
        4
      ],
      [
        "حسنا , أول شيء يجب عليك معرفته هو : عليك أن تفهم ما تفعله. أفضل طريقة لتصبح متداولًا ناجحًا هي اتخاذ قرارات ذكية بشأن السوق. بهذه الطريقة ، يمكنك الاستمتاع والاستفادة من فرص السوق بشروطك الخاصة.",
        12
      ],
      [
        "...",
        2
      ],
      "قبل أن تبدأ  في التداول ،  فانت تحتاج إلى بعض الأشياء ...",
      [
        "...",
        2
      ],
      {
        "blockId": 3,
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
            "postback": "انا مهتم. أرني المزيد  ",
            "text": "انا مهتم. أرني المزيد  ",
            "type": "button",
            "id": 1000
          }
        ],
        "type": "choices"
      }
    ],
    "name": "Tell me more",
    "onClick": [
      "tell me more",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "tell-me-more",
      "text=[TEXT]",
      "block_id=[blockId]"
    ],
    "id": 3
  },
  {
    "messages": [
      [
        "الدخول إلى<b>  مواد iFOREX التعليمية </b>  لتشكيل وبناء  معرفتك وخبرتك .",
        3
      ],
      [
        "...",
        2
      ],
      [
        "<b>تدريب مجاني  1 على 1  </b> مع لمسة شخصية  , وطرح  الأسئلة  ",
        3
      ],
      [
        "...",
        3
      ],
      "<b>حساب تجريبي خالي من المخاطر </b>   بإمكانك البدء والتدرب عليه .",
      [
        "...",
        3
      ],
      [
        "خُذ في عين الاعتبار   أنك ستحصل أيضًا على <b>بونوص تداول إضافي بنسبة 50 ٪ على الإيداع الاول </b> لاستخدامه في أي تداول حقيقي قد تقوم به .",
        5
      ],
      [
        "...",
        4
      ],
      "سوف تحصل على كل هذا مع حزمة الإيداع الخاصة بك. <br>ولكن يجب عليك الانتظار قليلاا، لا يزال لديك بعض الأشياء الأخرى لتتعلمها من أجل التداول بثقة.",
      [
        "...",
        3
      ],
      {
        "choices": [
          {
            "goto": 11,
            "postback": "أنا على استعداد لمعرفة المزيد",
            "text": "أنا على استعداد لمعرفة المزيد",
            "type": "button",
            "id": 1
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "أنا مستعد للإيداع والتداول الآن",
            "text": "أنا مستعد للإيداع والتداول الآن",
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
        "رائع ، هيا بنا  نبدأ ...",
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
        "url": "//fast.wistia.com/embed/medias/20y2z6x983?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/CFD.png",
        "type": "video",
        "description": "ماذا يعني  تداول العقود مقابل الفروقات؟",
        "title": "الدرس 1/3"
      }
    ],
    "name": "lesson 1/3",
    "onView": [
      "what-is-CFD-trading-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "what-is-CFD-trading",
      "block_id=[blockId]"
    ],
    "id": 12
  },
  {
    "messages": [
      "هل كان فيديو \"ما هو تداول العقود مقابل الفروقات\" مفيدًا  لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
            "postback": "استمر",
            "text": "استمر",
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
        "url": "//fast.wistia.com/embed/medias/zsc8uagfqg?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/Leverage.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "ما هو التداول بواسطة الرافعة المالية",
        "title": "الدرس 2/3"
      }
    ],
    "name": "lesson 2/3",
    "onView": [
      "What-is-leverage-trading-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "What-is-leverage-trading",
      "block_id=[blockId]"
    ],
    "id": 20
  },
  {
    "messages": [
      "هل كان الفيديو \"ما هو التداول بواسطة الرافعة المالية\" مفيدًا  لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
            "postback": "استمر",
            "text": "استمر",
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
        "url": "//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/arb/index_SimpleTradingExample_arb.html",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "thumbnailDimensions": [
          49,
          48
        ],
        "type": "lesson",
        "subtitle": "مثال سريع",
        "description": "على التداول",
        "title": "الدرس 3/3"
      }
    ],
    "name": "lesson 3/3",
    "onView": [
      "Trading-example-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "Trading-example",
      "block_id=[blockId]"
    ],
    "id": 27
  },
  {
    "messages": [
      "هل كان  الدرس \"مثال على التداول\"  مفيدًا لك ؟",
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
      "شكرا  لك على ملاحظاتك ",
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
      "رائع ، شكرا  لك على ملاحظاتك  ",
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
            "postback": "استمر",
            "text": "استمر",
            "type": "button",
            "id": 1
          }
        ]
      }
    ]
  },
  {
    "messages": [
      "دعنا نتأكد من مواكبتك للدروس والمواد . إليك بعض الأسئلة .",
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
            "text": "طريقة بواسطتها يمكنك الاستفادة من تحركات الأسعار للأداة المالية الحقيقية دون امتلاكها  فعليًا",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "شراء أداة مالية حقيقية من سوق الأسهم",
            "type": "button",
            "id": 2
          }
        ],
        "text": "ماذا يعني  تداول العقود مقابل الفروقات؟",
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
            "text": "<b>1/2</b> ليس سيئأ  نسبيا لبداية الأمر ",
            "type": "text"
          },
          "correct": {
            "goto": 37,
            "text": "<b>2/2</b> أحسنت ، لقد كنت تواكب ومنتبه .",
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
        "text": "أية رافعة مالية قد تؤدي إلى أكبر ربح محتمل ؟ ",
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
            "text": "<b>0/2</b> حسنا ...هيا بنا نتقدم ",
            "type": "text"
          },
          "correct": {
            "goto": 37,
            "text": "<b>1/2</b> ليس سيئأ  نسبيا لبداية الأمر  ",
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
        "text": "أية رافعة مالية قد تؤدي إلى أكبر ربح محتمل ؟ ",
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
            "postback": "استمر",
            "text": "استمر",
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
        "لقد ناقشنا بعض أساسيات التداول معًا ونحن على استعداد تقريبًا لاستكشاف السوق والبحث  عن الفرص. هل تشعر بأنك متحمس  ؟ يجب ان تكون كذلك  ! ولكن أولاً ، يجب أن ننظر إلى بعض الأدوات التي يمكن أن تساعدك في اتخاذ قرارات التداول ...",
        3
      ],
      [
        "...",
        2
      ],
      {
        "choices": [
          {
            "goto": 39,
            "postback": "أنا مهتم ،<br/> أرني الأدوات",
            "text": "أنا مهتم ،<br/> أرني الأدوات",
            "type": "button",
            "id": 1000
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "أنا مستعد للإيداع<br /> والتداول الآن",
            "text": "أنا مستعد للإيداع<br /> والتداول الآن",
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
        "حسنا  ، بمجرد أن تعرف المزيد عن أدوات التداول الخاصة بنا وكيفية استخدامها ، ستكون مستعدًا بشكل أفضل للاستفادة من الفرص المالية في السوق .",
        1
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
        "url": "//fast.wistia.com/embed/medias/9gqa9plyu9?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/TradingSignals.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "ما هي توصيات التداول",
        "title": "الدرس 1/3"
      }
    ],
    "name": "lesson 4/6",
    "onView": [
      "What-is-signals-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "What-is-signals",
      "block_id=[blockId]"
    ],
    "id": 40
  },
  {
    "messages": [
      "هل كان  الفيديو \" ما هي توصيات التداول \"  مفيدًا لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، هيا بنا ننتقل إلى الدرس التالي",
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
            "postback": "استمر",
            "text": "استمر",
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
        "url": "//fast.wistia.com/embed/medias/wl0thcyat3?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Sentiment.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "ما هي أداة  ميول السوق",
        "title": "الدرس 2/3"
      }
    ],
    "name": "lesson 5/6",
    "onView": [
      "What-is-market-sentiment-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "What-is-market-sentiment",
      "block_id=[blockId]"
    ],
    "id": 50
  },
  {
    "messages": [
      "هل كان  فيديو \" ميول السوق\" مفيدًا لك ؟",
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
      "رائع ، هيا بنا ننتقل إلى الدرس التالي",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
            "postback": "استمر",
            "text": "استمر",
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
        "url": "//fast.wistia.com/embed/medias/bj3vr76qmm?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/factors.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "subtitle": "",
        "description": "ما هي عوامل التداول ",
        "title": "الدرس 3/3"
      }
    ],
    "name": "lesson 6/6",
    "onView": [
      "What-are-trading-factors-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "What-are-trading-factors",
      "block_id=[blockId]"
    ],
    "id": 60
  },
  {
    "messages": [
      "هل كان  فيديو  \"عوامل التداول\"  مفيدًا لك ؟",
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
      "آمل أن تجد الدرس التالي مفيد اكثر ",
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
      "رائع ، هيا بنا ننتقل إلى الدرس التالي",
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
            "postback": "استمر",
            "text": "استمر",
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
      "دعنا نتأكد من مواكبتك للدروس والمواد . إليك بعض الأسئلة .",
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
            "text": "السلع الزراعية مثل البن والسكر والكاكاو",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "سلع ”الملاذ الآمن” مثل الذهب",
            "type": "button",
            "id": 2
          }
        ],
        "text": "يمن الممكن أن تؤثر الظواهر الجوية المتطرفة (مثل الإعصار والجفاف) على سعر ...؟",
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
            "text": "<b>1/2 </b>ليس سيئًا ... مع التمرّس والتدريب سوف يتحسن أدائك ",
            "type": "text"
          },
          "correct": {
            "goto": 88,
            "text": "<b>2/2</b>  أحسنت ، الكثير من الفرص الاستثمارية في انتظارك  ",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "أداة توضح ما إذا كان غالبية المتداولين يتوقعون ارتفاع أو انخفاض زوج عملات معين  ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "هي عبارة عن أداة توضح كيف يتوقع المحللون أداء زوج عملات معين ",
            "type": "button",
            "id": 2
          }
        ],
        "text": "ما  هي أداة  ميول السوق ؟ ",
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
            "text": "<b>0/2</b> أن  تتعلم أشياء جديدة قد يكون أمر صعب ، لكن لا تقلق ،  سوياً سوف نتغلب الى الصعوبات ",
            "type": "text"
          },
          "correct": {
            "goto": 88,
            "text": "<b>1/2</b> ليس سيئًا ... مع التمرّس والتدريب سوف يتحسن أدائك ",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "أداة توضح ما إذا كان غالبية المتداولين يتوقعون ارتفاع أو انخفاض زوج عملات معين  ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "هي عبارة عن أداة توضح كيف يتوقع المحللون أداء زوج عملات معين  ",
            "type": "button",
            "id": 2
          }
        ],
        "text": "ما هي أداة ميول السوق ؟",
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
            "postback": "استمر",
            "text": "استمر",
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
        3
      ],
      [
        "حسنا  ، لقد وضعنا حجر الأساس  . لديك الآن الأساسيات التي يمكنك الاعتماد عليها ، لذلك بمجرد حصولك على حزمة الإيداع الخاصة بك ، والتي تتضمن <br> <b> مواد تعليمية مجانية ،<br>  وتدريبًا شخصيا 1  على 1 ، وحساب تجريبي خالي من المخاطر ، بالإضافة إلى   بونوص للتداول بنسبة 50٪ </b> على الإيداع الخاص بك.",
        4
      ],
      [
        "...",
        3
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
        " تذكر أنه يمكنك دائمًا سحب الإيداع الخاص بك ، دون أي رسوم ، أي أسئلة ،تدريب  خالي من المخاطر بنسبة 100٪. لا تفوت هذه الفرصة النادرة للاستفادة من استثمارك. ",
        3
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
            "postback": " قم بإلايداع واحصل على رزمتك الان",
            "text": " قم بإلايداع واحصل على رزمتك الان",
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
            "postback": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
            "text": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
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
            "postback": " قم بإلايداع واحصل على رزمتك الان",
            "text": " قم بإلايداع واحصل على رزمتك الان",
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
        "تهانينا ، يمكنك الآن الحصول على  حزمة الإيداع الكاملة بما في ذلك المواد التعليمية والحساب التجريبي الخالي من المخاطر. لمزيد من التفاصيل ، لا تتردد في الاتصال بنا. ",
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
        "يجب أن تشعر بالثقة مع وسيطك الذي تعمل معه ، لذلك هيا  نبدأ ببيانات اعتمادنا: نحن وسيط مرخص له أكثر من 22 عامًا من الخبرة في السوق.",
        3
      ],
      [
        "...",
        2
      ],
      [
        " نحن في جميع أنحاء العالم ، نعمل في أسواق دولية متعددة ، نتحدث أكثر من 20 لغة لعشرات الآلاف من المتداولين الذين يختارون الاستثمار معنا. ",
        3
      ],
      "...",
      [
        "بكل بساطة ، لدينا سمعة حسنة في الأسواق  لكوننا من بين الرواد في عالم التداول المالي عبر الإنترنت.",
        2
      ],
      [
        "..."
      ],
      [
        "الآن ، لنتحدث عن الاعمال . هذا ما نقدمه:"
      ],
      "...",
      [
        "<b> بونوص تداول يصل إلى 50٪ </b> على إيداعك الأول."
      ],
      "...",
      [
        "<b> كاش باك ( استرداد نقدي  ) حتى 100٪ </b> من إيداعك الثاني وما فوق .",
        1
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
            "postback": "انا مهتم . أرني المزيد",
            "text": "انا مهتم . أرني المزيد",
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
        "<b> رافعة مالية تصل إلى 400: 1   </b>  وفروق أسعار تنافسية ( سبريد ) .",
        1
      ],
      [
        "...",
        1
      ],
      [
        "<b>مدير حساب مختص </b> يتحدث لغتك.",
        2
      ],
      "...",
      [
        "احصل على 3%  <b>   فائدة  <b/>  على رصيدك الصافي .",
        1.5
      ],
      "...",
      [
        "نظام  سريع لسحب ألاموال "
      ],
      "...",
      [
        "هذه ليست سوى البداية ، لأنه مع حزمة الإيداع الخاصة بنا ، نقدم لك أيضًا <b> إشارات تداول ، حساب تجريبي بقيمة 5000 دولار للتدرب عليه ، ومواد تعليمية للتدريب المتقدم</b> وأكثر من ذلك بكثير.",
        4
      ],
      "...",
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
            "postback": "أخبرني قليلاً عن أدوات التداول (5 دقائق)",
            "text": "أخبرني قليلاً عن أدوات التداول (5 دقائق)",
            "type": "button",
            "id": 1000
          },
          {
            "goto": 11,
            "postback": "أرني الجولة التعليمية  الكاملة",
            "text": "أرني الجولة التعليمية  الكاملة (10 دقائق)",
            "type": "button",
            "id": 1000
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "أنا مستعد للإيداع والتداول الآن",
            "text": "أنا مستعد للإيداع والتداول الآن",
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
        "url": "//fast.wistia.com/embed/medias/9gqa9plyu9?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/TradingSignals.png",
        "type": "video",
        "description": "ما هي توصيات التداول",
        "title": "الدرس 1/3"
      }
    ],
    "name": "lesson 1/3",
    "onView": [
      "What-are-signals-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "What-are-signals",
      "block_id=[blockId]"
    ],
    "id": 110
  },
  {
    "messages": [
      "هل كان  الفيديو \" ما هي توصيات التداول \"  مفيدًا لك ؟",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
            "postback": "استمر",
            "text": "استمر",
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
        "url": "//fast.wistia.com/embed/medias/mbnkzg2lhm?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Arabic/Indicators.png",
        "type": "video",
        "description": "مؤشرات السوق",
        "title": "الدرس 2/3"
      }
    ],
    "name": "Lesson 2/3",
    "onView": [
      "market-indicators-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "market-indicators",
      "block_id=[blockId]"
    ],
    "id": 120
  },
  {
    "messages": [
      "هل كان الفيديو  \" مؤشرات السوق \"  مفيدًا لك ؟",
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
      "رائع ، دعنا ننتقل إلى الدرس التالي .",
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
      "آمل أن يكون الدرس القادم أكثر فائدة",
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
            "postback": "استمر",
            "text": "استمر",
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
        "url": "//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/arb/index_TechnicalAnalysis_arb.html",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "thumbnailDimensions": [
          49,
          48
        ],
        "type": "lesson",
        "description": "التحليل الفني الأساسي",
        "title": "الدرس 3/3"
      }
    ],
    "name": "Lesson 3/3",
    "onView": [
      "basic-technical-analysis-view",
      "block_id=[blockId]"
    ],
    "onLoad": [
      "basic-technical-analysis",
      "block_id=[blockId]"
    ],
    "id": 130
  },
  {
    "messages": [
      "هل كان درس \"التحليل الفني الأساسي\" مفيدًا لك ؟",
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
      "رائع ، شكرا  لك على ملاحظاتك  ",
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
      "شكرًا على ملاحظاتك .",
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
            "postback": "استمر",
            "text": "استمر",
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
      "هل أعجبك ما شاهدته ؟ <br> احصل على حزمة الإيداع الآن واستمتع  بمجموعة كاملة من الأدوات الديناميكية والميزات المتاحة على منصتنا للاستفادة من الأسواق.",
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
      "تذكر دائمًا ، إذا غيرت رأيك ، يمكنك سحب إيداعك في أي وقت ، دون طرح أي أسئلة عليك ، بدون رسوم ، 100٪ بدون مخاطر.",
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
            "postback": "الإيداع والحصول على  الحزمة",
            "text": "الإيداع والحصول على  الحزمة",
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
            "postback": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
            "text": "لست جاهزا  100٪؟ إبدأ جولة تعليمية  في المنصة",
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
            "postback": "الإيداع والحصول على  الحزمة",
            "text": "الإيداع والحصول على  الحزمة",
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
