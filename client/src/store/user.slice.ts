/*
State management for user persistence regarding custom choices and authorization in the application.
*/
import { roles, ROLES } from '../data/roles';
import { getImgSrcFromRoles } from '../utils/roles';
import { isEmpty } from '../utils/main';
import { StoreFromSlice, PersistOptionsSlice } from '../utils/store';

export interface User {
  username: string;
  roleName: string;
  hasUsername: boolean;
  email: string;
  productKey: string;
  roleId: string;
  imgSrc?: string;
}

export interface UserSlice {
  // states
  user: User | null;

  // actions
  isValidUser: (user: unknown) => user is User;
  setUser: (user: unknown) => void;
  hasRight: (roleName: string, authRoles: unknown, isStrict?: boolean) => boolean;

  // partial actions
  _clearUser: () => void;
  _isInitialValueAsUser: () => boolean;
  // persist options
  _persistUser: PersistOptionsSlice<UserSlice, PersistedUserSlice>;
}

interface PersistedUserSlice {
  // states
  user: User | null;
}

/*
const fakeUser: User = {
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

export default function createUserSlice<IStore extends UserSlice = UserSlice>(
  ...[set, get]: Parameters<StoreFromSlice<IStore, UserSlice>>
): ReturnType<StoreFromSlice<IStore, UserSlice>> {
  return {
    // states
    user: null,

    // actions
    isValidUser: (user: unknown): user is User => !isEmpty(user),
    setUser: (user: unknown) => {
      if (get().isValidUser(user)) {
        set({ user });
      }
    },
    hasRight: (roleName: string, authRoles: unknown, isStrict = true) => {
      // if authRoles undefined or not an array, we put a default list
      let myAllowedRoles: string[] = Object.values(ROLES);

      if (authRoles instanceof Array && authRoles.length !== 0) {
        myAllowedRoles = myAllowedRoles.filter((r) => authRoles.includes(r));
      }
      if (myAllowedRoles.length === 0) {
        console.warn(
          'it seems like the roles you wanted are not known by the authentification system. '
        );
        if (isStrict) {
          throw new Error('UNKNOWN_ROLES');
        }
        // myAllowedRoles = Object.values(ROLES);
        return false;
      }
      return myAllowedRoles.includes(roleName);
    },
    // partial actions
    _clearUser: () => set({ user: null }),
    _isInitialValueAsUser: () => get().user === null,
    // persist options
    _persistUser: {
      partialize: (state: UserSlice) => ({
        user: state.user,
      }),
      toMerge: (persistedState: PersistedUserSlice, currentState: UserSlice) => {
        const { user } = persistedState;
        if (!user) {
          return {};
        }
        return {
          user: {
            ...user,
            imgSrc: getImgSrcFromRoles(roles, user.imgSrc, user.roleName),
          },
        };
      },
    },
  };
}
