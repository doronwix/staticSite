define(
    'viewmodels/CustomDropDown',    
    ['handlers/general',],
    function(general) {
        function CustomDropDownModelFactory(params) {
            var value = params.value;

            if (general.isEmptyValue(value())) {
                value(params.options()[0]);
            }

            return {
                options: params.options,
                value: value,
                optionText: params.optionText,
                cssClass: params.cssClass || 'light'
            };
        }

        return {
            viewModel: {
                createViewModel: CustomDropDownModelFactory
            }
        };
    }
);