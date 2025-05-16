
/**
 * service for generating decentralized identifiers (DIDs) using a user interface
 *
 * **/
export interface DidService {
    /**
     * Generates a decentralized identifier (DID) for the given domain.
     * @param domain - The domain for which to generate the DID.
     * @returns A promise that resolves to the generated DID.
     */
    generateDid(domain: string): Promise<any>;


}