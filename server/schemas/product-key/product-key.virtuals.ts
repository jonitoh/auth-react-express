import { IProductKeyDocument, ObjectOfFunctions } from "./product-key.types";

function getIsValid(this:IProductKeyDocument): boolean {
  return (
    (new Date().getTime() - this.activationDate.getTime()) / 1000 <
    this.validityPeriod
  );
}

const virtuals: ObjectOfFunctions = {
  getIsValid,
}

export default virtuals;
