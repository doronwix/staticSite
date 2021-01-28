define(
    'deposit/CreditCard/CreditCardTypesManager',
    [],
    function () {
        var ccTypesImages = {};

        function init() {
            ccTypesImages[eDepositCreditCardType.AmericanExpress] = ["american_express.svg"];
            ccTypesImages[eDepositCreditCardType.Diners] = ["diners.svg"];
            ccTypesImages[eDepositCreditCardType.Discover] = ["discover.svg"];
            ccTypesImages[eDepositCreditCardType.Jcb] = ["jcb.svg"];
            ccTypesImages[eDepositCreditCardType.Mastercard] = ["mastercard.svg"];
            ccTypesImages[eDepositCreditCardType.Maestro] = ["maestro.svg"];
            ccTypesImages[eDepositCreditCardType.Switch] = ["switch.svg"];
            ccTypesImages[eDepositCreditCardType.Visa] = ["visa.svg", "delta.svg"];
            ccTypesImages[eDepositCreditCardType.CUP] = ["cup-card.svg"];
        }

        init();

        return {
            Images: ccTypesImages
        };
    }
);