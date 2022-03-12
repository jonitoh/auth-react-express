import { IUserDocument, ObjectOfFunctions } from "./user.types";
import { capitalize } from "utils/main";

function getCurrentUsername(this:IUserDocument):string {
  return this.username || capitalize(this.email.split("@")[0], true);
}

const virtuals: ObjectOfFunctions = {
  getCurrentUsername,
}

export default virtuals;
