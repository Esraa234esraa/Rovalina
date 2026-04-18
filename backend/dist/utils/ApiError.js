import { toArabicErrorMessage } from './response.js';
export class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(toArabicErrorMessage(message, statusCode));
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
