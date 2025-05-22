import express from "express";
import {SignedVerifiableCredential,} from "@trustvc/trustvc";
import {DefaultDocumentService} from "../service/default-document-service";
import {DocumentModel, DocumentTransferabilityModel, TransferabilityActions} from "../model/document-model";
import {AzureDocumentStorageService} from "../service/azure-document-storage-service";

const router = express.Router();

const documentStoreService = new AzureDocumentStorageService()
let documentService = new DefaultDocumentService(documentStoreService)

// retrieve issued documents by token registry
router.get("/", async function(req, res, next) {
    try {
        const {organizationId} = req.query;
        const transferabilityResult = await documentService.getDocuments(organizationId as string);
        return res.json(transferabilityResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
})



// apply transferability action to a document
router.post("/transferability/:actionName", async function(req, res, next) {
    try {
        let { actionName } = req.params;
        const body = req.body as  DocumentTransferabilityModel;
        const transferabilityResult = await documentService.applyDocumentTransferabilityAction(body, actionName as TransferabilityActions);

        return res.json({
            ...transferabilityResult,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
})

// verify a signed verifiable credential
router.post("/verification", async function(req, res, next) {
    try {
        const { signedW3CDocument } = req.body as { signedW3CDocument: SignedVerifiableCredential };
        const verificationFragments = await documentService.applyVerification(signedW3CDocument);

        return res.json({
            verificationFragments,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
})

// create a verifiable record document
router.post("/:documentId", async function(req, res, next) {
    try {
        let { documentId } = req.params;
        documentId = documentId?.toUpperCase() || '';

        const rawDocument = req.body as DocumentModel;
        console.log("body: ", rawDocument)
        rawDocument.documentId = documentId;

        const result = await documentService.createDocument(rawDocument)

        return res.json(result);

    } catch (error) {
        console.error(error);
        next(error);
    }
});

// issue a verifiable record document
router.post("/", async function(req, res, next) {
    try {
        const {organizationId} = req.query;
        const rawDocument = req.body as {name:string, signedW3CDocument:SignedVerifiableCredential};
        console.log("body: ", rawDocument)
        await documentService.issueDocument(organizationId as string, rawDocument.name , rawDocument.signedW3CDocument)
        return res.status(200).json();
    } catch (error) {
        console.error(error);
        next(error);
    }
});




export { router as documentRouter };