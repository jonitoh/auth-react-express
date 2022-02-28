const ROLES = {
  INVITED: "invited",
  MODERATOR: "moderator",
  EDITOR: "editor",
  ADMIN: "admin",
  BASIC: "basic",
};

const getImgSrcFromRoles = (roles, src, roleName) => {
  if (src) {
    return src;
  }
  const altImg = roles.find((r) => r.name === roleName);
  if (altImg) {
    return altImg.src;
  }
  return "";
};

export { ROLES, getImgSrcFromRoles };
