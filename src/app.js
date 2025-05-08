"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importStar(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = require("./routes");
const did_1 = require("./routes/did");
const document_1 = require("./routes/document");
const token_registry_1 = require("./routes/token-registry");
const ngrok_1 = require("@ngrok/ngrok");
const app = (0, express_1.default)();
const port = (process.env.PORT || 3000);
const hostname = process.env.HOST || "localhost";
function boostrapHooks() {
    app.use((0, morgan_1.default)('dev'));
    app.use((0, express_1.json)());
    app.use((0, express_1.urlencoded)({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    // Add middleware to parse JSON bodies
    app.use(express_1.default.json({ limit: '50mb' }));
    // CORS allow all
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.use('/', routes_1.indexRouter);
    app.use('/.well-known', did_1.didRouter);
    app.use('/token-registry', token_registry_1.tokenRegistryRouter);
    app.use('/document', document_1.documentRouter);
    // Global error handling middleware
    app.use((err, req, res, next) => {
        console.error({ 'error:': err, 'req.url': req.url });
        res.status(500).json({
            error: Object.assign({ message: err.message }, (process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}))
        });
    });
}
boostrapHooks();
app.listen(port, hostname, () => {
    console.log("Server is running on port 3000");
});
if (process.env.NODE_ENV === 'development') {
    // start ngrok local server for serving the did document
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NGROK_AUTHTOKEN) {
                (0, ngrok_1.connect)({ addr: port, authtoken_from_env: true, hostname: process.env.DOMAIN })
                    .then((listener) => console.log(`[ngrok]: Ingress established at: ${listener.url()}`));
            }
        });
    })();
}
