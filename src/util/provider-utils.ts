import {CHAIN_ID, SUPPORTED_CHAINS} from "@trustvc/trustvc";

export function getRPCUrl(chainId: CHAIN_ID): string {
    const chainInfo = SUPPORTED_CHAINS[chainId];
    if (!chainInfo) {
        throw new Error(`Chain ID ${chainId} not found in supported chains`);
    }
    switch (chainId) {
        case CHAIN_ID.amoy:
            return "https://rpc.amoy.network";
        case CHAIN_ID.matic:
            return "https://rpc-mainnet.matic.network";
        case CHAIN_ID.mainnet:
            return "https://mainnet.infura.io/v3/"+process.env.INFURA_API_KEY;
        case CHAIN_ID.sepolia:
            return "https://sepolia.infura.io/v3/"+process.env.INFURA_API_KEY;
        default:
            throw new Error(`No RPC URL found for chain ID ${chainId}`);
    }
}