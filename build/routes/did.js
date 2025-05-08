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
exports.didRouter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const default_did_service_1 = require("../service/default-did-service");
const router = express_1.default.Router();
exports.didRouter = router;
const didService = new default_did_service_1.DefaultDidService();
// server did document in internet using ngrok in development mode
router.get("/did.json", function (req, res, next) {
    try {
        const didJsonPath = path_1.default.join(__dirname, "../../did.json");
        const didJson = fs_1.default.readFileSync(didJsonPath, "utf-8");
        res.json(JSON.parse(didJson));
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
// generate a new did from user domain
router.post("/:domain", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { domain } = req.params;
            const result = yield didService.generateDid(domain);
            res.json(result);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
