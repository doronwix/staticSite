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
      "Hola, soy Max.",
      "...",
      [
        "Tú tienes interés en aprovechar el mercado y el trading. Estoy aquí para ayudarte a aprovechar al máximo tu experiencia y tus inversiones.",
        5
      ],
      "...",
      [
        "Una pregunta…",
        1
      ],
      [
        "...",
        3
      ],
      [
        "¿Tienes experiencia en el trading de productos CFD? ",
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
            "text": "No tengo experiencia de trading",
            "postback": "No tengo experiencia de trading",
            "goto": 2
          },
          {
            "id": 2,
            "type": "button",
            "text": "Tengo experiencia de trading",
            "postback": "Tengo experiencia de trading",
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
        "Bien, lo primero que necesita saber: debe entender lo que está haciendo. Y, para eso, le brindamos una promoción especial a nuestros nuevos clientes: <b>primera operación sin riesgo, cuando las ganancias de la transacción son suyas y las pérdidas (si las hubiera) recaen sobre nosotros (hasta 50 dólares)</b> para que pueda comenzar a operar sin riesgos. De esa manera, disfrutará abriendo transacciones potencialmente rentables en sus propios términos.",
        15
      ],
      [
        "...",
        2
      ],
      "Además de eso, le daremos algunas cosas más, a saber...",
      [
        "...",
        2
      ],
      "<b>Cuenta demo </b>en la que puede empezar a practicar.",
      [
        "...",
        2
      ],
      "<b>Acceda a los materiales educativos</b> de iFOREX para construir su conocimiento",
      [
        "...",
        2
      ],
      "Discutiremos los detalles más adelante. Todavía tenemos algunos temas más que tratar para que pueda hacer trading con confianza.",
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
            "text": "Dime más",
            "postback": "Dime más",
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
            "text": "Estoy listo para aprender más",
            "postback": "Estoy listo para aprender más",
            "goto": 11
          },
          {
            "id": 2,
            "type": "button",
            "text": "Estoy listo para depositar e invertir ahora",
            "postback": "Estoy listo para depositar e invertir ahora",
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
        "Genial, allá vamos…",
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
        "title": "Lección 1/3",
        "description": "¿Qué es el trading en CFD?",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFD_spa.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "url": "//fast.wistia.net/embed/iframe/yw6n8kxr7h?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "¿Le resultó útil el vídeo \"Qué es el trading de CFD\"?",
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
      "Espero que encuentre más útil la próxima lección",
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
      "Genial, continuemos con la siguiente lección",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "title": "Lección 2/3",
        "description": "¿Qué es el trading apalancado?",
        "type": "video",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Leverage_spa.png",
        "url": "//fast.wistia.net/embed/iframe/xtf06gelcy?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "¿Le resultó útil el vídeo \"Qué es el apalancamiento comercial\"?",
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
      "Espero que encuentre más útil la próxima lección ",
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
      "Genial, continuemos con la siguiente lección",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "title": "Lección 3/3",
        "description": "Ejemplo de trading",
        "subtitle": "Vistazo rápido",
        "type": "lesson",
        "thumbnailDimensions": [
          49,
          48
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "url": "//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/spa/index_SimpleTradingExample_spa.html",
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
      "¿Te resultó útil la lección \"Ejemplo de trading\"?",
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
      "Gracias por tus comentarios",
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
      "Genial, gracias por los comentarios",
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
            "text": "Continuar",
            "postback": "Continuar",
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
      "Asegurémonos de que estés al día. Aquí hay algunas preguntas para ti.",
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
        "text": "¿Qué es el trading en CFD?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Una forma en la que podrías beneficiarte de los movimientos de precios de un producto financiero real sin realmente poseerlo",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "Adquisición de productos financieros reales del mercado de valores",
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
        "text": "qué apalancamiento llevaría a un mayor potencial de ganancias",
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
            "text": "<b>2/2</b> Ha estado prestando atención.",
            "goto": 37
          },
          "wrong": {
            "type": "text",
            "text": "<b>1/2</b> No está mal, sigamos adelante",
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
        "text": "qué apalancamiento llevaría a un mayor potencial de ganancias",
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
            "text": "<b>1/2</b> No está mal, sigamos adelante",
            "goto": 37
          },
          "wrong": {
            "type": "text",
            "text": "<b>0/2</b> Ok…sigamos adelante ",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "Bien, sigamos adelante.<br/>Hemos explicado los conceptos básicos del trading. Ya casi está listo para explorar el mercado en busca de oportunidades. Pero primero, aquí hay algunas herramientas de la plataforma que podrían ayudarle a tomar decisiones informadas cuando realice operaciones...",
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
            "text": "Estoy interesado,<br /> muéstrame las herramientas",
            "postback": "Estoy interesado,<br /> muéstrame las herramientas",
            "goto": 39
          },
          {
            "id": 1000,
            "type": "button",
            "text": "Estoy listo para depositar<br />e invertir ahora",
            "postback": "Estoy listo para depositar<br />e invertir ahora",
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
        "Bien, cuanta más información tengas, más podrás aprovechar las oportunidades financieras.",
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
        "title": "Lección 1/3",
        "description": "¿Qué son las señales de comercio?",
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
      "¿Le resultó útil el vídeo \"Qué son las señales\"?",
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
      "Espero que encuentre más útil la próxima lección ",
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
      "Genial, continuemos con la siguiente lección",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "title": "Lección 2/3",
        "description": "¿Qué es el sentimiento del mercado?",
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
      "¿Encontraste útil este video?",
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
      "Genial, continuemos con la siguiente lección",
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
      "Espero que encuentre más útil la próxima lección",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "title": "Lección 3/3",
        "description": "¿Qué son los factores de trading?",
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
      "¿Encontraste útil este video?",
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
      "Gracias por tus comentarios",
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
      "Genial, gracias por los comentarios",
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
            "text": "Continuar",
            "postback": "Continuar",
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
      "Asegurémonos de que estés al día. Aquí hay algunas preguntas para ti.",
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
        "text": "¿Es factible que los fenómenos ambientales extremos (por ejemplo, huracanes o sequías) afecten al precio de…? ",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Productos agrícolas como café, azúcar o cacao",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "Productos de \"refugio seguro\" como el oro",
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
        "text": "¿Qué es el sentimiento de trading?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Una herramienta que muestra si la mayoría de los traders esperaban que un instrumento subiera o bajara ",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "Una herramienta que muestra cómo los analistas pronostican sobre un instrumento con el que operar",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>2/2</b> Bien hecho, te espera un mundo de oportunidades de inversión",
            "goto": 88
          },
          "wrong": {
            "type": "text",
            "text": "<b>1/2 </b>No está mal... Recuerde, usted obtiene acceso a todos nuestros materiales educativos después de su depósito",
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
        "text": "¿Qué es el sentimiento de trading?",
        "choices": [
          {
            "id": 1,
            "type": "button",
            "text": "Una herramienta que muestra si la mayoría de los traders esperaban que un instrumento subiera o bajara ",
            "correct": true
          },
          {
            "id": 2,
            "type": "button",
            "text": "Una herramienta que muestra cómo los analistas pronostican sobre un instrumento con el que operar",
            "correct": false
          }
        ],
        "response": {
          "correct": {
            "type": "text",
            "text": "<b>1/2 </b>No está mal... Recuerde, usted obtiene acceso a todos nuestros materiales educativos después de su depósito",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "Por lo tanto, hemos sentado las bases para su comprensión. Ahora tiene los conceptos básicos sobre los que empezar a construir.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Siéntase libre de usar los <b> materiales educativos </b> y practique con su propia <b> cuenta demo </b>.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "No olvide que su primera operación es sin riesgo, <b> las ganancias de la transacción son suyas y las pérdidas (si las hubiera) son responsabilidad nuestra (hasta 50 US$), para que pueda comenzar a hacer trading sin riesgos</b>.",
        1
      ],
      [
        "...",
        2
      ],
      [
        "Aproveche esta oportunidad especial para capitalizar su inversión.",
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
        "La elección es suya. Después de recibir el kit, puede empezar a operar cuando lo desee o, si cambia de opinión,<b> siempre puede retirar su depósito, sin preguntas, 100% sin riesgo</b>. Aproveche esta excepcional oportunidad para capitalizar su inversión.",
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
            "text": "Depositar y recoger el paquete",
            "postback": "Depositar y recoger el paquete"
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "¿No estás listo al 100%? Toma un paseo por la plataforma",
            "postback": "¿No estás listo al 100%? Toma un paseo por la plataforma",
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
            "text": "Depositar y recoger el paquete",
            "postback": "Depositar y recoger el paquete"
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
        "Enhorabuena, ahora puedes acceder al paquete de depósito completo, que incluye acceso a materiales educativos, cuenta demo sin riesgo y capacitación 1-a-1. Para más detalles, no dudes en ponerte en contacto con nosotros.",
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
        "Debe sentirse seguro con su bróker y, para eso, ofrecemos una promoción especial para nuestros clientes. <b>Primera operación sin riesgo. Las ganancias de la transacción son suyas y las pérdidas (si las hubiera) recaen sobre nosotros (hasta 50 dólares) para que pueda comenzar a hacer trading sin riesgos</b> ",
        4
      ],
      [
        "...",
        2
      ],
      [
        "<b>Somos un bróker con licencia mundial y más de 22 años de experiencia</b> operando en múltiples mercados internacionales, disponibles en más de 20 idiomas para atender a miles de traders que optan por invertir con nosotros.",
        3
      ],
      "...",
      [
        "En pocas palabras, <b>tenemos la reputación de estar entre los líderes mundiales del trading financiero en línea</b>.",
        2
      ],
      [
        "..."
      ],
      [
        "Además de la promoción de la primera operación, esto es lo que tenemos para ofrecer:"
      ],
      "...",
      [
        "Hasta un<b> 100% de reembolso</b> desde tu segundo depósito en adelante",
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
            "text": "Estoy interesado. Muéstrame más",
            "postback": "Estoy interesado. Muéstrame más",
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
        "<b>Apalancamiento de hasta 400:1 </b> y comisiones competitivas.",
        1
      ],
      "...",
      [
        "Gana un <b>3% de interés </b> en tu saldo neto.",
        1.5
      ],
      "...",
      [
        "Sistema de retiros rápidos"
      ],
      "...",
      [
        "¡Esto es solo el comienzo! ¿Mencioné que también le brindamos <b>señales de trading, una cuenta demo</b> de 5.000 US$ para practicar, <b>materiales educativos</b> para una capacitación avanzada y mucho, mucho más…?",
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
            "text": "Cuéntame un poco sobre las herramientas de trading (5 minutos)",
            "postback": "Cuéntame un poco sobre las herramientas de trading (5 minutos)",
            "goto": 104
          },
          {
            "id": 1000,
            "type": "button",
            "text": "Dame un tour completo (10 minutos)",
            "postback": "Dame un tour completo",
            "goto": 11
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "Estoy listo para depositar e invertir ahora",
            "postback": "Estoy listo para depositar e invertir ahora",
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
        "Bien, cuanta más información tengas, más podrás aprovechar las oportunidades financieras.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Construimos nuestra plataforma para traders y dejamos que nuestra experiencia nos guíe hacia el suministro de las herramientas y funciones que desean. ¿Nuestro propósito? Maximizar tu potencial de inversión con nuestra plataforma fácil de usar, así como también ayudarte a tomar decisiones mejor informadas y aprovechar al máximo tus estrategias de inversión.",
        7
      ],
      [
        "...",
        2
      ],
      [
        "Vamos directamente a ello…"
      ],
      [
        "...",
        1
      ],
      [
        "Nuestra oferta de plataforma incluye herramientas tales como:"
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
        "title": "Lección 1/3",
        "description": "¿Qué son las señales de comercio?",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals_spa.png",
        "url": "//fast.wistia.net/embed/iframe/ref99gcwdd?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "¿Le resultó útil el vídeo \"Qué son las señales\"?",
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
      "Espero que encuentre más útil la próxima lección",
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
      "Genial, continuemos con la siguiente lección",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "title": "Lección 2/3",
        "description": "Indicadores de mercado",
        "type": "video",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Indicators.png",
        "url": "//fast.wistia.net/embed/iframe/9nv82lp0jt?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
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
      "¿Le resultó útil el vídeo \"Indicadores de mercado\"?",
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
      "Genial, continuemos con la siguiente lección",
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
      "Espero que encuentre más útil la próxima lección",
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
            "text": "Continuar",
            "postback": "Continuar",
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
        "title": "Lección 3/3",
        "description": "Análisis Técnico Básico",
        "type": "lesson",
        "thumbnailDimensions": [
          49,
          48
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "url": "//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/spa/index_TechnicalAnalysis_spa.html",
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
      "¿Te resultó útil la lección \"análisis técnico básico\"?",
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
      "Genial, gracias por los comentarios",
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
      "Gracias por tus comentarios",
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
            "text": "Continuar",
            "postback": "Continuar",
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
      "¿Le gusta lo que ve? <b>Empiece ahora con un acceso completo </b> y sin riesgos en su primera operación a la gama completa de herramientas y características dinámicas disponibles en nuestra plataforma.",
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
      "Y recuerda, si cambias de opinión, puedes retirar tu depósito en cualquier momento, sin preguntas, sin cargos y 100% libre de riesgos.",
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
            "text": "Depositar y recoger el paquete",
            "postback": "Depositar y recoger el paquete"
          },
          {
            "id": 1001,
            "type": "buton",
            "text": "¿No estás listo al 100%? Toma un paseo por la plataforma",
            "postback": "¿No estás listo al 100%? Toma un paseo por la plataforma",
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
            "text": "Depositar y recoger el paquete",
            "postback": "Depositar y recoger el paquete"
          }
        ]
      }
    ],
    "blockid": 143
  }
]
