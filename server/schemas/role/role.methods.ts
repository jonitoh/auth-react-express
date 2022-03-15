import { IRoleDocument, ObjectOfFunctions } from './role.types';

function higherThan(this: IRoleDocument, number: number): boolean {
  return this.level >= number;
}

const methods: ObjectOfFunctions = {
  higherThan,
};

export default methods;
