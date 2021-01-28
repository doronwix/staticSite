var PaymentTypeModel = function (paymentDetails) {
    var self = this;
    self.showUI = true;
    self.userControl = null;
    self.imgCssClassName = 'imgClassName_' + paymentDetails.methodId;

    self.methodID = paymentDetails.methodId;
    self.hasImage = paymentDetails.hasImage;
    self.hasAppendImage = paymentDetails.hasAppendImage;
    self.helpLink = paymentDetails.helpLinkDictionaryItem ? Dictionary.GetItem(paymentDetails.helpLinkDictionaryItem) : '';
    self.hasLeftSideText = paymentDetails.hasLeftSideText;
    self.hasRightSideText = paymentDetails.hasRightSideText;
    self.text = paymentDetails.text ? Dictionary.GetItem(paymentDetails.text) : '';
    self.order = parseInt(paymentDetails.order);
};
