import {CredentialSubjects} from "@trustvc/trustvc/w3c/vc";
import {CHAIN_ID} from "@trustvc/trustvc";


export interface DocumentModel {
    documentId?: string,
    chainId?: CHAIN_ID,
    name?:string
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
    documentId?:string
    remarks?: string,
    newHolder?: string,
    newBeneficiary?: string
    chainId?: CHAIN_ID
    tokenRegistry?: string
    tokenId?: string
}

export enum TransferabilityActions{
    TRANSFER_OWNERS = 'transferOwners',
    TRANSFER_HOLDER = 'transferHolder',
    TRANSFER_BENEFICIARY = 'transferBeneficiary',
    REJECT_TRANSFER_HOLDER = 'rejectTransferHolder',
    REJECT_TRANSFER_BENEFICIARY = 'rejectTransferBeneficiary',
    REJECT_TRANSFER_OWNERS = 'rejectTransferOwners',
    RETURN_TO_ISSUER = 'returnToIssuer'
}