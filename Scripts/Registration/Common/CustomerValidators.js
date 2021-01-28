function CustomerValidators() {
    var blacklist = [],
        validationMethods = {
            passwordnotinblacklist: 'passwordnotinblacklist',
            passwordnotcustomerfullname: 'passwordnotcustomerfullname'
        };

    function addValidationBlackList() {
        $.validator.unobtrusive.adapters.add(validationMethods.passwordnotinblacklist, ["param"],
            function (options) {
                options.rules[validationMethods.passwordnotinblacklist] = true;
                options.messages[validationMethods.passwordnotinblacklist] = options.message;
            }
        );

        $.validator.addMethod(validationMethods.passwordnotinblacklist,
            function (value) {
                if (!blacklist || !blacklist.length) {
                    return true;
                }
                return blacklist.indexOf(value) === -1;
            }
        );

        $.get(
            getBlackListUrl()
        ).then(function (response) {
            if (Array.isArray(response)) {
                blacklist = response;
            }
        })
        .done();
    }

    function getBlackListUrl() {
        var blacklistUrl = "";

        if (UrlResolver.getAssetsPath) {
            blacklistUrl = UrlResolver.combine(
                UrlResolver.getAssetsPath(),
                "Account",
                "PasswordsBlacklist.js"
            );
        } else {
            var version = UrlResolver.getVersion();

            if (version) {
                blacklistUrl = Model.CdnPath + Model.jsVirtualPath + '/assets/' + version + '/Account/PasswordsBlacklist.js';
            } else {
                blacklistUrl = Model.jsVirtualPath + '/Account/PasswordsBlacklist';
            }
        } 

        return blacklistUrl;
    }

    function addValidationCustomerFullName() {
        if (!window.$customer) {
            return;
        }

        customer = window.$customer;

        var customerData = {
            firstName: customer.prop.firstName,
            lastName: customer.prop.lastName,
            combinations: [
                customer.prop.firstName + customer.prop.lastName,
                customer.prop.firstName + " " + customer.prop.lastName,
                customer.prop.lastName + customer.prop.firstName,
                customer.prop.lastName + " " + customer.prop.firstName
            ]
        };

        $.validator.unobtrusive.adapters.add(validationMethods.passwordnotcustomerfullname, ["param"],
            function (options) {
                options.rules[validationMethods.passwordnotcustomerfullname] = true;
                options.messages[validationMethods.passwordnotcustomerfullname] = options.message;
            }
        );

        $.validator.addMethod(validationMethods.passwordnotcustomerfullname,
            function (value) {
                return (value !== customerData.firstName && value !== customerData.lastName && customerData.combinations.indexOf(value) === -1)
            }
        );
    }

    return {
        addValidationBlackList: addValidationBlackList,
        addValidationCustomerFullName: addValidationCustomerFullName
    };
}