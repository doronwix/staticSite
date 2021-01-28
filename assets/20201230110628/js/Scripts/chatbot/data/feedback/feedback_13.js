﻿[    {      "name": "welcome message",      "id": 10,      "messages": [        {          "for": 1,          "url": "data/feedback/feedback_icon.png",          "alt": "feedback_icon.png",          "type": "image"        },        "私たちのアプリをご利用いただきありがとうございます！ご不明な点やご要望などございましたら、何でもお聞かせください。",        {          "choices": [            {              "goto": 20,              "postback": "スタート",              "text": "スタート",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_start"            }          ],          "type": "choices"        }      ],      "onClick": [        "lets_start",        "text=[content_key]",        "block_id=[blockId]"      ]    },    {      "id": 20,      "messages": [        "どのくらいの頻度でアプリを使用しますか？",        {          "choices": [            {              "goto": 30,              "postback": "1日に数回",              "text": "1日に数回",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section1_1"            },            {              "goto": 30,              "postback": "だいたい1日に1度",              "text": "だいたい1日に1度",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section1_2"            },            {              "goto": 30,              "postback": "1週間に数回",              "text": "1週間に数回",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section1_3"            },            {              "goto": 30,              "postback": "だいたい1週間に1度",              "text": "だいたい1週間に1度",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section1_4"            },            {              "goto": 30,              "postback": "1週間に1度未満",              "text": "1週間に1度未満",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section1_5"            },            {              "goto": 21,              "postback": "その他（具体的にご入力ください）",              "text": "その他（具体的にご入力ください）",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices",          "qtype": "experience_rating"        }      ],      "name": "How often do you use the app",      "onClick": [        "How often do you use the app?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=usage_frequency"      ]    },    {      "id": 21,      "messages": [        {          "freeTextInput": {            "goto": 30,            "postback": "送信",            "text": "送信",            "content_key": "feedback_btn_submit",            "placeholder": "具体的にご入力ください …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "freeTextInput",        "block_id=[blockId]",        "section=usage_frequency_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 30,      "messages": [        "全体的に見て、当社のアプリをどう評価しますか？",        {          "choices": [            {              "goto": 40,              "postback": "非常に満足",              "text": "非常に満足",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section2_1"            },            {              "goto": 40,              "postback": "満足",              "text": "満足",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section2_2"            },            {              "goto": 50,              "postback": "不透明",              "text": "不透明",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section2_3"            },            {              "goto": 60,              "postback": "不満足",              "text": "不満足",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section2_4"            },            {              "goto": 60,              "postback": "非常に不満足",              "text": "非常に不満足",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section2_5"            }          ],          "type": "choices"        }      ],      "name": "Overall, how would you rate your experience with our app so far?",      "onClick": [        "Overall, how would you rate your experience with our app so far?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=experience_rating"      ]    },    {      "id": 40,      "messages": [        "良い経験をされているとお聞きしてうれしく思います。この評価に特定の理由があれば教えてください。",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 50,      "messages": [        "私たちにはまだ改善の余地があるようですね。どのような点で改善できるでしょう？",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 60,      "messages": [        "何か問題が発生したことがあるようですね。どこを改善できるでしょう？",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 70,      "messages": [        {          "choices": [            {              "goto": 80,              "postback": "登録過程",              "text": "登録過程",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section3_1"            },            {              "goto": 80,              "postback": "カスタマーサービス",              "text": "カスタマーサービス",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section3_2"            },            {              "goto": 80,              "postback": "支払方法",              "text": "支払方法",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section3_3"            },            {              "goto": 80,              "postback": "出金過程",              "text": "出金過程",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section3_4"            },            {              "goto": 80,              "postback": "取引経験",              "text": "取引経験",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section3_5"            },            {              "goto": 80,              "postback": "銘柄の豊富さ",              "text": "銘柄の豊富さ",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_section3_6"            },            {              "goto": 80,              "postback": "ツールの多様性",              "text": "ツールの多様性",              "type": "button",              "id": 1006,              "content_key": "feedback_btn_section3_7"            },            {              "goto": 71,              "postback": "その他（具体的にご入力ください）",              "text": "その他（具体的にご入力ください）",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices"        }      ],      "onClick": [        "70 -",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=rating_reason"      ]    },    {      "id": 71,      "messages": [        {          "freeTextInput": {            "goto": 80,            "postback": "送信",            "text": "送信",            "content_key": "feedback_btn_submit",            "placeholder": "具体的にご入力ください …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=rating_reason_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 80,      "name": "Tell me more",      "messages": [        "最近のアプリ利用中に問題があった場合、以下のうちどれが該当しましたか？",        {          "choices": [            {              "goto": 90,              "postback": "問題があったことはない",              "text": "問題があったことはない",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section4_1"            },            {              "goto": 81,              "postback": "ログインできなかった",              "text": "ログインできなかった",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section4_2"            },            {              "goto": 81,              "postback": "アプリが読み込まれなかった",              "text": "アプリが読み込まれなかった",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section4_3"            },            {              "goto": 81,              "postback": "入金できなかった",              "text": "入金できなかった",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section4_4"            },            {              "goto": 81,              "postback": "レートが更新されなかった",              "text": "レートが更新されなかった",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section4_5"            },            {              "goto": 81,              "postback": "アプリの読み込みが遅かった",              "text": "アプリの読み込みが遅かった",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_section4_6"            },            {              "goto": 81,              "postback": "アプリがクラッシュして閉じた",              "text": "アプリがクラッシュして閉じた",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_section4_7"            },            {              "goto": 81,              "postback": "アプリが固まった・フリーズした",              "text": "アプリが固まった・フリーズした",              "type": "button",              "id": 1008,              "content_key": "feedback_btn_section4_8"            },            {              "goto": 82,              "postback": "その他（具体的にご入力ください）",              "text": "その他（具体的にご入力ください）",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices"        }      ],      "onClick": [        "How often do you use the app?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=problems"      ]    },    {      "id": 82,      "messages": [        {          "freeTextInput": {            "goto": 90,            "postback": "送信",            "text": "送信",            "content_key": "feedback_btn_submit",            "placeholder": "具体的にご入力ください …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=problems_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 81,      "messages": [        "あなたに起こった問題について詳しく説明してください。",        {          "freeTextInput": {            "goto": 90,            "postback": "送信",            "text": "送信",            "is_optional": true,            "content_key": "feedback_btn_submit",            "placeholder": "具体的にご入力ください …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=detailed_problems",        "text=[TEXT_VALUE]"      ]    },    {      "id": 90,      "messages": [        "ご意見ありがとうございます。これまでの経験について、他に共有したいことはありますか？",        {          "choices": [            {              "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},              "postback": "いいえ",              "text": "いいえ",              "type": "button",              "id": 1,              "content_key": "feedback_btn_no"            },            {              "goto": 91,              "postback": "はい（具体的に入力して下し）",              "text": "はい（具体的に入力して下し）",              "type": "button",              "id": 2,              "content_key": "feedback_btn_yes"            }          ],          "type": "choices"        }      ],      "onClick": [        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=anything_else"      ]    },    {      "id": 91,      "messages": [        {          "freeTextInput": {            "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},            "postback": "送信",            "text": "送信",            "content_key": "feedback_btn_submit",            "placeholder": "具体的にご入力ください …",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=anything_else",        "text=[TEXT_VALUE]"      ]    },    {      "id": 100,      "messages": [        {          "for": 1,          "url": "data/feedback/paper_plane.png",          "type": "image"        },        "ご意見ありがとうございます。",        {          "blockId": 120,          "type": "goto"        }      ]    },    {      "id": 101,      "messages": [        {          "for": 1,          "url": "data/feedback/paper_plane.png",          "type": "image"        },        "ご意見ありがとうございます。",        {          "blockId": 110,          "type": "goto"        }      ]    },    {      "id": 120,      "messages": [        "あなたの評価とレビューを世界に広げてください。",        {          "choices": [            {              "postback": "レビューを残す",              "text": "レビューを残す",              "type": "button",              "id": 1,              "content_key": "feedback_btn_sectionend1",              "onClick": [                "block_id=120",                "text=btn_sectionend1",                "section=leave_review"              ]            }          ],          "type": "choices"        }      ],      "onLoad": [        "block_id=[blockId]",        "text=txt_sectionend1_title1",        "section=leave_review"      ]    },    {      "id": 110,      "messages": [        "残念な体験とお聞きし、申し訳なく思います。まもなくカスタマーサクセスマネージャーから、改善方法についてご連絡を差し上げます。"      ]    }  ]