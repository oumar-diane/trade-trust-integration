"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signWithPrivateKey = signWithPrivateKey;
exports.decryptWithPrivateKey = decryptWithPrivateKey;
const trustvc_1 = require("@trustvc/trustvc");
/**
 * sign sensitive data with a private key
 * **/
function signWithPrivateKey(privateKey, data) {
    return (0, trustvc_1.encrypt)(data, privateKey);
}
function decryptWithPrivateKey(privateKey, data) {
    return (0, trustvc_1.decrypt)(data, privateKey);
}
