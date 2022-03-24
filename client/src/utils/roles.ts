import { Role } from '../data/roles';

function getImgSrcFromRoles(roles: Role[], src: string | undefined, roleName: string): string {
  if (src) {
    return src;
  }
  const altImg = roles.find((r) => r.name === roleName);
  if (altImg) {
    return altImg.src;
  }
  return '';
}

export { getImgSrcFromRoles };
