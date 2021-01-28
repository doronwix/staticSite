define(
    'fxnet/uilayer/Modules/HtmlToCanvas',
    ['html2canvas'],
    function (html2canvas) {
        return {
            convert: html2canvas
        };
    }
);
