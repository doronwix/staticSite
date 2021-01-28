var TDALTutorials = function (ErrorManager, general) {
    //load tutorials
    var loadTutorials = function (params, onLoadComplete) {
        var ajaxer = new TAjaxer();
        params = params || {};
        ajaxer.post(
            "TutorialsViewModel/getTutorials",
            "Handlers/Tutorials/Tutorials.ashx?methodName=GetTutorials",
            general.urlEncode(params),
            onLoadComplete,
            function () {
                ErrorManager.onError("dalTutorials/loadTutorials", "", eErrorSeverity.medium);
            },
            0
        );
    };
    return {
        LoadTutorials: loadTutorials
    };
};