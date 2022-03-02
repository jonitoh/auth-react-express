/*
State management for user persistence regarding custom choices and authorization in the application.
*/
import { sortFromDate } from "utils/function";

const fakeNotifications = [
  {
    id: "1",
    date: "22/02/2022",
    content: {
      title: "my notif -- 1 (local)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: true,
  },
  {
    id: "2",
    date: "23/02/2022",
    content: {
      title: "my notif  -- 2 (local)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: true,
  },
  {
    id: "3",
    date: "20/02/2022",
    content: {
      title: "my notif -- 3 (global)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: false,
  },
  {
    id: "4",
    date: "28/02/2022",
    content: {
      title: "my notif  -- 2 (global)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: false,
  },
  {
    id: "5",
    date: "23/02/2022",
    content: {
      title: "my notif  -- 5 (global)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: false,
  },
  {
    id: "6",
    date: "23/02/2022",
    content: {
      title: "my notif  -- 6 (global)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: false,
  },
  {
    id: "7",
    date: "23/02/2022",
    content: {
      title: "my notif  -- 7 (local)",
      message: "random message",
    },
    read: false,
    level: "basic",
    isLocal: true,
  },
];

export default function notificationSlice(set, get) {
  return {
    //states
    notifications: fakeNotifications, //[],

    //actions
    sortNotifications: (items, asc = false) =>
      sortFromDate(items, (item) => Date.parse(item.date || 0), asc),
    addNotification: (item) =>
      set((state) => ({
        notifications: get().sort([...state.notifications, item]),
      })),
    deleteNotification: (id) => {
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
    _clearNotifications: () => set({ notifications: [] }),
    _initiateNotifications: () => null,
    // persist options
    _persistNotification: {
      partialize: (state) => ({
        notifications: state.notifications.filter((it) => !!it.isLocal),
      }),
      merge: (persistedState, currentState) => {
        const { notifications } = persistedState;
        const availableNotificationIds = currentState.notifications.map(
          (item) => item.id
        );
        const filteredNotifications = notifications.filter(
          (item) => !availableNotificationIds.includes(item.id)
        );
        return {
          ...currentState,
          ...{
            notifications: currentState.sortNotifications([
              ...currentState.notifications,
              ...filteredNotifications,
            ]),
          },
        };
      },
    },
  };
}
