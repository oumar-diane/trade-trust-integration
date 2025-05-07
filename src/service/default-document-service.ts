import {
    CHAIN_ID,
    encrypt,
    getTokenId,
    SignedVerifiableCredential,
    signW3C,
    SUPPORTED_CHAINS,
    v5Contracts,
    verifyDocument
} from "@trustvc/trustvc";
import {getRPCUrl} from "../util/provider-utils";
import {DocumentModel, DocumentTransferabilityModel, TransferabilityActions} from "../model/document-model";
import {ethers, TransactionRequest} from "ethers";
import {TradeTrustToken__factory} from "@trustvc/trustvc/token-registry-v5/contracts";
import {DocumentService, getDocumentSchema} from "./interface/document-service";
import {SimpleParamsValidator} from "./simple-params-validator";
import {decryptWithPrivateKey} from "../util/crypto-utils";

export class DefaultDocumentService implements DocumentService {

    public static readonly CHAINID: CHAIN_ID = process.env.NET as CHAIN_ID ?? CHAIN_ID.amoy;
    public static readonly CHAININFO = SUPPORTED_CHAINS[this.CHAINID];

    protected paramsValidator = SimpleParamsValidator.createValidator()

    async applyVerification(signedW3CDocument: SignedVerifiableCredential) {
        // Validate required parameters
        this.paramsValidator.validate({"the signedW3CDocument is required":signedW3CDocument})
        // Verify the document
        return await verifyDocument(signedW3CDocument);
    }

    async applyDocumentTransferabilityAction(transferabilityData:DocumentTransferabilityModel , vc:SignedVerifiableCredential, action:TransferabilityActions) {

        Object.assign(DefaultDocumentService.CHAININFO, {
            rpcUrl:getRPCUrl(transferabilityData.chainId!) ?? SUPPORTED_CHAINS[transferabilityData.chainId!]
        })
        const title_escrow_factory = new ethers.Interface(v5Contracts.TitleEscrow__factory.abi);
        const params =  await this.getTransferabilityAction(action, vc, transferabilityData) as any[]
        const title_escrow_tx =  title_escrow_factory.encodeFunctionData(action, [...params]);

        console.log("Transaction confirmed");
        return {
            to: transferabilityData.titleEscrowAddress,
            data: title_escrow_tx,
        }
    }

    async createDocument(rawDocument: DocumentModel) {
        if(process.env.NODE_ENV === "development"){
            // decrypt the didKeyPairs
            rawDocument.didKeyPairs = decryptWithPrivateKey(process.env.SIGNER_PRIVATE_KEY! , rawDocument.didKeyPairs)
        }
        // validate required parameters
        this.paramsValidator.validate({
            "Document not supported":rawDocument.documentId,
            "didKeyPair is required":rawDocument.owner,
            "tokenRegistry is required":rawDocument.holder,
            "tokenRegistryAddress is required":rawDocument.tokenRegistryAddress,
            "chainId is required":rawDocument.chainId,
            "didKeyPairs is required":rawDocument.didKeyPairs,
            "credentialSubject is required":rawDocument.credentialSubject,
        })

        Object.assign(DefaultDocumentService.CHAININFO, {
            rpcUrl:getRPCUrl(rawDocument.chainId!) ?? SUPPORTED_CHAINS[rawDocument.chainId!]
        })

        // Remove escaped characters and parsing
        const DID_KEY_PAIRS = JSON.parse(this.cleanedJsonString(rawDocument.didKeyPairs));
        rawDocument.didKeyPairs = DID_KEY_PAIRS;

        // Prepare the document
        rawDocument.issuanceDate = (new Date()).toISOString();
        rawDocument.expirationDate =(this.applyExpirationDate(rawDocument.expirationDate as string)).toISOString();
        const document = getDocumentSchema(rawDocument);

        // Sign the document
        const { error, signed: signedW3CDocument } = await signW3C(document, DID_KEY_PAIRS);
        if (error) {
            throw new Error(error);
        }

        // Issue the document on chain:
        const tokenId = getTokenId(signedW3CDocument!);
        const tradeTrustToken_factory_abi = new ethers.Interface(TradeTrustToken__factory.abi);

        let tx
        // Encrypt remarks
        const encryptedRemarks = rawDocument.remarks && encrypt(rawDocument.remarks ?? '', signedW3CDocument?.id!) || '0x'
        if(SUPPORTED_CHAINS[rawDocument.chainId!].gasStation){
            const gasFees = await SUPPORTED_CHAINS[rawDocument.chainId!].gasStation!();
            console.log('gasFees: ', gasFees);
            tx =  tradeTrustToken_factory_abi.encodeFunctionData("mint", [rawDocument.owner, rawDocument.holder, tokenId, encryptedRemarks,
                {
                    maxFeePerGas: gasFees!.maxFeePerGas?.toBigInt() ?? 0 ,
                    maxPriorityFeePerGas: gasFees!.maxPriorityFeePerGas?.toBigInt() ?? 0,
                }
            ]);
        }else{
            // Encrypt remarks
            tx =  tradeTrustToken_factory_abi.encodeFunctionData("mint", [rawDocument.owner, rawDocument.holder, tokenId, encryptedRemarks]);
        }


        return {
            to:rawDocument.tokenRegistryAddress,
            signedW3CDocument: signedW3CDocument,
            data: tx,

        } as TransactionRequest
    }

