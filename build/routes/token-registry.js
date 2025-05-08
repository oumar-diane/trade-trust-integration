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
exports.tokenRegistryRouter = void 0;
const express_1 = __importDefault(require("express"));
const default_token_registry_service_1 = require("../service/default-token-registry-service");
const router = express_1.default.Router();
exports.tokenRegistryRouter = router;
const tokenRegistryService = new default_token_registry_service_1.DefaultTokenRegistryService();
// deploy token registry
router.post("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const registryModel = req.body;
            const result = yield tokenRegistryService.deployTokenRegistry(registryModel);
            res.json(result);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
// get deployment event from transaction receipt
router.post("/event", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transactionReceipt = req.body;
            const result = yield tokenRegistryService.getTokenRegistryDeploymentEvent(transactionReceipt);
            res.json(result);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
});
