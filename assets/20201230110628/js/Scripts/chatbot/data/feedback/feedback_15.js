﻿[    {      "name": "welcome message",      "id": 10,      "messages": [        {          "for": 1,          "url": "data/feedback/feedback_icon.png",          "alt": "feedback_icon.png",          "type": "image"        },        "Terima kasih kerna telah menggunakan aplikasi kami! Kami di sini untuk membantu anda dengan pertanyaan, keluhan, atau permintaan yang mungkin anda ada.",        {          "choices": [            {              "goto": 20,              "postback": "Mari mulai",              "text": "Mari mulai",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_start"            }          ],          "type": "choices"        }      ],      "onClick": [        "lets_start",        "text=[content_key]",        "block_id=[blockId]"      ]    },    {      "id": 20,      "messages": [        "Seberapa sering anda menggunakan aplikasi?",        {          "choices": [            {              "goto": 30,              "postback": "Sekitar sekali sehari",              "text": "Sekitar sekali sehari",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section1_1"            },            {              "goto": 30,              "postback": "Sekitar sekali sehari",              "text": "Sekitar sekali sehari",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section1_2"            },            {              "goto": 30,              "postback": "Sekitar seminggu sekali",              "text": "Sekitar seminggu sekali",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section1_3"            },            {              "goto": 30,              "postback": "Sekitar seminggu sekali",              "text": "Sekitar seminggu sekali",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section1_4"            },            {              "goto": 30,              "postback": "Kurang dari seminggu sekali",              "text": "Kurang dari seminggu sekali",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section1_5"            },            {              "goto": 21,              "postback": "Lain (sila jelaskan)",              "text": "Lain (sila jelaskan)",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices",          "qtype": "experience_rating"        }      ],      "name": "How often do you use the app",      "onClick": [        "How often do you use the app?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=usage_frequency"      ]    },    {      "id": 21,      "messages": [        {          "freeTextInput": {            "goto": 30,            "postback": "Hantar",            "text": "Hantar",            "content_key": "feedback_btn_submit",            "placeholder": "Sila jelaskan ...",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "freeTextInput",        "block_id=[blockId]",        "section=usage_frequency_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 30,      "messages": [        "Secara keseluruhan, bagaimana nilai pengalaman anda dengan aplikasi kami sejauh ini?",        {          "choices": [            {              "goto": 40,              "postback": "Sangat puas hati",              "text": "Sangat puas hati",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section2_1"            },            {              "goto": 40,              "postback": "Berpuas hati",              "text": "Berpuas hati",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section2_2"            },            {              "goto": 50,              "postback": "Netral",              "text": "Netral",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section2_3"            },            {              "goto": 60,              "postback": "Tidak berpuas hati",              "text": "Tidak berpuas hati",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section2_4"            },            {              "goto": 60,              "postback": "Sangat tidak berpuas hati",              "text": "Sangat tidak berpuas hati",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section2_5"            }          ],          "type": "choices"        }      ],      "name": "Overall, how would you rate your experience with our app so far?",      "onClick": [        "Overall, how would you rate your experience with our app so far?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=experience_rating"      ]    },    {      "id": 40,      "messages": [        "Kami senang mendapati  anda mendapat pengalaman yang baik. Terima kasih dengan skor yang anda telah berikan?",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 50,      "messages": [        "Sepertinya kita bisa untuk menjadi lebih baik. Di mana  kita bisa tingkatkan?",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 60,      "messages": [        "Sepertinya anda mengalami masalah. Di mana kita bisa perbaiki?",        {          "blockId": 70,          "type": "goto"        }      ]    },    {      "id": 70,      "messages": [        {          "choices": [            {              "goto": 80,              "postback": "Proses registrasi",              "text": "Proses registrasi",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section3_1"            },            {              "goto": 80,              "postback": "Pelayanan pelanggan",              "text": "Pelayanan pelanggan",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section3_2"            },            {              "goto": 80,              "postback": "Cara Pembayaran",              "text": "Cara Pembayaran",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section3_3"            },            {              "goto": 80,              "postback": "Process penarikan",              "text": "Process penarikan",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section3_4"            },            {              "goto": 80,              "postback": "Pengalaman perdagangan",              "text": "Pengalaman perdagangan",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section3_5"            },            {              "goto": 80,              "postback": "Berbagai instrumen",              "text": "Berbagai instrumen",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_section3_6"            },            {              "goto": 80,              "postback": "Berbagai alat",              "text": "Berbagai alat",              "type": "button",              "id": 1006,              "content_key": "feedback_btn_section3_7"            },            {              "goto": 71,              "postback": "Lain (sila jelaskan)",              "text": "Lain (sila jelaskan)",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices"        }      ],      "onClick": [        "70 -",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=rating_reason"      ]    },    {      "id": 71,      "messages": [        {          "freeTextInput": {            "goto": 80,            "postback": "Hantar",            "text": "Hantar",            "content_key": "feedback_btn_submit",            "placeholder": "Sila jelaskan ...",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=rating_reason_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 80,      "name": "Tell me more",      "messages": [        "Yang mana, jika ada, masalah di bawah ini yang anda telah lalui  baru-baru ini dengan aplikasi?",        {          "choices": [            {              "goto": 90,              "postback": "Saya tidak mengalami masalah",              "text": "Saya tidak mengalami masalah",              "type": "button",              "id": 1000,              "content_key": "feedback_btn_section4_1"            },            {              "goto": 81,              "postback": "Saya tidak bisa log  masuk",              "text": "Saya tidak bisa log  masuk",              "type": "button",              "id": 1001,              "content_key": "feedback_btn_section4_2"            },            {              "goto": 81,              "postback": "Aplikasi tidak dibuka",              "text": "Aplikasi tidak dibuka",              "type": "button",              "id": 1002,              "content_key": "feedback_btn_section4_3"            },            {              "goto": 81,              "postback": "Saya tidak bisa deposit",              "text": "Saya tidak bisa deposit",              "type": "button",              "id": 1003,              "content_key": "feedback_btn_section4_4"            },            {              "goto": 81,              "postback": "Kadar tidak diperbarui",              "text": "Kadar tidak diperbarui",              "type": "button",              "id": 1004,              "content_key": "feedback_btn_section4_5"            },            {              "goto": 81,              "postback": "Aplikasi lembab dan berat",              "text": "Aplikasi lembab dan berat",              "type": "button",              "id": 1005,              "content_key": "feedback_btn_section4_6"            },            {              "goto": 81,              "postback": "Aplikasi sering berhenti dan tertutup",              "text": "Aplikasi sering berhenti dan tertutup",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_section4_7"            },            {              "goto": 81,              "postback": "Aplikasi mengeras atau berhenti",              "text": "Aplikasi mengeras atau berhenti",              "type": "button",              "id": 1008,              "content_key": "feedback_btn_section4_8"            },            {              "goto": 82,              "postback": "Lain (sila jelaskan)",              "text": "Lain (sila jelaskan)",              "type": "button",              "id": 1007,              "content_key": "feedback_btn_anysection_other"            }          ],          "type": "choices"        }      ],      "onClick": [        "How often do you use the app?",        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=problems"      ]    },    {      "id": 82,      "messages": [        {          "freeTextInput": {            "goto": 90,            "postback": "Hantar",            "text": "Hantar",            "content_key": "feedback_btn_submit",            "placeholder": "Sila jelaskan ...",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=problems_other",        "text=[TEXT_VALUE]"      ]    },    {      "id": 81,      "messages": [        "Tolong jelaskan masalah yang anda lalui dengan lebih detail.",        {          "freeTextInput": {            "goto": 90,            "postback": "Hantar",            "text": "Hantar",            "is_optional": true,            "content_key": "feedback_btn_submit",            "placeholder": "Sila jelaskan ...",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=detailed_problems",        "text=[TEXT_VALUE]"      ]    },    {      "id": 90,      "messages": [        "Terima kasih atas tanggapan anda. Apakah ada hal yang lain yang ingin anda katakan tentang pengalaman anda sejauh ini?",        {          "choices": [            {              "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},              "postback": "tidak",              "text": "tidak",              "type": "button",              "id": 1,              "content_key": "feedback_btn_no"            },            {              "goto": 91,              "postback": "Ya (sila jelaskan)",              "text": "Ya (sila jelaskan)",              "type": "button",              "id": 2,              "content_key": "feedback_btn_yes"            }          ],          "type": "choices"        }      ],      "onClick": [        "block_id=[blockId]",        "text=[CONTENT_KEY]",        "section=anything_else"      ]    },    {      "id": 91,      "messages": [        {          "freeTextInput": {            "goto": {"goto_if":{"id":30,"answers":[1000,1001]},"goto_then":100,"goto_else":101},            "postback": "Hantar",            "text": "Hantar",            "content_key": "feedback_btn_submit",            "placeholder": "Sila jelaskan ...",            "placeholder_content_key": "feedback_textarea_placeholder"          },          "type": "freeTextInput"        }      ],      "onClick": [        "block_id=[blockId]",        "section=anything_else",        "text=[TEXT_VALUE]"      ]    },    {      "id": 100,      "messages": [        {          "for": 1,          "url": "data/feedback/paper_plane.png",          "type": "image"        },        "Thanks for your feedback!",        {          "blockId": 120,          "type": "goto"        }      ]    },    {      "id": 101,      "messages": [        {          "for": 1,          "url": "data/feedback/paper_plane.png",          "type": "image"        },        "Thanks for your feedback!",        {          "blockId": 110,          "type": "goto"        }      ]    },    {      "id": 120,      "messages": [        "Kami selalu mencari  lebih banyak ulasandari pelanggan kami. Bisakah anda sebarkan pengalaman baik anda di halaman kami?",        {          "choices": [            {              "postback": "Tinggalkan Ulasan",              "text": "Tinggalkan Ulasan",              "type": "button",              "id": 1,              "content_key": "feedback_btn_sectionend1",              "onClick": [                "block_id=120",                "text=btn_sectionend1",                "section=leave_review"              ]            }          ],          "type": "choices"        }      ],      "onLoad": [        "block_id=[blockId]",        "text=txt_sectionend1_title1",        "section=leave_review"      ]    },    {      "id": 110,      "messages": [        "Kami mohon maaf kerna anda alami pengalaman yang buruk. Pengurus Pelanggan kami akan menghubungi kami tidak lama lagi untuk membincangkan bagaimana kami dapat memperbaiki keadaan dengan lebih baik."      ]    }  ]