/*
State management for user persistence regarding custom choices and authorization in the application.
*/
import roles from "data/roles";
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
  roleName: "moderator", //"admin",
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
    user: {
      ...fakeUser,
      imgSrc: getImgSrc(fakeUser.imgSrc, fakeUser.roleName),
    }, //null,
    userTagName: "current-user",
    notifications: fakeNotifications, //[],

    //actions
    updateUser: (user) => set({ user }),
    setDocumentUser: () =>
      document.documentElement.setAttribute(get().userTagName, get().user),
    setLocalStorageUser: () =>
      localStorage.setItem(get().userTagName, JSON.stringify(get().user)),
    setUser: (user) => {
      get().updateUser(user);
      get().setDocumentUser();
      get().setLocalStorageUser();
    },
    initiateUser: () => {
      if (!localStorage.getItem(get().userTagName)) {
        get().updateUser(get().user);
        get().setLocalStorageUser();
      } else {
        get().updateUser(JSON.parse(localStorage.getItem(get().userTagName)));
      }
      get().setDocumentUser();
    },
    hasRight: (roleName, authRoles) => {
      if (!authRoles) {
        return true;
      }
      if (authRoles instanceof Array) {
        if (authRoles.length === 0) {
          return true;
        }
        return authRoles.includes(roleName);
      }
      return false;
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
