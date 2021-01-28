[
  {
    "messages": [
      {
        "for": 1,
        "url": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/image_spanish.png",
        "type": "image"
      },
      [
        "...",
        0.5
      ],
      [
        "Hola, soy Lexi.",
        1
      ],
      [
        "...",
        1
      ],
      [
        "Recorreremos juntos el camino a través de nuestra plataforma de trading y te conectaremos a las oportunidades financieras.",
        4
      ],
      [
        "...",
        1
      ],
      [
        "Empecemos con una pregunta:"
      ],
      [
        "...",
        1
      ],
      [
        "¿Tienes experiencia en el trading de productos CFD? "
      ],
      [
        "...",
        1
      ],
      {
        "choices": [
          {
            "goto": 2,
            "postback": "No tengo experiencia de trading",
            "text": "No tengo experiencia de trading",
            "type": "button",
            "id": 1
          },
          {
            "goto": 100,
            "postback": "Tengo experiencia de trading",
            "text": "Tengo experiencia de trading",
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
        "¡Bien, estás de suerte! Nuestra plataforma conecta a las personas con oportunidades financieras globales. Sin embargo, muchos traders no saben cómo empezar.",
        3
      ],
      [
        "...",
        2
      ],
      [
        "Por lo tanto, utilizamos nuestros más de 20 años de experiencia para configurar un 'tour' para traders como tú.",
        5
      ],
      [
        "...",
        2
      ],
      [
        "Estamos a punto de comenzar tu \"tour\" de trading personalizado, en el que aprenderemos acerca de las ventajas y los riesgos del trading de CFD.",
        4
      ],
      [
        "...",
        2
      ],
      [
        "Para ayudarte en tu camino, te daremos…",
        3
      ],
      [
        "...",
        2
      ],
      [
        "<b>Entrenamiento gratuito 1-a-1</b> para darle un toque personal y para poder preguntar.",
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
        "Acceso a <b>tutoriales educativos</b> y a una cuenta demo para practicar sin riesgos.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Ten en cuenta que también obtendrás hasta un <b>50% de bono trading por tu depósito</b>.",
        4
      ],
      [
        "...",
        2
      ],
      "Obtienes todo esto con tu kit de depósito. Espera, eso viene después, todavía tenemos algunas cosas más que mostrarte…",
      [
        "...",
        2
      ],
      {
        "choices": [
          {
            "goto": 11,
            "postback": "Dame el tour completo (10 minutos)",
            "text": "Dame el tour completo (10 minutos)",
            "type": "button",
            "id": 1
          },
          {
            "goto": 39,
            "postback": "Cuéntame sobre las herramientas de trading<br> (5 minutos)",
            "text": "Cuéntame sobre las herramientas de trading<br> (5 minutos)",
            "type": "button",
            "id": 1
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "Estoy listo para depositar e invertir ahora",
            "text": "Estoy listo para depositar e invertir ahora",
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
        "Genial, allá vamos…",
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
        "url": "//fast.wistia.net/embed/iframe/yw6n8kxr7h?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnailDimensions": [
          200,
          109
        ],
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFD_spa.png",
        "type": "video",
        "description": "Qué es el trading de CFD",
        "title": "Lección 1/3"
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
      "¿Le resultó útil el vídeo \"Qué es el trading de CFD\"?",
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
      "Espero que encuentres más útil la próxima lección",
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
      "Genial, continuemos con la siguiente lección",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "url": "//fast.wistia.net/embed/iframe/xtf06gelcy?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Leverage_spa.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "¿Qué es el trading apalancado?",
        "title": "Lección 2/3"
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
      "¿Le resultó útil el vídeo \"Qué es el apalancamiento comercial\"?",
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
      "Espero que encuentres más útil la próxima lección",
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
      "Genial, continuemos con la siguiente lección",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "url": "//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/spa/index_SimpleTradingExample_spa.html",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "thumbnailDimensions": [
          49,
          48
        ],
        "type": "lesson",
        "subtitle": "Vistazo rápido",
        "description": "Ejemplo de trading",
        "title": "Lección 3/3"
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
      "¿Te resultó útil la lección \"Ejemplo de trading\"?",
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
      "Gracias por tus comentarios",
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
      "Genial, gracias por los comentarios",
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
            "postback": "Continuar",
            "text": "Continuar",
            "type": "button",
            "id": 1
          }
        ]
      }
    ]
  },
  {
    "messages": [
      "Asegurémonos de que estés al día. Aquí hay algunas preguntas para ti.",
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
            "text": "Una forma en la que podrías beneficiarte de los movimientos de precios de un producto financiero real sin realmente poseerlo",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "compra de productos financieros reales del mercado de valores",
            "type": "button",
            "id": 2
          }
        ],
        "text": "Qué es el trading de CFD",
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
            "text": "<b>1/2</b> Nada mal para empezar",
            "type": "text"
          },
          "correct": {
            "goto": 37,
            "text": "<b>2/2</b> Bien hecho, has estado prestando atención",
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
        "text": "qué apalancamiento llevaría a un mayor potencial de ganancias",
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
            "text": "<b>0/2</b> Aprender cosas nuevas es difícil, pero no te preocupes, lo lograremos",
            "type": "text"
          },
          "correct": {
            "goto": 37,
            "text": "<b>1/2</b> Nada mal para empezar",
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
        "text": "qué apalancamiento llevaría a un mayor potencial de ganancias",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "Hemos discutido algunos de los conceptos básicos del trading juntos y estamos casi listos para explorar el mercado en busca de oportunidades. ¿Te sientes emocionado?",
        3
      ],
      [
        "...",
        2
      ],
      [
        "¡Entonces deberías leer! Pero, primero, debemos analizar algunas herramientas que podrían ayudarte a tomar decisiones de trading...",
        2
      ],
      {
        "choices": [
          {
            "goto": 39,
            "postback": "Estoy interesado,<br/> muéstrame las herramientas",
            "text": "Estoy interesado,<br />muéstrame las herramientas",
            "type": "button",
            "id": 1000
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "Estoy listo para depositar<br/> e invertir ahora",
            "text": "Estoy listo para depositar<br />e invertir ahora",
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
        "Bien, cuanto más sepas acerca de nuestras herramientas de trading y cómo usarlas, mejor será para ti aprovechar las oportunidades financieras.",
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
        "url": "//fast.wistia.net/embed/iframe/ref99gcwdd?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals_spa.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "¿Qué son las señales de comercio?",
        "title": "Lección 1/3"
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
      "¿Le resultó útil el vídeo \"Qué son las señales\"?",
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
      "Espero que encuentres más útil la próxima lección",
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
      "Genial, continuemos con la siguiente lección",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "url": "//fast.wistia.net/embed/iframe/2cmb9wzff9?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Sentiment.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "description": "¿Qué es el sentimiento del mercado?",
        "title": "Lección 2/3"
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
      "¿Encontraste útil este video?",
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
      "Genial, continuemos con la siguiente lección",
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
      "Espero que encuentres más útil la próxima lección",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "url": "//fast.wistia.net/embed/iframe/bj6nq75m0e?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/factors.png",
        "thumbnailDimensions": [
          200,
          109
        ],
        "type": "video",
        "subtitle": "",
        "description": "¿Qué son los factores de trading?",
        "title": "Lección 3/3"
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
      "¿Encontraste útil este video?",
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
      "Gracias por tus comentarios",
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
      "Gracias por tus comentarios",
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
            "postback": "Continuar",
            "text": "Continuar",
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
      "Asegurémonos de que estés al día. Aquí hay algunas preguntas para ti.",
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
            "text": "Productos agrícolas como café, azúcar o cacao",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "Productos de \"refugio seguro\" como el oro",
            "type": "button",
            "id": 2
          }
        ],
        "text": "¿Es factible que los fenómenos ambientales extremos (por ejemplo, huracanes o sequías) afecten al precio de…? ",
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
            "text": "<b>1/2 </b>No está mal, con experiencia mejorarás.",
            "type": "text"
          },
          "correct": {
            "goto": 88,
            "text": "<b>2/2</b> Bien hecho, te espera un mundo de oportunidades de inversión",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "Una herramienta que muestra si la mayoría de los traders esperaban que un instrumento subiera o bajara ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "Una herramienta que muestra cómo los analistas pronostican sobre un instrumento con el que operar",
            "type": "button",
            "id": 2
          }
        ],
        "text": "¿Qué es el sentimiento de trading?",
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
            "text": "<b>0/2</b> Aprender cosas nuevas es difícil, pero no te preocupes, lo lograremos",
            "type": "text"
          },
          "correct": {
            "goto": 88,
            "text": "<b>1/2</b> No está mal, con experiencia mejorarás.",
            "type": "text"
          }
        },
        "choices": [
          {
            "correct": true,
            "text": "Una herramienta que muestra si la mayoría de los traders esperaban que un instrumento subiera o bajara ",
            "type": "button",
            "id": 1
          },
          {
            "correct": false,
            "text": "Una herramienta que muestra cómo los analistas pronostican sobre un instrumento con el que operar ",
            "type": "button",
            "id": 2
          }
        ],
        "text": "¿Qué es el sentimiento de trading?",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "niciamos esta conversación con una oración…\"determina tu valor\".",
        3
      ],
      [
        "...",
        1
      ],
      [
        "Bueno, no puedo esperar para ver el valor que obtienes del trading. Dispones de lo básico para empezar y, además, estaré aquí cuando me necesites.",
        5
      ],
      [
        "...",
        2
      ],
      [
        "En este momento, debes recoger tu kit de depósito (incluye <B>capacitación 1-a-1</B>, <B>materiales educativos</B> gratuitos,  <B>una cuenta demo</B> para practicar sin riesgo MÁS un <B>bono trading de hasta el 50%</B> por tu depósito). Puedes comenzar a practicar en tu cuenta demo o negociar con dinero real tan pronto como deposites.",
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
        "Recuerda, siempre puedes retirar tu depósito, sin cargos, sin preguntas, 100% libre de riesgos. No pierdas esta excepcional oportunidad de capitalizar tu inversión.",
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
            "postback": "Depositar y recoger el kit",
            "text": "Depositar y recoger el kit",
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
            "postback": "¿No estás listo al 100%? Toma un paseo por la plataforma",
            "text": "¿No estás listo al 100%? Toma un paseo por la plataforma",
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
            "postback": "Depositar y recoger el kit",
            "text": "Depositar y recoger el kit",
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
        "Enhorabuena, ahora puedes acceder al paquete de depósito completo, que incluye acceso a materiales educativos, cuenta demo sin riesgo y capacitación 1-a-1. Para más detalles, no dudes en ponerte en contacto con nosotros.",
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
        "Genial, tenemos experiencia nosotros mismos gracias a más de 22 años como parte del Grupo iFOREX, operando en múltiples mercados internacionales como bróker autorizado, por lo que esperamos que ambos estemos buscando lo mismo…¡grandes oportunidades!",
        7
      ],
      [
        "...",
        2
      ],
      [
        "Nuestra plataforma propia está optimizada para adaptarse a los traders experimentados, gracias a una gran variedad de características y herramientas de productos únicas que nos diferencian del resto.",
        5.5
      ],
      "...",
      [
        "Comencemos, ¿de acuerdo?",
        2
      ],
      [
        "...",
        1
      ],
      [
        "Nuestra oferta de apertura para ti es un <b>bono trading de hasta el 50% por tu primer depósito.",
        2
      ],
      [
        "...",
        2
      ],
      [
        "Espera, eso no es todo…también queremos devolverte el dinero, digamos que hasta un <b>100% de reembolso desde tu segundo depósito en adelante.",
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
            "postback": "Estoy interesado. Muéstrame más",
            "text": "Estoy interesado. Muéstrame más",
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
        "También proporcionamos:",
        1
      ],
      [
        "...",
        1
      ],
      [
        "<b>apalancamiento de hasta 400:1</b> y competitivos spreads",
        1.5
      ],
      "...",
      [
        "<b>Gerente de cuenta dedicado </b> que habla tu mismo idioma.",
        2
      ],
      "...",
      [
        "Gana un <b>3% de interés </b> en tu saldo neto.",
        1.5
      ],
      "...",
      [
        "Sistema de rápidos retiros"
      ],
      "...",
      [
        "¿Suena bien?"
      ],
      "...",
      [
        "Ese es solo el comienzo, porque con nuestro kit de depósito también te damos señales de trading, una cuenta demo de 5.000 US$ para practicar, materiales educativos para una capacitación avanzada y mucho, mucho más.",
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
            "postback": "Cuéntame un poco sobre las herramientas de trading <br>(5 minutos) ",
            "text": "Cuéntame un poco sobre las herramientas de trading <br>(5 minutos) ",
            "type": "button",
            "id": 1000
          },
          {
            "goto": 11,
            "postback": "Dame el tour completo",
            "text": "Dame el tour completo (10 minutos)",
            "type": "button",
            "id": 1000
          },
          {
            "onClick": [
              "deposit",
              null,
              true
            ],
            "postback": "Estoy listo para depositar e invertir ahora",
            "text": "Estoy listo para depositar e invertir ahora",
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
        "Claro, cuanto más familiarizado estés con nuestras herramientas, más probabilidades tendrás de disfrutar de tu experiencia de trading con nosotros :-)",
        2
      ],
      [
        "...",
        2
      ],
      [
        "El propósito de nuestras herramientas es maximizar tu potencial de inversión mediante nuestra plataforma de uso sencillo, así como ayudarte a tomar decisiones más educadas mientras aprovechas al máximo tus estrategias de inversión.",
        7
      ],
      [
        "...",
        2
      ],
      [
        "Vamos directos al grano…"
      ],
      [
        "...",
        1
      ],
      [
        "Nuestra oferta de plataforma incluye herramientas como:"
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
        "url": "//fast.wistia.net/embed/iframe/ref99gcwdd?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TradingSignals_spa.png",
        "type": "video",
        "description": "¿Qué son las señales de comercio?",
        "title": "Lección 1/3"
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
      "¿Le resultó útil el vídeo \"Qué son las señales\"?",
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
      "Espero que encuentres más útil la próxima lección",
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
      "Genial, continuemos con la siguiente lección",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "url": "//fast.wistia.net/embed/iframe/9nv82lp0jt?autoPlay=true&controlsVisibleOnLoad=false&version=v1&videoHeight=360&videoWidth=640&volumeControl=true&fullscreenButton=true&settingsControl=false",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/Indicators.png",
        "type": "video",
        "description": "Indicadores de mercado",
        "title": "Lección 2/3"
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
      "¿Le resultó útil el vídeo \"Indicadores de mercado\"?",
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
      "Genial, continuemos con la siguiente lección",
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
      "Espero que encuentre más útil la próxima lección",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "url": "//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/spa/index_TechnicalAnalysis_spa.html",
        "thumbnail": "https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TxtLesson.png",
        "thumbnailDimensions": [
          49,
          48
        ],
        "type": "lesson",
        "description": "Análisis Técnico Básico",
        "title": "Lección 3/3"
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
      "¿Te resultó útil la lección \"análisis técnico básico\"?",
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
      "Genial, gracias por los comentarios",
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
      "Gracias por tus comentarios",
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
            "postback": "Continuar",
            "text": "Continuar",
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
        "¿Te gusta lo que ves? Obtén nuestro kit de depósito ahora y disfruta usando la gama completa de herramientas dinámicas y características únicas disponibles en nuestra plataforma para capitalizar los mercados.",
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
        "Y recuerda, si cambias de opinión, puedes retirar tu depósito en cualquier momento, sin preguntas, sin cargos y 100% libre de riesgos.",
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
            "postback": "Depositar y recoger el kit",
            "text": "Depositar y recoger el kit",
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
            "postback": "¿No estás listo al 100%? Toma un paseo por la plataforma",
            "text": "¿No estás listo al 100%? Toma un paseo por la plataforma",
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
            "postback": "Depositar y recoger el kit",
            "text": "Depositar y recoger el kit",
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
