import {DocumentsToVerify, SignedVerifiableCredential, SUPPORTED_CHAINS, VerificationFragment} from "@trustvc/trustvc";
import {DocumentModel, DocumentTransferabilityModel, TransferabilityActions} from "../../model/document-model";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import {DocumentDTO} from "../../service/interface/storage-manager-service";


/**
 * service for issuing, managing transferability and verifying documents
 * **/
export interface DocumentService{
    /**
     * Create and issue a verifiable credential .
     * @param document - The document to issue.
     * @returns A promise the signed verifiable credential or undefined otherwise.
     */
    createDocument(document: DocumentModel): Promise<TransactionRequest>;
    /**
     * Verify a signed verifiable credential.
     * @param signedW3CDocument - The signed verifiable credential to verify.
     * @returns A promise that resolves to an array of verification fragments.
     */
    applyVerification(signedW3CDocument:  DocumentsToVerify | SignedVerifiableCredential): Promise<VerificationFragment[]>;
    /**
     * Apply a transferability action to a document.
     * @param transferabilityData - The transferability data for the document.
     * @param vc - The signed verifiable credential to apply the action to.
     * @param action - The transferability action to apply.
     * @returns A promise that resolves to an object containing transferability action transaction.
     */
    applyDocumentTransferabilityAction(transferabilityData:DocumentTransferabilityModel, action:TransferabilityActions):Promise<TransactionRequest>;
    /**
     * get title escrow address.
     * @param vc - The signed verifiable credential to apply the action to.
     * @returns A promise that resolves to the titleEscrow address request transaction.
     */
    getEscrowAddress(vc:SignedVerifiableCredential):Promise<{address:string}|undefined>;
    /**
     * issue document after validation to document store.
     * @param organizationId - The organization id.
     * @param name - document name.
     * @param vc - The signed verifiable credential to apply the action to.
     */
    issueDocument(organizationId:string, name:string ,vc:SignedVerifiableCredential):Promise<void>;
    /**
     * get a document after validation to document store.
     * @param organizationId - The organization id.
     * @param documentId - id of the document.
     * @returns A promise that resolves to the titleEscrow address request transaction.
     */
    getDocuments(organizationId:string, documentId:string):Promise<DocumentDTO[]>;
}

const SUPPORTED_DOCUMENT: {
    [key: string]: string;
} = {
    BILL_OF_LADING: "https://schemata.openattestation.com/io/tradetrust/bill-of-lading/1.0/bill-of-lading-context.json",
    INVOICE: "https://schemata.openattestation.com/io/tradetrust/invoice/1.0/invoice-context.json",
    CERTIFICATE_OF_ORIGIN: "https://schemata.openattestation.com/io/tradetrust/certificate-of-origin/1.0/certificate-of-origin-context.json"
};

export function getDocumentSchema(documentModel: DocumentModel) {
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/security/bbs/v1",
            "https://trustvc.io/context/transferable-records-context.json",
            "https://trustvc.io/context/render-method-context.json",
            "https://trustvc.io/context/attachments-context.json",
            SUPPORTED_DOCUMENT[documentModel.documentId!],
        ],
        type: ["VerifiableCredential"],
        "credentialStatus": {
            "type": "TransferableRecords",
            "tokenNetwork": {
                "chain": SUPPORTED_CHAINS[documentModel.chainId!].currency,
                "chainId": documentModel.chainId!
            },
            "tokenRegistry": documentModel.tokenRegistryAddress!,
        },
        "renderMethod": [
            {
                "id": "https://generic-templates.tradetrust.io",
                "type": "EMBEDDED_RENDERER",
                "templateName": documentModel.documentId
            }
        ],
        credentialSubject:documentModel.credentialSubject,
        "issuanceDate": documentModel.issuanceDate!,
        "expirationDate": documentModel.expirationDate!,
        "issuer": documentModel.didKeyPairs.id?.split('#')?.[0],
    }
}

export {SUPPORTED_DOCUMENT}