"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeEnvVariable = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const writeEnvVariable = (key, value) => {
    const envPath = (0, path_1.join)(process.cwd(), ".env");
    const envString = JSON.stringify(value);
    try {
        let existingEnv = (0, fs_1.readFileSync)(envPath, "utf8");
        if (!existingEnv.includes(`${key}=`)) {
            const envData = existingEnv.endsWith("\n") ? `${key}=${envString}\n` : `\n${key}=${envString}\n`;
            (0, fs_1.appendFileSync)(envPath, envData);
            console.log(`${key} has been written to .env file`);
        }
        else {
            // Replace existing value
            const envLines = existingEnv.split("\n");
            const updatedEnv = envLines.map((line) => (line.startsWith(`${key}=`) ? `${key}=${envString}` : line)).join("\n");
            (0, fs_1.writeFileSync)(envPath, updatedEnv.endsWith("\n") ? updatedEnv : updatedEnv + "\n");
            console.log(`Existing ${key} has been overwritten in .env file`);
        }
    }
    catch (error) {
        (0, fs_1.writeFileSync)(envPath, `${key}=${envString}\n`);
        console.log(`Created new .env file with ${key}`);
    }
};
exports.writeEnvVariable = writeEnvVariable;