    async getTitleEscrowAddress(vc:SignedVerifiableCredential){
        const tokenId = getTokenId(vc);
        const tokenRegistry = (vc.credentialStatus as any).tokenRegistry;

        const functionSelector = ethers.id("getAddress(address,uint256)").slice(0, 10);
        const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [tokenRegistry, tokenId]);
        const calldata = functionSelector + encodedParams.slice(2);
        return{
            to:tokenRegistry,
            data: calldata,
        }
    }

    protected cleanedJsonString(jsonString: string) {
        // Remove escaped characters before parsing
        return jsonString.replace(/\\(?=["])/g, '');
    }

    protected applyExpirationDate(expirationDate:string){
        const defaultExpirationDate = new Date();
        defaultExpirationDate.setMonth(defaultExpirationDate.getMonth() + 3);
        return (expirationDate != undefined && expirationDate != '') ? new Date(expirationDate): defaultExpirationDate;
    }

    protected getProvider(){
        let provider;
        if (ethers.version.startsWith('6.')) {
            provider = new (ethers as any).JsonRpcProvider(DefaultDocumentService.CHAININFO.rpcUrl);
        } else if (ethers.version.includes('/5.')) {
            provider = new (ethers as any).providers.JsonRpcProvider(DefaultDocumentService.CHAININFO.rpcUrl);
        }
        return provider;
    }


    protected isAddress(address: string): boolean {
        return ethers.version.startsWith("6.") ? (ethers as any).isAddress(address) : (ethers as any).utils.isAddress(address);
    }


    protected async getTransferabilityAction(action:string, vc:any, transferabilityData:DocumentTransferabilityModel){
        let params:any[] = [];
        const encryptedRemark = "0x" + encrypt(transferabilityData.remarks as string, vc.id);

        switch (action) {
            case "transferHolder" :
                if (!this.isAddress(transferabilityData.newHolder as string)) {
                    throw new Error("Invalid Ethereum address:"+transferabilityData.newHolder);
                }
                params = [transferabilityData.newHolder, encryptedRemark];
                break
            case "transferBeneficiary" :
                if (!this.isAddress(transferabilityData.newBeneficiary as string)) {
                    throw new Error("Invalid Ethereum address:"+transferabilityData.newBeneficiary);
                }
                params = [transferabilityData.newBeneficiary, encryptedRemark];
                break
            case "nominate" :
                if (!this.isAddress(transferabilityData.newBeneficiary as string)) {
                    throw new Error("Invalid Ethereum address:"+transferabilityData.newBeneficiary);
                }
                params = [transferabilityData.newBeneficiary, encryptedRemark];
                break
            case "transferOwners" :
                if (!this.isAddress(transferabilityData.newBeneficiary as string) || !this.isAddress(transferabilityData.newHolder as string)) {
                    throw new Error("Invalid Ethereum address:"+transferabilityData.newBeneficiary+", "+transferabilityData.newHolder);
                }
                params = [transferabilityData.newBeneficiary, encryptedRemark];
                break
            default:
                params = [encryptedRemark];
                console.error("Invalid action:", action);
                return params
        }
    }
}