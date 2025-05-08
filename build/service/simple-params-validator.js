"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleParamsValidator = void 0;
class SimpleParamsValidator {
    validate(data) {
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
    static createValidator() {
        return new SimpleParamsValidator();
    }
}
exports.SimpleParamsValidator = SimpleParamsValidator;
