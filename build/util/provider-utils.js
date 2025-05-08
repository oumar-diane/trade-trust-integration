"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRPCUrl = getRPCUrl;
const trustvc_1 = require("@trustvc/trustvc");
function getRPCUrl(chainId) {
    const chainInfo = trustvc_1.SUPPORTED_CHAINS[chainId];
    if (!chainInfo) {
        throw new Error(`Chain ID ${chainId} not found in supported chains`);
    }
    switch (chainId) {
        case trustvc_1.CHAIN_ID.amoy:
            return "https://rpc.amoy.network";
        case trustvc_1.CHAIN_ID.matic:
            return "https://rpc-mainnet.matic.network";
        case trustvc_1.CHAIN_ID.mainnet:
            return "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY;
        case trustvc_1.CHAIN_ID.sepolia:
            return "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY;
        default:
            throw new Error(`No RPC URL found for chain ID ${chainId}`);
    }
}
