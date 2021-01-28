var TCreditCardView = function (data) {

    this.paymentID     = data[eCardView.PaymentID];
    this.holderName    = data[eCardView.CardHolderName];
    this.last4         = data[eCardView.Last4];
    this.cardLength    = data[eCardView.CardNumberLength];
    this.expMonth      = data[eCardView.ExpirationMonth];
    this.expYear       = data[eCardView.ExpirationYear];
    this.isDefault     = data[eCardView.IsDefault];
    this.isCVVRequired = data[eCardView.IsCVVRequired];
    this.cardTypeID    = data[eCardView.CardTypeID];
    this.first6        = data[eCardView.First6];
    this.ccGuid        = data[eCardView.CcGuid];
};

