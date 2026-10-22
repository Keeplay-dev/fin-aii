export interface User {
  id?: number;
  name: string;
  username: string;
  salary?: number;
  createdAt: string;
}

export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}
