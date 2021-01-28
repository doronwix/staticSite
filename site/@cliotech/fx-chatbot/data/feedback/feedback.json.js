[
  {
    "name": "welcome message",
    "id": 10,
    "messages": [
      {
        "for": 1,
        "url": "data/feedback/feedback_icon.png",
        "alt": "feedback_icon.png",
        "type": "image"
      },
      "key: txt_intro_title",
      {
        "choices": [
          {
            "goto": 20,
            "postback": "",
            "text": "",
            "type": "button",
            "id": 1000,
            "content_key": "btn_start"
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "lets_start",
      "text=[content_key]",
      "block_id=[blockId]"
    ]
  },
  {
    "id": 20,
    "messages": [
      "key: txt_section1_title1",
      {
        "choices": [
          {
            "goto": 30,
            "postback": "Many times a day",
            "text": "Many times a day",
            "type": "button",
            "id": 1000,
            "content_key": "btn_section1_1"
          },
          {
            "goto": 30,
            "postback": "About once a day",
            "text": "About once a day",
            "type": "button",
            "id": 1001,
            "content_key": "btn_section1_2"
          },
          {
            "goto": 30,
            "postback": "Several times a week",
            "text": "Several times a week",
            "type": "button",
            "id": 1002,
            "content_key": "btn_section1_3"
          },
          {
            "goto": 30,
            "postback": "About once a week",
            "text": "About once a week",
            "type": "button",
            "id": 1003,
            "content_key": "btn_section1_4"
          },
          {
            "goto": 30,
            "postback": "",
            "text": "",
            "type": "button",
            "id": 1004,
            "content_key": "btn_section1_5"
          },
          {
            "goto": 21,
            "postback": "Other (please specify)",
            "text": "Other (please specify)",
            "type": "button",
            "id": 1005,
            "content_key": "btn_anysection_other"
          }
        ],
        "type": "choices",
        "qtype": "experience_rating"
      }
    ],
    "name": "How often do you use the app",
    "onClick": [
      "How often do you use the app?",
      "block_id=[blockId]",
      "text=[CONTENT_KEY]",
      "section=usage_frequency"
    ]
  },
  {
    "id": 21,
    "messages": [
      {
        "freeTextInput": {
          "goto": 30,
          "postback": "",
          "text": "",
          "content_key": "btn_submit",
          "placeholder": "",
          "placeholder_content_key": "textarea_placeholder"
        },
        "type": "freeTextInput"
      }
    ],
    "onClick": [
      "freeTextInput",
      "block_id=[blockId]",
      "section=usage_frequency_other",
      "text=[TEXT_VALUE]"
    ]
  },
  {
    "id": 30,
    "messages": [
      "key: txt_section2_title1",
      {
        "choices": [
          {
            "goto": 40,
            "postback": "Very Satisfied",
            "text": "Very Satisfied",
            "type": "button",
            "id": 1000,
            "content_key": "btn_section2_1"
          },
          {
            "goto": 40,
            "postback": "Satisfied",
            "text": "Satisfied",
            "type": "button",
            "id": 1001,
            "content_key": "btn_section2_2"
          },
          {
            "goto": 50,
            "postback": "Neutral",
            "text": "Neutral",
            "type": "button",
            "id": 1002,
            "content_key": "btn_section2_3"
          },
          {
            "goto": 60,
            "postback": "Unsatisfied",
            "text": "Unsatisfied",
            "type": "button",
            "id": 1003,
            "content_key": "btn_section2_4"
          },
          {
            "goto": 60,
            "postback": "Very Unsatisfied",
            "text": "Very Unsatisfied",
            "type": "button",
            "id": 1003,
            "content_key": "btn_section2_5"
          }
        ],
        "type": "choices"
      }
    ],
    "name": "Overall, how would you rate your experience with our app so far?",
    "onClick": [
      "Overall, how would you rate your experience with our app so far?",
      "block_id=[blockId]",
      "text=[CONTENT_KEY]",
      "section=experience_rating"
    ]
  },
  {
    "id": 40,
    "messages": [
      "key: txt_section3_title1",
      {
        "blockId": 70,
        "type": "goto"
      }
    ]
  },
  {
    "id": 50,
    "messages": [
      "key: txt_section3_title2",
      {
        "blockId": 70,
        "type": "goto"
      }
    ]
  },
  {
    "id": 60,
    "messages": [
      "key: txt_section3_title3",
      {
        "blockId": 70,
        "type": "goto"
      }
    ]
  },
  {
    "id": 70,
    "messages": [
      {
        "choices": [
          {
            "goto": 80,
            "postback": "Registration process",
            "text": "Registration process",
            "type": "button",
            "id": 1000,
            "content_key": "btn_section3_1"
          },
          {
            "goto": 80,
            "postback": "Customer Service",
            "text": "Customer Service",
            "type": "button",
            "id": 1001,
            "content_key": "btn_section3_2"
          },
          {
            "goto": 80,
            "postback": "Payment methods",
            "text": "Payment methods",
            "type": "button",
            "id": 1002,
            "content_key": "btn_section3_3"
          },
          {
            "goto": 80,
            "postback": "Withdrawal process",
            "text": "Withdrawal process",
            "type": "button",
            "id": 1003,
            "content_key": "btn_section3_4"
          },
          {
            "goto": 80,
            "postback": "Trading experience",
            "text": "Trading experience",
            "type": "button",
            "id": 1004,
            "content_key": "btn_section3_5"
          },
          {
            "goto": 80,
            "postback": "Insturments variety",
            "text": "Insturments variety",
            "type": "button",
            "id": 1005,
            "content_key": "btn_section3_6"
          },
          {
            "goto": 80,
            "postback": "Tools variety",
            "text": "Tools variety",
            "type": "button",
            "id": 1006,
            "content_key": "btn_section3_7"
          },
          {
            "goto": 71,
            "postback": "Other (please specify)",
            "text": "Other (please specify)",
            "type": "button",
            "id": 1007,
            "content_key": "btn_anysection_other"
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "70 -",
      "block_id=[blockId]",
      "text=[CONTENT_KEY]",
      "section=rating_reason"
    ]
  },
  {
    "id": 71,
    "messages": [
      {
        "freeTextInput": {
          "goto": 80,
          "postback": "",
          "text": "",
          "content_key": "btn_submit",
          "placeholder": "",
          "placeholder_content_key": "textarea_placeholder"
        },
        "type": "freeTextInput"
      }
    ],
    "onClick": [
      "block_id=[blockId]",
      "section=rating_reason_other",
      "text=[TEXT_VALUE]"
    ]
  },
  {
    "id": 80,
    "name": "Tell me more",
    "messages": [
      "key: txt_section4_title1",
      {
        "choices": [
          {
            "goto": 90,
            "postback": "I did not experience any problems",
            "text": "I did not experience any problems",
            "type": "button",
            "id": 1000,
            "content_key": "btn_section4_1"
          },
          {
            "goto": 81,
            "postback": "I wasn't able to login",
            "text": "I wasn't able to login",
            "type": "button",
            "id": 1001,
            "content_key": "btn_section4_2"
          },
          {
            "goto": 81,
            "postback": "The app didn't load",
            "text": "The app didn't load",
            "type": "button",
            "id": 1002,
            "content_key": "btn_section4_3"
          },
          {
            "goto": 81,
            "postback": "I wasn't able to deposit",
            "text": "I wasn't able to deposit",
            "type": "button",
            "id": 1003,
            "content_key": "btn_section4_4"
          },
          {
            "goto": 81,
            "postback": "The rates were not updating",
            "text": "The rates were not updating",
            "type": "button",
            "id": 1004,
            "content_key": "btn_section4_5"
          },
          {
            "goto": 81,
            "postback": "The app was slow and heavy",
            "text": "The app was slow and heavy",
            "type": "button",
            "id": 1005,
            "content_key": "btn_section4_6"
          },
          {
            "goto": 81,
            "postback": "The app crashed and closed",
            "text": "The app crashed and closed",
            "type": "button",
            "id": 1007,
            "content_key": "btn_section4_7"
          },
          {
            "goto": 81,
            "postback": "The app stuck or freezed",
            "text": "key: k1The app stuck or freezed",
            "type": "button",
            "id": 1008,
            "content_key": "btn_section4_8"
          },
          {
            "goto": 82,
            "postback": "Other (please specify)",
            "text": "Other (please specify)",
            "type": "button",
            "id": 1007,
            "content_key": "btn_anysection_other"
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "How often do you use the app?",
      "block_id=[blockId]",
      "text=[CONTENT_KEY]",
      "section=problems"
    ]
  },
  {
    "id": 82,
    "messages": [
      {
        "freeTextInput": {
          "goto": 90,
          "postback": "",
          "text": "",
          "content_key": "btn_submit",
          "placeholder": "",
          "placeholder_content_key": "textarea_placeholder"
        },
        "type": "freeTextInput"
      }
    ],
    "onClick": [
      "block_id=[blockId]",
      "section=problems_other",
      "text=[TEXT_VALUE]"
    ]
  },
  {
    "id": 81,
    "messages": [
      "key: txt_section5_title1",
      {
        "freeTextInput": {
          "goto": 90,
          "postback": "",
          "text": "",
          "is_optional": true,
          "content_key": "btn_submit",
          "placeholder": "",
          "placeholder_content_key": "textarea_placeholder"
        },
        "type": "freeTextInput"
      }
    ],
    "onClick": [
      "block_id=[blockId]",
      "section=detailed_problems",
      "text=[TEXT_VALUE]"
    ]
  },
  {
    "id": 90,
    "messages": [
      "key: txt_sectionfeedback_title1",
      {
        "choices": [
          {
            "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},
            "postback": "No",
            "text": "No",
            "type": "button",
            "id": 1,
            "content_key": "btn_no"
          },
          {
            "goto": 91,
            "postback": "Yes",
            "text": "Yes",
            "type": "button",
            "id": 2,
            "content_key": "btn_yes"
          }
        ],
        "type": "choices"
      }
    ],
    "onClick": [
      "block_id=[blockId]",
      "text=[CONTENT_KEY]",
      "section=anything_else"
    ]
  },
  {
    "id": 91,
    "messages": [
      {
        "freeTextInput": {
          "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},
          "postback": "",
          "text": "",
          "content_key": "btn_submit",
          "placeholder": "",
          "placeholder_content_key": "textarea_placeholder"
        },
        "type": "freeTextInput"
      }
    ],
    "onClick": [
      "block_id=[blockId]",
      "section=anything_else",
      "text=[TEXT_VALUE]"
    ]
  },
  {
    "id": 100,
    "messages": [
      {
        "for": 1,
        "url": "data/feedback/paper_plane.png",
        "type": "image"
      },
      "key: txt_thankyou_title1",
      {
        "blockId": 120,
        "type": "goto"
      }
    ]
  },
  {
    "id": 101,
    "messages": [
      {
        "for": 1,
        "url": "data/feedback/paper_plane.png",
        "type": "image"
      },
      "key: txt_thankyou_title1",
      {
        "blockId": 110,
        "type": "goto"
      }
    ]
  },
  {
    "id": 120,
    "messages": [
      "key: txt_sectionend1_title1",
      {
        "choices": [
          {
            "postback": "",
            "text": "",
            "type": "button",
            "id": 1,
            "content_key": "btn_sectionend1",
            "onClick": [
              "block_id=120",
              "text=btn_sectionend1",
              "section=leave_review"
            ]
          }
        ],
        "type": "choices"
      }
    ],
    "onLoad": [
      "block_id=[blockId]",
      "text=txt_sectionend1_title1",
      "section=leave_review"
    ]
  },
  {
    "id": 110,
    "messages": [
      "key: txt_sectionend2_title1"
    ]
  }
]