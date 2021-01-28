// The module closes the AML/PEP form on the Mobile
// Mobile
//implementation of AmlPepForm.close 
define(
    'currentAppFolder/UILayer/uiBehavior',
    ['managers/historymanager'],
    function (HistoryManager) {
        var closeAmlPepForm = function () {
            HistoryManager.Back();
        };

        return {
            closeAmlPepForm: closeAmlPepForm
        };
    }
);
