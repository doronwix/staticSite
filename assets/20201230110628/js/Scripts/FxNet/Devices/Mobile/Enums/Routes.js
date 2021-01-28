define(
    'customEnums/routes',
    [
        'customEnums/ViewsEnums',
        'enums/enums'
    ],
    function () {
        return {
            LoginOptions: {
                Form: {
                    Value: eForms.AccountPreferences
                },
                Parameters: {
                    option: {
                        ValueFromRequest: true,
                        Optional: true,
                        Type: eDeepLinkParameterType.LoginOption
                    }
                },
                PassParametersToViews: true
            },
            Deals: {
                Form: {
                    Value: eForms.Quotes
                }
            },
            OpenDeals: {
                Form: {
                    Value: eForms.OpenDeals
                }
            },
            Limits: {
                Form: {
                    Value: eForms.Limits
                }
            },
            ClosedDeals: {
                Form: {
                    Value: eForms.ClosedDeals
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
                    Value: eForms.Wallet
                }
            },
            NewDeal: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Transaction
                },
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
                    },
                    transactionTab: {
                        Value: 'NewDeal'
                    }
                }
            },
            NewLimit: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Transaction
                },
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
                    },
                    transactionTab: {
                        Value: 'NewLimit'
                    }
                }
            },
            Balance: {
                Form: {
                    Value: eForms.Balance
                }
            },
            NetExposure: {
                Form: {
                    Value: eForms.NetExposure
                }
            },
            Withdrawal: {
                Form: {
                    Value: eForms.Withdrawal
                }
            },
            CustomizeQuotes: {
                Form: {
                    Value: eForms.EditFavoriteInstruments
                }
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
                Form: {
                    Value: eForms.ChangePassword
                }
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
                    Value: eForms.EconomicCalendar
                }
            },
            CashBack: {
                Form: {
                    Value: eForms.CashBack
                }
            },
            Settings: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.Quotes
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
                Form: {
                    Value: eForms.NotificationsSettings
                }
            },
            PersonalInformation: {
                Form: {
                    Value: eForms.PersonalInformation
                }
            },
            DepositConfirmation: {
                Form: {
                    Value: eForms.UploadDocuments
                },
                Actions: ['devicecustomdeeplinks/DepositConfirmationActionHandler']
            },
            Tutorials: {
                Form: {
                    Value: eForms.EducationalTutorials
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
