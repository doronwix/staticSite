define(
    'FxNet/UILayer/ViewModels/UploadDocumentsPopUpsManager',
    [
        'require',
        'handlers/general',
        'Dictionary',
        'enums/alertenums',
        'devicemanagers/AlertsManager',
        'devicemanagers/StatesManager'
    ],
    function (require) {
        var dictionary = require('Dictionary'),
            general = require('handlers/general'),
            alertTypes = require('enums/alertenums'),
            alertsManager = require('devicemanagers/AlertsManager'),
            statesManager = require('devicemanagers/StatesManager'),
            resourceName = 'UploadDocumentsStatusPopUpMessages';

        function UploadDocumentsPopUpsManager() {
            /*
                - Your {document type} document was uploaded successfully.
                Visible to any category except “Other documents”.
                - Your document was uploaded successfully.
                For “Other documents” - the only text that should appear. None of the above should be added to it. 
            */
            function addFirstMessage(messages, documentType) {
                var messageRaw, messageParsed,
                    uploadedDocupentTypeName = general.getKeyByValue(eUploadDocumentType, documentType);

                switch (documentType) {
                    case eUploadDocumentType.OtherDocuments:
                        messageRaw = dictionary.GetItem('doc_load_success', resourceName);

                        if (messageRaw) {
                            messageParsed = messageRaw;
                        }
                        break;

                    default:
                        var document_type_name = dictionary.GetItem('docname_' + uploadedDocupentTypeName, resourceName);

                        messageRaw = dictionary.GetItem('docname_load_success', resourceName);

                        if (messageRaw) {
                            messageParsed = messageRaw.replace('{0}', document_type_name);
                        }
                        break;
                }

                if (messageParsed) {
                    messages.push(messageParsed);
                }
            }

            /*
                Please note {Proof of Residence/Proof of ID) document should be provided as well
                AML<>Approved AND document status = (Not yet received, Incomplete), for either 
                proof of ID/Proof of residence categories, all brokers, 
                for “Browse” buttons of proof of ID AND Proof of residence only.
            */
            function addSecondMessage(messages, documentType) {
                var messageParsed,
                    arrDocumentStates = [eUploadDocumentStatus.Incomplete, eUploadDocumentStatus.AwaitingDocument];

                if ((statesManager.States.AmlStatus() === eAMLStatus.Approved) ||
                    (documentType !== eUploadDocumentType.ProofOfID && documentType !== eUploadDocumentType.ProofOfResidence)) {
                    return;
                }

                if (0 > arrDocumentStates.indexOf(statesManager.States.docProofOfID()) &&
                    0 > arrDocumentStates.indexOf(statesManager.States.docProofOfResidence())) {
                    return;
                }

                var docupentTypeName,
                    document_type,
                    messageRaw = dictionary.GetItem('doc_shuld_be_provided', resourceName)

                if (!messageRaw.trim()) {
                    return;
                }

                switch (documentType) {
                    case eUploadDocumentType.ProofOfID:
                        if (0 <= arrDocumentStates.indexOf(statesManager.States.docProofOfResidence())) {
                            docupentTypeName = general.getKeyByValue(eUploadDocumentType, eUploadDocumentType.ProofOfResidence);
                        }

                        break;

                    case eUploadDocumentType.ProofOfResidence:
                        if (0 <= arrDocumentStates.indexOf(statesManager.States.docProofOfID())) {
                            docupentTypeName = general.getKeyByValue(eUploadDocumentType, eUploadDocumentType.ProofOfID);
                        }

                        break;

                    default:
                        return;
                }

                if (!docupentTypeName) {
                    return;
                }

                document_type = dictionary.GetItem('docname_' + docupentTypeName, resourceName);

                messageParsed = messageRaw.replace('{0}', document_type);

                if (messageParsed) {
                    messages.push(messageParsed);
                }
            }

            /*
                You will be notified as soon as we have reviewed your document.
                AML<>Approved, BR3 + BR33, for “Browse” buttons of proof of ID AND Proof of residence only
            */
            function addThirdMessage(messages, documentType) {
                if ((statesManager.States.AmlStatus() === eAMLStatus.Approved) ||
                    (documentType !== eUploadDocumentType.ProofOfID && documentType !== eUploadDocumentType.ProofOfResidence)) {
                    return;
                }

                /* 'You will be notified as soon as we have reviewed your document.'*/
                var messageRaw = dictionary.GetItem('notify_when_doc_reviewed', resourceName);

                if (messageRaw.trim()) {
                    messages.push(messageRaw);
                }
            }

            function parseMessagesFor(documentType) {
                var title,
                    messages = [];

                addFirstMessage(messages, documentType);
                addSecondMessage(messages, documentType);
                addThirdMessage(messages, documentType);

                title = dictionary.GetItem('popup_title', resourceName);

                return {
                    title: title,
                    messages: messages
                };
            }

            function showPopUp(documentType, customMessage) {
                var popUpData = parseMessagesFor(documentType);

                if (!general.isEmptyValue(customMessage)) {
                    popUpData.messages.push(customMessage);
                }

                if (popUpData.messages.length > 0) {
                    var props = {
                        theme: 'alerts-white-theme alerts-no-close-x spaced-list'
                    };

                    alertsManager.UpdateAlert(alertTypes.GeneralOkAlert, popUpData.title, popUpData.body, popUpData.messages, props);
                    alertsManager.PopAlert(alertTypes.GeneralOkAlert);
                }
            }

            return {
                showPopUp: showPopUp
            };
        }

        return new UploadDocumentsPopUpsManager();
    }
);