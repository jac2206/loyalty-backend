export const AccountsErrors = {
  ACCOUNT_INACTIVE: {
    code: "ACCOUNT_INACTIVE",
    message: "Account is inactive",
    statusCode: 403,
  },
  ACCOUNT_DOCUMENT_MISMATCH: {
    code: "ACCOUNT_DOCUMENT_MISMATCH",
    message: "Account does not belong to the authenticated user",
    statusCode: 403,
  },
  ACCOUNT_NOT_FOUND: {
    code: "ACCOUNT_NOT_FOUND",
    message: "Account not found",
    statusCode: 404,
  },
};
