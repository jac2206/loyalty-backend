export const UserErrors = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    statusCode: 404
  },

  USER_INVALID_CREDENTIALS: {
    code: "USER_INVALID_CREDENTIALS",
    message: "Invalid email or password",
    statusCode: 401
  },

  USER_EMAIL_ALREADY_EXISTS: {
    code: "USER_EMAIL_ALREADY_EXISTS",
    message: "User email already registered",
    statusCode: 409
  },

  USER_WEAK_PASSWORD: {
    code: "USER_WEAK_PASSWORD",
    message: "Password must contain uppercase letter, number and 8 characters",
    statusCode: 422
  }

};