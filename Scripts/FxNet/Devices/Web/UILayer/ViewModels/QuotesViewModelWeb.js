/* global General */
var QuotesViewModel = General.extendClass(QuotesViewModel, function QuotesViewModelWebClass(dialog, accountMarket) {
    return {
        getDialogPos: {
            dialogPosition: dialog.dialogPosition,
            parentIsCollapsed: accountMarket.IsCollapsed,
            parentTopElement: eRefDomElementsIds.newDealRefParentTopElement,
            topOffset: -3,
            parentLeftElement: '#QuotesTable .ask-column',
            leftOffset: -70,
            RTLoffset: 10
        }
    };
});