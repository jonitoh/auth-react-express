import { IProductKeyDocument, ObjectOfFunctions } from "./product-key.types";

function activate(this: IProductKeyDocument, activationDate: Date|undefined = undefined): void {
  this.activationDate = activationDate || new Date();
  this.activated = true;
}

function deactivate(this: IProductKeyDocument): void {
  this.activated = false;
}

function isInUse(this: IProductKeyDocument): [boolean, string|null]{
  const isActivated: boolean = this.activated;
  const isValid: boolean = this.isValid;
  const isInUse: boolean = isActivated && isValid;
  let message: string|null = null;
  if (!isActivated) {
    message = "DEACTIVATED_PRODUCT_KEY";
  }
  if (!isValid) {
    message = "NON_VALID_PRODUCT_KEY";
  }
  if (!isActivated && !isValid) {
    message = "DEACTIVATED_PRODUCT_KEY || NON_VALID_PRODUCT_KEY";
  }

  return [isInUse, message];
}

const methods: ObjectOfFunctions = {
  activate,
  deactivate,
  isInUse,
}

export default methods
