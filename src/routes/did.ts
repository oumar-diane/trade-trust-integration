import fs from "fs";
import path from "path";
import express from "express";
import {DefaultDidService} from "../service/default-did-service";

const router = express.Router();

const didService = new DefaultDidService()

// server did document in internet using ngrok in development mode
router.get("/did.json", function(req, res, next){
    try {
        const didJsonPath = path.join(__dirname, "../../did.json");
        const didJson = fs.readFileSync(didJsonPath, "utf-8");
        res.json(JSON.parse(didJson));
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// generate a new did from user domain
router.post("/:domain", async function(req, res, next){
    try {
        const {domain} = req.params;
        const result = await didService.generateDid(domain)
        res.json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export {router as didRouter};
