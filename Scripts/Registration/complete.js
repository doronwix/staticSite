$(document).ready(
	function () {
	    Complete.init();
	    window.externalEventsCallbacks.fire('registration-success', { saRegistration: Model.SAProcess ? parseInt(Model.SAProcess) : 0, accountNumber: Model.AccountNumber });
	});

var Complete = {
    init: function () {
        this.loadPixel();
        this.setDomEvents();
        this.setRoute();
    },
    enableSubmitButton: function () {
        var submitButton = $('#btnLogin');
        submitButton.removeClass('disabled');
        submitButton.removeAttr('disabled');
    },
    disableSubmitButton: function () {
        var submitButton = $('#btnLogin');
        submitButton.addClass('disabled');
        submitButton.attr('disabled', 'disabled');
    },
    loadPixel: function () {
        var im = new Image();
        jQuery.each(Model.PixelModelList || [], function (index, pxl) {
            if (pxl.Link != '') {
                im.src = pxl.Link;
            }
        });
    },
    setDomEvents: function () {
        var self = this;
        $('#btnLogin').click(function () {
            if ($('#btnLogin').attr('disabled') == 'disabled') {
                return false;
            }  
            self.disableSubmitButton();
            var sessionStorage = StorageFactory(StorageFactory.eStorageType.session);
            sessionStorage.setItem('registrationCompleteLoginButtonClicked', true);

            $('#CompleteForm').submit();

            return false;
        });
    },
    setRoute: function() {
        history.pushState({}, null, window.location.href.split('?')[0]);
    }
};

function PrintIt() {
    window.print();
};