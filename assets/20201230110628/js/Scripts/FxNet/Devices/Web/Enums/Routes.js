define(
    'customEnums/routes',
    [
        'handlers/general',
        'customEnums/ViewsEnums',
        'enums/enums'
    ],
    function (general) {
        return {
            LoginOptions: {
                Form: {
                    Value: eForms.Deals
                }
            },
            Deals: {
                Form: {
                    Value: eForms.Deals
                }
            },
            OpenDeals: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Deals
                },
                Parameters: {
                    selectedTab: {
                        Value: eViewTypes.vOpenDeals
                    }
                }
            },
            Limits: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Deals
                },
                Parameters: {
                    selectedTab: {
                        Value: eViewTypes.vLimits
                    }
                }
            },
            ClosedDeals: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Deals
                },
                Parameters: {
                    selectedTab: {
                        Value: eViewTypes.vClosedDeals
                    }
                }
            },
            Questionnaire: {
                Form: {
                    Value: eForms.ClientQuestionnaire
                }
            },
            ClientQuestionnaire: {
                Form: {
                    Value: eForms.ClientQuestionnaire
                }
            },
            Wallet: {
                Form: {
                    Value: eForms.Deals
                },
                Actions: ['devicecustomdeeplinks/AccountSummaryAdvancedViewActionHandler']
            },
            NewDeal: {
                Form: {
                    DefaultValue: eForms.Deals,
                    ValueFromRequest: true,
                    AllowOnlyFormsContainingView: eViewTypes.vToolBar,
                    Type: eDeepLinkParameterType.Form
                },
                Actions: ['devicecustomdeeplinks/NewDealActionHandler'],
                Parameters: {
                    instrumentId: {
                        ValueFromRequest: true,
                        DefaultValue: 3631,
                        Type: eDeepLinkParameterType.Instrument
                    },
                    tab: {
                        ValueFromRequest: true,
                        Optional: true,
                        Type: eDeepLinkParameterType.Tab
                    },
                    orderDir: {
                        ValueFromRequest: true,
                        Optional: true,
                        Type: eDeepLinkParameterType.OrderDir
                    }
                }
            },
            NewLimit: {
                Form: {
                    DefaultValue: eForms.Deals,
                    ValueFromRequest: true,
                    AllowOnlyFormsContainingView: eViewTypes.vToolBar,
                    Type: eDeepLinkParameterType.Form
                },
                Actions: ['devicecustomdeeplinks/NewLimitActionHandler'],
                Parameters: {
                    instrumentId: {
                        ValueFromRequest: true,
                        DefaultValue: 3631,
                        Type: eDeepLinkParameterType.Instrument
                    },
                    tab: {
                        ValueFromRequest: true,
                        Optional: true,
                        Type: eDeepLinkParameterType.Tab
                    },
                    orderDir: {
                        ValueFromRequest: true,
                        Optional: true,
                        Type: eDeepLinkParameterType.OrderDir
                    }
                }
            },
            Balance: {
                Form: {
                    Value: eForms.Statement
                }
            },
            NetExposure: {
                Form: {
                    Value: eForms.Deals
                },
                Actions: ['devicecustomdeeplinks/AccountSummaryAdvancedViewActionHandler', 'devicecustomdeeplinks/NetExposureActionHandler']
            },
            Withdrawal: {
                Form: {
                    Value: eForms.Withdrawal
                }
            },
            CustomizeQuotes: {
                Form: {
                    Value: eForms.Deals
                },
                Actions: ['devicecustomdeeplinks/FavoriteInstrumentsActionHandler']
            },
            Deposit: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Deposit
                },
                Actions: ['devicecustomdeeplinks/DepositActionHandler'],
                Parameters: {
                    payment: {
                        ValueFromRequest: true,
                        Optional: true,
                        Type: eDeepLinkParameterType.String
                    },
                }
            },
            ChangePassword: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Settings
                },
                Parameters: {
                    viewArgs: {
                        Value: eViewTypes.vChangePassword,
                        Type: eDeepLinkParameterType.View
                    }
                },
                Actions: ['deepLinks/SettingsActionHandler']
            },
            PendingWithdrawal: {
                Form: {
                    Value: eForms.PendingWithdrawal
                }
            },
            UploadDocuments: {
                Form: {
                    Value: eForms.UploadDocuments
                }
            },
            TradingSignals: {
                Form: {
                    Value: eForms.TradingSignals
                }
            },
            EconomicCalendar: {
                Form: {
                    Value: eForms.Deals
                },
                Actions: ['devicecustomdeeplinks/NewDealActionHandler'],
                Parameters: {
                    tab: {
                        Value: eNewDealTool.EconomicCalendar
                    }
                }
            },
            CashBack: {
                Form: {
                    Value: eForms.Deals
                },
                Actions: ['devicecustomdeeplinks/AccountSummaryAdvancedViewActionHandler', 'devicecustomdeeplinks/CashBackActionHandler']
            },
            Settings: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Settings
                },
                Parameters: {
                    view: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.SettingsView
                    }
                },
                Actions: ['deepLinks/SettingsActionHandler']
            },
            NotificationsSettings: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Settings
                },
                Parameters: {
                    view: {
                        DefaultValue: eSettingsViews.NotificationsSettings,
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.SettingsView
                    }
                },
                Actions: ['deepLinks/SettingsActionHandler']
            },
            PersonalInformation: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Settings
                },
                Parameters: {
                    view: {
                        DefaultValue: eSettingsViews.PersonalInformation,
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.SettingsView
                    }
                },
                Actions: ['deepLinks/SettingsActionHandler']
            },
            DepositConfirmation: {
                Form: {
                    Value: eForms.UploadDocuments
                },
                Actions: ['devicecustomdeeplinks/DepositConfirmationActionHandler']
            },
            Tutorials: {
                Form: {
                    Value: eForms.Tutorials
                }
            },
            EducationalTutorials: {
                Form: {
                    Value: eForms.EducationalTutorials
                }
            }
        };
    }
);