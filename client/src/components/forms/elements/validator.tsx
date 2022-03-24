const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function validateUsername(value: string | undefined): boolean {
  return value ? USERNAME_REGEX.test(value) : true;
}

export function validatePassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export function validateMatchedPassword(pwd: string, value: string): boolean {
  return pwd === value;
}

export function validateEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function validateProductKey(value: unknown): boolean {
  return !!value;
}
