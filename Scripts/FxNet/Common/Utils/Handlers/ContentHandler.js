var ContentHandler = (function ContentHandler() { 

    var linkToReplace = 'href="ComplianceDocument.aspx"';
    
    var navigation = function () { $viewModelsManager.VManager.SwitchViewVisible(eForms.UploadDocuments, {}); };
    
    var koBindingToUseAsNavigation = String.format('href="#" data-bind="click: {0}" ', navigation.toString());

    var replaceComplianceDocumentLink = function(oldContent) {
        return oldContent.replaceAll(linkToReplace, koBindingToUseAsNavigation);
    };

    return {
        replaceComplianceDocumentLink: replaceComplianceDocumentLink
    };
}());

define('handlers/ContentHandler', function () { return ContentHandler });