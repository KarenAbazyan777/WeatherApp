// One place for the form rules, used by SignUp, ForgotPassword and Resetpassword.

const EMAIL = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

// Letters, spaces and , . ' - (for names like "O'Neil" or "Anne-Marie")
const NAME = /^[a-z ,.'-]+$/i;

// At least 6 characters and two of: lowercase, uppercase, digit
const PASSWORD = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

export const isValidEmail = (value) => EMAIL.test(value.trim());
export const isValidName = (value) => NAME.test(value.trim());
export const isValidPassword = (value) => PASSWORD.test(value);
