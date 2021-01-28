define(
    "modules/CCNumberFormatterModule",
    [],
    function() {
        function ccKeyPress(ev) {
            return allowOnlyNumericKeyPress(ev);
        }

        function allowOnlyNumericKeyPress(ev) {
            ev = (window.event ? window.event : ev);
            var iKeyCode = ev.keyCode ? ev.keyCode : ev.which ? ev.which : ev.charCode;
            var allowedNonNumericKeyCodes = [8, 9, 37, 39, 46];
            var isAllowedNonNumericKeyCode = typeof allowedNonNumericKeyCodes.find(function(key) { return key === iKeyCode; }) !== 'undefined';
            var bIsDigit = /^\d$/.test(String.fromCharCode(iKeyCode));

            if (!(bIsDigit || isAllowedNonNumericKeyCode)) {
                if (window.event) {
                    ev.cancelBubble = true;
                    ev.returnValue = false;
                    return false;
                } else {
                    return false;
                }
            }

            return true;
        }

        function ccKeyUp(ev) {
            var inputEl = ev.currentTarget || ev.srcElement;

            if (!inputEl || inputEl.readOnly) {
                return;
            }

            var editInfo = getEditInfo(ev);

            if (!editInfo.hasEditedText()) {
                return;
            }

            var separatedText = get4DigitSeparatedTextFrom(editInfo.originalText);
            inputEl.value = separatedText;

            if (editInfo.isInserting()) {
                var newPosition = editInfo.getCursorPosition();
                inputEl.selectionStart = newPosition;
                inputEl.selectionEnd = inputEl.selectionStart;
            }
        }

        function get4DigitSeparatedTextFrom(source) {
            var textFromInput = source;
            var cleanText = textFromInput.replace(/-/g, '');

            var parts = removeEmptyStringsFromArray(splitInto4DigitsParts(cleanText));

            return parts.join("-");
        }

        function getEditInfo(ev) {
            //On IE 6-8 the event model is different. Event listeners are attached with the non-standard element.attachEvent() method. In this model, the event object has an srcElement property, instead of the target property, and it has the same semantics as event.target.
            var inputEl = ev.currentTarget || ev.srcElement;
            var keyCode = ev.keyCode ? ev.keyCode : ev.which ? ev.which : ev.charCode;
            var char0 = 48, char9 = 57;
            var charNumPad0 = 96, charNumPad9 = 105;
            var isInserting = inputEl.selectionEnd !== inputEl.value.length;

            return {
                start: inputEl.selectionStart,
                originalText: inputEl.value,
                isInserting: function () { return isInserting; },
                isDeleteKey: function () { return keyCode === 46; },
                isBackspaceKey: function () { return keyCode === 8; },
                isCursorAfterDash: function () { return this.start % 5 === 0; },
                isCursorBeforeDash: function () { return (this.start - 4) % 5 === 0; },
                isDigitKeyCode: function () { return (keyCode >= char0 && keyCode <= char9) || (keyCode >= charNumPad0 && keyCode <= charNumPad9); },
                hasEditedText: function () {
                    return this.isDigitKeyCode() || this.isDeleteKey() || this.isBackspaceKey();
                },
                getCursorPosition: function () {
                    return this.start + this.getSupplementaryCursorMove();
                },
                getSupplementaryCursorMove: function () {
                    if (this.isBackspaceKey() && this.isCursorAfterDash()) {
                        return -1;
                    }
                    if (this.isDeleteKey()) {
                        return 0;
                    }
                    if (this.isCursorAfterDash()) {
                        return 1;
                    }
                    return 0;
                }
            };
        }

        function splitInto4DigitsParts(text) {
            var pieces = [];

            var piecesCount = Math.floor(text.length / 4);
            for (var i = 0; i < piecesCount; i++) {
                pieces.push(text.slice((i) * 4, (i + 1) * 4));
            }
            var remainingDigits = text.length % 4;
            pieces.push(text.slice(piecesCount * 4, piecesCount * 4 + remainingDigits));
            return pieces;
        }

        function removeEmptyStringsFromArray(source) {
            for (var j = 0; j < source.length; j++) {
                if (!source[j]) {
                    source.splice(j, 1);
                }
            }
            return source;
        }

        return {
            OnKeyUp: ccKeyUp,
            OnKeyPress: ccKeyPress
        };
    }
);