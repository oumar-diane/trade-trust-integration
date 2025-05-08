"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRouter = void 0;
const express_1 = __importDefault(require("express"));
const default_document_service_1 = require("../service/default-document-service");
const router = express_1.default.Router();
exports.documentRouter = router;
let documentService = new default_document_service_1.DefaultDocumentService();
// apply transferability action to a document
router.post("/titleEscrow", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const transferabilityResult = yield documentService.getEscrowAddress(body);
            return res.json(transferabilityResult);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
// apply transferability action to a document
router.post("/transferability/:actionName", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { actionName } = req.params;
            const body = req.body;
            const transferabilityResult = yield documentService.applyDocumentTransferabilityAction(body.transferabilityData, body.signedW3CDocument, actionName);
            return res.json(Object.assign({}, transferabilityResult));
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
// verify a signed verifiable credential
router.post("/verification", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { signedW3CDocument } = req.body;
            const verificationFragments = yield documentService.applyVerification(signedW3CDocument);
            return res.json({
                verificationFragments,
            });
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
// issue a verifiable credential
router.post("/:documentId", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { documentId } = req.params;
            documentId = (documentId === null || documentId === void 0 ? void 0 : documentId.toUpperCase()) || '';
            const rawDocument = req.body;
            rawDocument.documentId = documentId;
            const result = yield documentService.createDocument(rawDocument);
            return res.json(result);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
