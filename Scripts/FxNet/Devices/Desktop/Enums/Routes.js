define(
    'customEnums/routes',
    [
        'customEnums/ViewsEnums',
        'enums/enums',
    ],
    function () {
        return {
            Withdrawal: {
                Form: {
                    Value: eForms.Withdrawal
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
            ViewAndPrintWithdrawal: {
                Form: {
                    Value: eForms.ViewAndPrintWithdrawal
                }
            },
            UploadDocuments: {
                Form: {
                    Value: eForms.UploadDocuments
                }
            },
            PersonalDetails: {
                Form: {
                    Value: eForms.PersonalDetails
                }
            },
            ThirdParty: {
                Form: {
                    Value: eForms.ThirdParty
                }
            },
            AmlStatus: {
                Form: {
                    Value: eForms.AmlStatus
                }
            },
            Deposit: {
                Form: {
                    Value: eForms.Deposit
                }
            },
            RegularWireTransfer: {
                Form: {
                    Value: eForms.RegularWireTransfer
                }
            },
            MissingCustomerInformation: {
                Form: {
                    Value: eForms.MissingCustomerInformation
                }
            },
            CashBack: {
                Form: {
                    Value: eForms.CashBack
                }
            },
            WithdrawalAutomation: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.WithdrawalAutomation
                },
                Parameters: {
                    id: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.Integer
                    }
                }
            },
            ForcedDeposit: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.ForcedDeposit
                }
            },
            WireTransfers: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.WireTransfers
                },
                Parameters: {
                    id: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.Integer
                    }
                }
            },
            NewApproveWireTransfer: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.NewApproveWireTransfer
                }
            },
            WithdrawalProcess: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.WithdrawalProcess
                },
                Parameters: {
                    id: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.Integer
                    }
                }
            },
            ConvertBalance: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.ConvertBalance
                },
                Parameters: {
                    id: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.Integer
                    }
                }
            },
            ConvertAccountLine: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.ConvertAccountLine
                },
                Parameters: {
                    id: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.Integer
                    }
                }
            },
            GeneralAccountActions: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.GeneralAccountActions
                }
            },
            FixPosition: {
                PassParametersToViews: true,
                Form: {
                    Value: eForms.FixPosition
                },
                Parameters: {
                    id: {
                        ValueFromRequest: true,
                        Type: eDeepLinkParameterType.Integer
                    }
                }
            }
        };
    }
);
