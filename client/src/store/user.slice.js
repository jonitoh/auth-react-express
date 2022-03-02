/*
State management for user persistence regarding custom choices and authorization in the application.
*/
import roles from "data/roles";
import { ROLES, getImgSrcFromRoles } from "utils/roles";
import { isEmpty } from "utils/function";
/*
const fakeUser = {
  username: "Fusername",
  roleName: ROLES.MODERATOR, //ROLES.ADMIN,
  hasUsername: false,
  email: "fake-user@test.fr",
  productKey: "id_of_fake-pk",
  roleId: "1",
  imgSrc: undefined,
};
fakeUser.imgSrc = getImgSrcFromRoles(roles, fakeUser.imgSrc, fakeUser.roleName);
*/

export default function userSlice(set, get) {
  return {
    //states
    user: null,

    //actions
    isValidUser: (user) => !isEmpty(user),
    setUser: (user) => get().isValidUser(user) && set({ user }),
    _clearUser: () => set({ user: null }),
    hasRight: (roleName, authRoles, isStrict = true) => {
      // if authRoles undefined or not an array, we put a default list
      let myAllowedRoles = Object.values(ROLES);

      if (authRoles instanceof Array && authRoles.length !== 0) {
        myAllowedRoles = myAllowedRoles.filter((r) => authRoles.includes(r));
      }
      if (myAllowedRoles.length === 0) {
        console.log(
          "it seems like the roles you wanted are not known by the authentification system. "
        );
        if (isStrict) {
          throw new Error("UNKNOWN_ROLES");
        }
        //myAllowedRoles = Object.values(ROLES);
        return false;
      }
      return myAllowedRoles.includes(roleName);
    },
    _initiateUser: () => null,
    // persist options
    _persistUser: {
      partialize: (state) => ({
        user: state.user,
      }),
      merge: (persistedState, currentState) => {
        const { user } = persistedState;
        const newUser = user
          ? {
              ...user,
              imgSrc: getImgSrcFromRoles(roles, user.imgSrc, user.roleName),
            }
          : {};
        return {
          ...currentState,
          ...{
            user: newUser,
          },
        };
      },
    },
  };
}
