define("viewmodels/common/tool-tip",
    [],
    function () {
        var createViewModel = function (params) {
            var isContainsLink = /<a\s+.*\/{0,1}>/ig.test(params.tooltip);

            return {
                tooltip: params.tooltip,
                id: 'tooltip-' + params.id,
                isContainsLink: isContainsLink
            };
        };

        return {
            createViewModel: createViewModel
        };
    }
);

