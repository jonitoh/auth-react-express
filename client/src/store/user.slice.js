/*
State management for user persistence regarding custom choices and authorization in the application.
*/
import roles from "data/roles";
import ROLES from "utils/roles";
const getImgSrc = (src, roleName) => {
  if (src) {
    return src;
  }
  const altImg = roles.find((r) => r.name === roleName);
  if (altImg) {
    return altImg.src;
  }
  return "";
};

const fakeUser = {
  username: "Fusername",
  roleName: ROLES.MODERATOR, //ROLES.ADMIN,
  hasUsername: false,
  email: "fake-user@test.fr",
  productKey: "id_of_fake-pk",
  roleId: "1",
  //imgSrc: undefined,
};

const fakeNotifications = [
  {
    id: "1",
    date: "22/02/2022",
    content: {
      title: "my notif -- 1",
      message: "random message",
    },
    read: false,
    level: "basic",
  },
  {
    id: "2",
    date: "23/02/2022",
    content: {
      title: "my notif  -- 2",
      message: "random message",
    },
    read: false,
    level: "basic",
  },
  {
    id: "3",
    date: "20/02/2022",
    content: {
      title: "my notif -- 3",
      message: "random message",
    },
    read: false,
    level: "basic",
  },
];

export default function userSlice(set, get) {
  return {
    //states
    _user: null,
    user: {
      ...fakeUser,
      imgSrc: getImgSrc(fakeUser.imgSrc, fakeUser.roleName),
    }, //null,
    userTagName: "current-user",
    notifications: fakeNotifications, //[],
    accessToken: "",

    //actions
    setAccessToken: (accessToken) => set({ accessToken }),
    updateUser: (user) =>
      set({ user: { ...user, imgSrc: getImgSrc(user.imgSrc, user.roleName) } }),
    setLocalStorageUser: () =>
      localStorage.setItem(get().userTagName, JSON.stringify(get().user)),
    removeLocalStorageUser: () => localStorage.removeItem(get().userTagName),
    setUser: (user) => {
      get().updateUser(user);
      get().setLocalStorageUser();
    },
    removeUser: () => {
      get().updateUser(null);
      get().removeLocalStorageUser();
    },
    initiateUser: () => {
      if (!localStorage.getItem(get().userTagName)) {
        get().updateUser(get().user);
        get().setLocalStorageUser();
      } else {
        get().updateUser(JSON.parse(localStorage.getItem(get().userTagName)));
      }
    },
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
    addNotification: () => {},
    removeNotification: (id) => {
      console.log(`We're removing notification with id ${id}`);
      return set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },
    updateNotification: (id, data) => {
      console.log(`We're updating notification with id ${id}`);
      return set((state) => {
        const idx = state.notifications.findIndex((n) => n.id === id);
        if (idx !== -1) {
          const newNotifications = [...state.notifications];
          newNotifications[idx] = { ...state.notifications[idx], ...data };
          return {
            notifications: newNotifications,
          };
        }
        return state;
      });
    },
  };
}
