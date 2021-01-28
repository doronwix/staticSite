define("deviceviewmodels/deposit/wiretransfercommentsviewmodel", [
    'require',
    'knockout',
    'handlers/general',
    'Dictionary',
    'helpers/KoComponentViewModel',
    'LoadDictionaryContent!DepositBackOffice'
],
function (require) {
    var ko = require("knockout"),
        general = require('handlers/general'),
        Dictionary = require("Dictionary"),
        KoComponentViewModel = require('helpers/KoComponentViewModel');

    var WireTransferCommentsViewModel = general.extendClass(KoComponentViewModel, function WireTransferCommentsViewModelClass(params) {
        var self = this,
            parent = this.parent, // inherited from KoComponentViewModel
            data = this.Data, // inherited from KoComponentViewModel
            prefixKey = 'wireTransferComment_';

        var init = function () {
            parent.init.call(self); // inherited from KoComponentViewModel
            setObservables();
            populateCommentsList();
        };

        function setObservables() {
            data.selectedComment = params.comment;
            data.comments = ko.observableArray();
        }

        function populateCommentsList() {
            var index = 0;
            while (!Dictionary.ValueIsEmpty(prefixKey + index, 'DepositBackOffice')) {
                var comment = Dictionary.GetItem(prefixKey + index, 'DepositBackOffice');
                data.comments.push(comment);
                index++;
            }
        }

        return {
            init: init,
            Data: data
        };
    });

    var createViewModel = function (params) {
        var viewModel = new WireTransferCommentsViewModel(params);

        viewModel.init();

        return viewModel;
    };

    return {
        viewModel: { createViewModel: createViewModel }
    };
});