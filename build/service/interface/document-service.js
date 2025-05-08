"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_DOCUMENT = void 0;
exports.getDocumentSchema = getDocumentSchema;
const trustvc_1 = require("@trustvc/trustvc");
const SUPPORTED_DOCUMENT = {
    BILL_OF_LADING: "https://schemata.openattestation.com/io/tradetrust/bill-of-lading/1.0/bill-of-lading-context.json",
    INVOICE: "https://schemata.openattestation.com/io/tradetrust/invoice/1.0/invoice-context.json",
    CERTIFICATE_OF_ORIGIN: "https://schemata.openattestation.com/io/tradetrust/certificate-of-origin/1.0/certificate-of-origin-context.json"
};
exports.SUPPORTED_DOCUMENT = SUPPORTED_DOCUMENT;
function getDocumentSchema(documentModel) {
    var _a, _b;
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/security/bbs/v1",
            "https://trustvc.io/context/transferable-records-context.json",
            "https://trustvc.io/context/render-method-context.json",
            "https://trustvc.io/context/attachments-context.json",
            SUPPORTED_DOCUMENT[documentModel.documentId],
        ],
        type: ["VerifiableCredential"],
        "credentialStatus": {
            "type": "TransferableRecords",
            "tokenNetwork": {
                "chain": trustvc_1.SUPPORTED_CHAINS[documentModel.chainId].currency,
                "chainId": documentModel.chainId
            },
            "tokenRegistry": documentModel.tokenRegistryAddress,
        },
        "renderMethod": [
            {
                "id": "https://generic-templates.tradetrust.io",
                "type": "EMBEDDED_RENDERER",
                "templateName": documentModel.documentId
            }
        ],
        credentialSubject: documentModel.credentialSubject,
        "issuanceDate": documentModel.issuanceDate,
        "expirationDate": documentModel.expirationDate,
        "issuer": (_b = (_a = documentModel.didKeyPairs.id) === null || _a === void 0 ? void 0 : _a.split('#')) === null || _b === void 0 ? void 0 : _b[0],
    };
}
