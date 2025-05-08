import express, {json, urlencoded} from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import {indexRouter} from "./routes"
import {didRouter} from "./routes/did";
import {documentRouter} from "./routes/document";
import {tokenRegistryRouter} from "./routes/token-registry";
import {connect} from "@ngrok/ngrok"


const app = express();
const port = (process.env.PORT || 80) as number;
const hostname = process.env.HOST || "0.0.0.0";

function boostrapHooks(){
    app.use(logger('dev'));
    app.use(json());
    app.use(urlencoded({ extended: false }));
    app.use(cookieParser());
    // Add middleware to parse JSON bodies
    app.use(express.json({ limit: '50mb' }));
    // CORS allow all
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use('/', indexRouter);
    app.use('/.well-known', didRouter);
    app.use('/token-registry', tokenRegistryRouter);
    app.use('/document', documentRouter);

    // Global error handling middleware
    app.use((err:Error, req:any, res:any, next:any) => {
        console.error({ 'error:': err, 'req.url': req.url });
        res.status(500).json({
            error: {
                message: err.message ,
                ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
            }
        });
    });
}


boostrapHooks();
app.listen(port, hostname , () => {
    console.log("Server is running on port 3000");
});

if(process.env.NODE_ENV === 'development') {
    // start ngrok local server for serving the did document
    (async function () {
        if (process.env.NGROK_AUTHTOKEN) {
            connect({ addr: port, authtoken_from_env: true, hostname: process.env.DOMAIN })
                .then((listener) => console.log(`[ngrok]: Ingress established at: ${listener.url()}`));
        }
    })();
}
