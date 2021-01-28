// The module closes the AML/PEP form on the WEB
// web
//implementation of AmlPepForm.close 
define(
    'currentAppFolder/UILayer/uiBehavior',
    [
        'require',
        'viewmodels/dialogs/DialogViewModel'
    ],
    function (require) {
        var DialogViewModel = require('viewmodels/dialogs/DialogViewModel');

        var closeAmlPepForm = function () {
            DialogViewModel.close();
        };

        return {
            closeAmlPepForm: closeAmlPepForm
        };
    }
);
