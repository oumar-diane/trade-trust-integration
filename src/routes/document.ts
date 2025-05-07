import express from "express";
import {SignedVerifiableCredential,} from "@trustvc/trustvc";
import {DefaultDocumentService} from "../service/default-document-service";
import {DocumentModel, DocumentTransferabilityModel, TransferabilityActions} from "../model/document-model";

const router = express.Router();


let documentService = new DefaultDocumentService()

// apply transferability action to a document
router.post("/titleEscrow", async function(req, res, next) {
    try {
        const body = req.body as SignedVerifiableCredential;
        console.log("body", body);
        const transferabilityResult = await documentService.getTitleEscrowAddress(body);

        return res.json({
            ...transferabilityResult,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
})

// apply transferability action to a document
router.post("/transferability/:actionName", async function(req, res, next) {
    try {
        let { actionName } = req.params;
        const body = req.body as { signedW3CDocument: SignedVerifiableCredential, transferabilityData: DocumentTransferabilityModel };
        const transferabilityResult = await documentService.applyDocumentTransferabilityAction(body.transferabilityData, body.signedW3CDocument, actionName as TransferabilityActions);

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

// issue a verifiable credential
router.post("/:documentId", async function(req, res, next) {
    try {
        let { documentId } = req.params;
        documentId = documentId?.toUpperCase() || '';

        const rawDocument = req.body as DocumentModel;
        rawDocument.documentId = documentId;

        const result = await documentService.createDocument(rawDocument)

        return res.json(result);

    } catch (error) {
        console.error(error);
        next(error);
    }
});




export { router as documentRouter };