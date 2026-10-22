export interface User {
  name: string;
  username: string;
  createdAt: string;
}

export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}
