import {ParamsValidator} from "./interface/params-validator";


export class SimpleParamsValidator implements ParamsValidator{

    validate(data: {[key: string]: any}): boolean {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (value === null || value === undefined) {
                    throw new Error(key);
                }
            }
        }
        return true;
    }

    static createValidator():ParamsValidator{
        return new SimpleParamsValidator()
    }
}