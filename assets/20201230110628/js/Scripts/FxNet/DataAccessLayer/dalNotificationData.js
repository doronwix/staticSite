var TDALNotificationData = function () {
    function getUpdatedCacheElementsData(url) {
        var ajaxer = new TAjaxer();

        return ajaxer.promises.get("TDALNotificationData/getUpdatedCacheElementsData", url, null, null, null, null, null, null, false);
    }

    return {
        GetUpdatedCacheElementsData: getUpdatedCacheElementsData
    };
};
