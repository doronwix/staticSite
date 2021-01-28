﻿[    {      "name": "welcome message",      "id": 10,      "messages": [        {          "for": 1,          "url": "data/feedback/feedback_icon.png",          "alt": "feedback_icon.png",          "type": "image"        },        "Vielen Dank für die Nutzung unserer App! Wir sind hier, um Ihnen bei allen Fragen, Wünschen oder Anfragen zu helfen.",        {          "choices": [            {              "goto": 20,              "postback": "Beginnen wir",              "text": "Beginnen wir",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_start"            }          ],          "type": "choices"        }      ],      "onClick": [        "lets_start",        "text=[content_key]",        "block_id=[blockId]"      ]    },    {      "id": 20,      "messages": [        "Wie oft benutzen Sie die App?",        {          "choices": [            {              "goto": 30,              "postback": "Mehrmals täglich",              "text": "Mehrmals täglich",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section1_1"            },            {              "goto": 30,              "postback": "Etwa einmal am Tag",              "text": "Etwa einmal am Tag",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section1_2"            },            {              "goto": 30,              "postback": "Mehrmals wöchentlich",              "text": "Mehrmals wöchentlich",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section1_3"            },            {              "goto": 30,              "postback": "Etwa einmal pro Woche",              "text": "Etwa einmal pro Woche",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section1_4"            },            {              "goto": 30,              "postback": "Weniger als einmal pro Woche",              "text": "Weniger als einmal pro Woche",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section1_5"            },            {              "goto": 21,              "postback": "Andere (bitte erläutern)",              "text": "Andere (bitte erläutern)",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices",          "qtype": "experience_rating"        }      ],      "name": "How often do you use the app",      "onClick": [        "How often do you use the app?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=usage_frequency"      ]    },    {      "id": 21,      "messages": [        {          "freeTextInput": {            "goto": 30,            "postback": "Übermitteln",            "text": "Übermitteln",            "content_key": "feedback_btn_submit",            "placeholder": "Bitte erläutern Sie …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "freeTextInput",        "block_id=[blockId]",        "section=usage_frequency_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 30,      "messages": [        "Wie würden Sie insgesamt Ihre bisherigen Erfahrungen mit unserer App bewerten?",        {          "choices": [            {              "goto": 40,              "postback": "Sehr zufrieden",              "text": "Sehr zufrieden",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section2_1"            },            {              "goto": 40,              "postback": "Zufrieden",              "text": "Zufrieden",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section2_2"            },            {              "goto": 50,              "postback": "Neutral",              "text": "Neutral",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section2_3"            },            {              "goto": 60,              "postback": "Unzufrieden",              "text": "Unzufrieden",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section2_4"            },            {              "goto": 60,              "postback": "Sehr unzufrieden",              "text": "Sehr unzufrieden",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section2_5"            }          ],          "type": "choices"        }      ],      "name": "Overall, how would you rate your experience with our app so far?",      "onClick": [        "Overall, how would you rate your experience with our app so far?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=experience_rating"      ]    },    {      "id": 40,      "messages": [        "Es freut uns zu hören, dass Sie eine positive Erfahrung gemacht haben. Gibt es einen bestimmten Grund, warum Sie uns diese Punktzahl gegeben haben?",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 50,      "messages": [        "Es scheint, wir könnten es besser machen. Wie könnten wir uns verbessern?",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 60,      "messages": [        "Es scheint, dass Sie Probleme begegnet sind. Wo könnten wir uns verbessern?",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 70,      "messages": [        {          "choices": [            {              "goto": 80,              "postback": "Ablauf der Registrierung",              "text": "Ablauf der Registrierung",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section3_1"            },            {              "goto": 80,              "postback": "Kundendienst",              "text": "Kundendienst",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section3_2"            },            {              "goto": 80,              "postback": "Zahlungsmethoden",              "text": "Zahlungsmethoden",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section3_3"            },            {              "goto": 80,              "postback": "Auszahlungs-Prozess",              "text": "Auszahlungs-Prozess",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section3_4"            },            {              "goto": 80,              "postback": "Handelserfahrung",              "text": "Handelserfahrung",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section3_5"            },            {              "goto": 80,              "postback": "Insturment-Vielfalt",              "text": "Insturment-Vielfalt",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_section3_6"            },            {              "goto": 80,              "postback": "Vielfalt der Werkzeuge",              "text": "Vielfalt der Werkzeuge",              "type": "button",              "id": 1006,              "content_key": "feedback_btn_section3_7"            },            {              "goto": 71,              "postback": "Andere (bitte erläutern)",              "text": "Andere (bitte erläutern)",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices"        }      ],      "onClick": [        "70 -",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=rating_reason"      ]    },    {      "id": 71,      "messages": [        {          "freeTextInput": {            "goto": 80,            "postback": "Übermitteln",            "text": "Übermitteln",            "content_key": "feedback_btn_submit",            "placeholder": "Bitte erläutern Sie …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=rating_reason_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 80,      "name": "Tell me more",      "messages": [        "Auf welche, wenn überhaupt, der unten aufgeführten Probleme sind Sie bei Ihren jüngsten Erfahrungen mit der App gestoßen?",        {          "choices": [            {              "goto": 90,              "postback": "Ich habe keine Probleme festgestellt.",              "text": "Ich habe keine Probleme festgestellt.",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section4_1"            },            {              "goto": 81,              "postback": "Ich konnte mich nicht einloggen.",              "text": "Ich konnte mich nicht einloggen.",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section4_2"            },            {              "goto": 81,              "postback": "Die App ist nicht gestartet worden",              "text": "Die App ist nicht gestartet worden",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section4_3"            },            {              "goto": 81,              "postback": "Ich konnte nicht einzahlen",              "text": "Ich konnte nicht einzahlen",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section4_4"            },            {              "goto": 81,              "postback": "Die Kurse wurden nicht aktualisiert",              "text": "Die Kurse wurden nicht aktualisiert",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section4_5"            },            {              "goto": 81,              "postback": "Die App war beim Laden langsam",              "text": "Die App war beim Laden langsam",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_section4_6"            },            {              "goto": 81,              "postback": "Die App ist abgestürzt und wurde beendet.",              "text": "Die App ist abgestürzt und wurde beendet.",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_section4_7"            },            {              "goto": 81,              "postback": "Die App blieb hängen oder fror ein",              "text": "Die App blieb hängen oder fror ein",              "type": "button",              "id": 1008,              "content_key": "feedback_btn_section4_8"            },            {              "goto": 82,              "postback": "Andere (bitte erläutern)",              "text": "Andere (bitte erläutern)",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices"        }      ],      "onClick": [        "How often do you use the app?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=problems"      ]    },    {      "id": 82,      "messages": [        {          "freeTextInput": {            "goto": 90,            "postback": "Übermitteln",            "text": "Übermitteln",            "content_key": "feedback_btn_submit",            "placeholder": "Bitte erläutern Sie …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=problems_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 81,      "messages": [        "Bitte beschreiben Sie die aufgetretenen Probleme ausführlicher.",        {          "freeTextInput": {            "goto": 90,            "postback": "Übermitteln",            "text": "Übermitteln",            "is_optional": true,            "content_key": "feedback_btn_submit",            "placeholder": "Bitte erläutern Sie …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=detailed_problems",        "text=[TEXT_VALUE]"      ]    },    {      "id": 90,      "messages": [        "Vielen Dank für Ihr Feedback. Gibt es noch etwas, das Sie uns über Ihre bisherigen Erfahrungen mitteilen möchten?",        {          "choices": [            {              "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},              "postback": "Nein",              "text": "Nein",              "type": "button",              "id": 1,              "content_key": "feedback_btn_no"            },            {              "goto": 91,              "postback": "Ja (bitte erläutern)",              "text": "Ja (bitte erläutern)",              "type": "button",              "id": 2,              "content_key": "feedback_btn_yes"            }          ],          "type": "choices"        }      ],      "onClick": [        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=anything_else"      ]    },    {      "id": 91,      "messages": [        {          "freeTextInput": {            "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},            "postback": "Übermitteln",            "text": "Übermitteln",            "content_key": "feedback_btn_submit",            "placeholder": "Bitte erläutern Sie …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=anything_else",        "text=[TEXT_VALUE]"      ]    },    {      "id": 100,      "messages": [        {          "for": 1,          "url": "data/feedback/paper_plane.png",          "type": "image"        },        "Vielen Dank für Ihr Feedback!",        {          "blockId": 120,          "type": "goto"        }      ]    },    {      "id": 101,      "messages": [        {          "for": 1,          "url": "data/feedback/paper_plane.png",          "type": "image"        },        "Vielen Dank für Ihr Feedback!",        {          "blockId": 110,          "type": "goto"        }      ]    },    {      "id": 120,      "messages": [        "Hinterlassen Sie eine Rezension, geben Sie eine Bewertung ab und verbreiten Sie das Wort…",        {          "choices": [            {              "postback": "Eine Bewertung hinterlassen",              "text": "Eine Bewertung hinterlassen",              "type": "button",              "id": 1,              "content_key": "feedback_btn_sectionend1",              "onClick": [                "block_id=120",                "text=btn_sectionend1",                "section=leave_review"              ]            }          ],          "type": "choices"        }      ],      "onLoad": [        "block_id=[blockId]",        "text=txt_sectionend1_title1",        "section=leave_review"      ]    },    {      "id": 110,      "messages": [        "Es tut uns leid zu hören, dass Sie eine schlechte Erfahrung gemacht haben. Unser Customer Success Manager wird sich bald bei Ihnen melden, um zu besprechen, wie wir uns verbessern können."      ]    }  ]