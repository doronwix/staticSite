define(
    'modules/Printer',
    [
        'Q'
    ],
    function (Q) {
        var iframeElementData = {
                name: "fx-printIFrame",
                inUse: false
            },
            printDefer;

        function onAfterPrint() {
            var iframeElement = document.getElementById(iframeElementData.name);

            iframeElement.contentWindow.removeEventListener('afterprint', onAfterPrint, true);

            iframeElementData.inUse = false;
            printDefer.resolve('print done');
        }

        function prepareIframe() {
            var iframeElement = document.getElementById(iframeElementData.name);

            if (!iframeElement) {
                iframeElement = document.createElement("iframe");
                iframeElement.name = iframeElementData.name;
                iframeElement.id = iframeElementData.name;
                iframeElement.style.position = "absolute";
                iframeElement.style.top = "-9000px";

                document.body.appendChild(iframeElement);
            }
        }

        function writeToIframe(data) {
            var iframeElement = document.getElementById(iframeElementData.name),
                ifrDocument = iframeElement.contentWindow.document,
                style = getStyles(),
                script = "<script>"
                    + "\nstylesCount=" + style.count + ";"
                    + "\nfunction tryPrint(){"
                    + "\nif(--stylesCount<=0){"
                    + "\nsetTimeout(window.print, 1000)"
                    + "}"
                    + "};</script>";

            ifrDocument.open();
            ifrDocument.write(script + "\n" + style.styles + "\n" + data);
            ifrDocument.close();

            iframeElement.contentWindow.addEventListener('afterprint', onAfterPrint, true);
        }

        function getStyles() {
            var sStyles = "",
                count = 0;

            Array.prototype.forEach.call(document.styleSheets,
                function (styleSheet) {
                    if (!styleSheet.disabled) {
                        var styleSheetClone = styleSheet.ownerNode.cloneNode(true);
                        if (styleSheetClone.tagName === "LINK" && styleSheetClone.href) {
                            count++;
                            styleSheetClone.href = styleSheetClone.href.replace('dark', 'light');
                            sStyles += '<link rel="stylesheet" type="text/css" href="' + styleSheetClone.href + '" onload="tryPrint()">';
                        }
                    }
                });
            return { styles: sStyles, count: count };
        }

        function print(data) {
            if (iframeElementData.inUse) {
                return printDefer.promise;
            }

            iframeElementData.inUse = true;
            printDefer = Q.defer();
            printDefer.promise
                .timeout(30000, "print aborted")
                .fail(onAfterPrint);

            setTimeout(function () {
                prepareIframe();

                writeToIframe(data);
            }, 0);

            return printDefer.promise;
        }

        return {
            print: print
        }
    })