/* globals  TCreditCard, TCreditCardView */
var TCreditCardManager = function (ko, observableHashTable, hashTable) {
    var defaultUsedCard = {};
    var usedCards = new hashTable();
    var creditCardsType = new observableHashTable(ko, "typeID", "orderID");
    var ccTypesWithImages = [];

    ccTypesWithImages[2] = { images: ['diners-logo.gif'] };
    ccTypesWithImages[1] = { images: ['american-express-logo.gif'] };
    ccTypesWithImages[13] = { images: ['visa-logo.gif', 'Visa_Electron logo.gif'] };
    ccTypesWithImages[22] = { images: ['qiwi.gif'], langId: 7 };
    ccTypesWithImages[7] = { images: ['master-card-logo.gif'] };
    ccTypesWithImages[8] = { images: ['maestro_logo.gif'] };

    function loadData(data) {
        setCardsTypes(data.CreditCards, data.ImagePath);
        setUsedCards(data.UsedCards);
    }

    function setCardsTypes(data, imagePath) {
        creditCardsType.Clear();

        if (data) {
            for (var i = 0, ii = data.length; i < ii; i++) {
                var ccData = new TCreditCard(data[i]);

                if (ccTypesWithImages[ccData.typeID]) {
                    ccData.images = ccTypesWithImages[ccData.typeID].images.slice();
                    for (var index = 0; index < ccData.images.length; index++) {
                        ccData.images[index] = imagePath + ccData.images[index];
                    }
                }
                creditCardsType.Add(ccData);
            }
        }
    }

    function setUsedCards(data) {
        usedCards.Clear();

        if (data) {
            for (var i = 0, ii = data.length; i < ii; i++) {
                usedCards.SetItem(data[i][eCardView.PaymentID], new TCreditCardView(data[i]));
                usedCards.Container[(data[i][eCardView.PaymentID])].D3SecureStatus = creditCardsType.Get(data[i][eCardView.CardTypeID]).D3SecureStatus;

                if (data[i][eCardView.IsDefault]) {

                    defaultUsedCard.value = data[i][eCardView.PaymentID];
                }
            }
        }
    }

    function setUsedCardAsDefault(paymentID) {
        defaultUsedCard.value = paymentID;
    }

    function removeUsedCard(paymentID) {
        if (paymentID == defaultUsedCard) {
            defaultUsedCard.value = -1;
        }
    }

    function hasData() {
        return creditCardsType.HasItems() || usedCards.hasItems();
    }

    return {
        usedCards: usedCards,
        creditCardsType: creditCardsType,
        defaultUsedCard: defaultUsedCard,
        setUsedCardAsDefault: setUsedCardAsDefault,
        removeUsedCard: removeUsedCard,
        loadData: loadData,
        hasData: hasData
    };
};
