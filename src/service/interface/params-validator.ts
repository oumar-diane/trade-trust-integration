

/**
 * utility interface to validate params
 * **/
export interface ParamsValidator {
    /**
     * validate params
     * @param data - params to be validated
     * @returns true if valid, throw error message otherwise
     */
    validate(data:any):boolean
}