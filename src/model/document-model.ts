import {CredentialSubjects} from "@trustvc/trustvc/w3c/vc";
import {CHAIN_ID} from "@trustvc/trustvc";


export interface DocumentModel {
    documentId?: string,
    chainId?: CHAIN_ID,
    credentialSubject?: CredentialSubjects,
    owner?: string,
    holder?: string,
    remarks?: string,
    issuanceDate?:string,
    expirationDate?:string
    didKeyPairs?: any,
    tokenRegistryAddress?: string,
}

export interface DocumentTransferabilityModel {
    chainId?: CHAIN_ID,
    remarks?: string,
    newHolder?: string,
    newBeneficiary?: string,
    titleEscrowAddress?: string,
}

export enum TransferabilityActions{
    TRANSFER_OWNERS = 'transferOwners',
    TRANSFER_HOLDER = 'transferHolder',
    TRANSFER_BENEFICIARY = 'transferBeneficiary',
    NOMINATE = 'nominate'
}