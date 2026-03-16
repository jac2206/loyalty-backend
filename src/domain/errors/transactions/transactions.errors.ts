export const TransactionsErrors = {
    TRANSACTION_TYPE_INVALID: {
        code: "TRANSACTION_TYPE_INVALID",
        message: "Transaction type must be accumulation or redemption",
        statusCode: 422
    },
    USER_DOCUMENT_REQUIRED: {
        code: "USER_DOCUMENT_REQUIRED",
        message: "Document number is required",
        statusCode: 400
    },
    TRANSACTION_POINTS_INVALID: {
        code: "TRANSACTION_POINTS_INVALID",
        message: "Points must be greater than zero",
        statusCode: 422
    },
    TRANSACTION_ACCOUNT_NOT_FOUND: {
        code: "TRANSACTION_ACCOUNT_NOT_FOUND",
        message: "Account not found for user",
        statusCode: 404
    },
    INSUFFICIENT_POINTS: {
        code: "INSUFFICIENT_POINTS",
        message: "User does not have enough points",
        statusCode: 422
    }
};