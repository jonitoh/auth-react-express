/*
State management for user persistence regarding custom choices and authorization in the application.
*/
import { sortFromDate } from '../utils/main';
import { StoreFromSlice, PersistOptionsSlice } from '../utils/store';

export interface Notification {
  id: string;
  date: string;
  content: {
    title: string;
    message: string;
  };
  read: boolean;
  level: string;
  isLocal: boolean;
}

// TODO after using an ISO format new Date(item.date)
function convertStringToDate(str: string): Date {
  const parts = str.split('/').map((s) => parseFloat(s));
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

const fakeNotifications: Notification[] = [
  {
    id: '1',
    date: '22/02/2022',
    content: {
      title: 'my notif -- 1 (local)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: true,
  },
  {
    id: '2',
    date: '23/02/2022',
    content: {
      title: 'my notif  -- 2 (local)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: true,
  },
  {
    id: '3',
    date: '20/02/2022',
    content: {
      title: 'my notif -- 3 (global)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: false,
  },
  {
    id: '4',
    date: '28/02/2022',
    content: {
      title: 'my notif  -- 2 (global)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: false,
  },
  {
    id: '5',
    date: '23/02/2022',
    content: {
      title: 'my notif  -- 5 (global)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: false,
  },
  {
    id: '6',
    date: '23/02/2022',
    content: {
      title: 'my notif  -- 6 (global)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: false,
  },
  {
    id: '7',
    date: '23/02/2022',
    content: {
      title: 'my notif  -- 7 (local)',
      message: 'random message',
    },
    read: false,
    level: 'basic',
    isLocal: true,
  },
];

export interface NotificationSlice {
  // states
  notifications: Notification[];

  // actions
  sortNotifications: (items: Notification[], asc?: boolean) => Notification[];
  addNotification: (item: Notification) => void;
  deleteNotification: (id: string) => void;
  updateNotification: (id: string, data: Partial<Notification>) => void;
  // partial actions
  _clearNotifications: () => void;
  _isInitialValueAsNotifications: () => boolean;
  // persist options
  _persistNotifications: PersistOptionsSlice<NotificationSlice, PersistedNotificationSlice>;
}

interface PersistedNotificationSlice {
  // states
  notifications: Notification[];
}

export default function createNotificationSlice<
  IStore extends NotificationSlice = NotificationSlice
>(
  ...[set, get]: Parameters<StoreFromSlice<IStore, NotificationSlice>>
): ReturnType<StoreFromSlice<IStore, NotificationSlice>> {
  return {
    // states
    notifications: fakeNotifications, // [],

    // actions
    sortNotifications: (items: Notification[], asc = false) =>
      sortFromDate(items, (item) => convertStringToDate(item.date), asc),
    addNotification: (item: Notification) =>
      set((state: NotificationSlice) => ({
        notifications: get().sortNotifications([...state.notifications, item]),
      })),
    deleteNotification: (id: string) => {
      console.info(`We're removing notification with id ${id}`);
      return set((state: NotificationSlice) => ({
        notifications: state.notifications.filter((n: Notification) => n.id !== id),
      }));
    },
    updateNotification: (id: string, data: Partial<Notification>) => {
      console.info(`We're updating notification with id ${id}`);
      return set((state: NotificationSlice) => {
        const idx = state.notifications.findIndex((n: Notification) => n.id === id);
        const newNotifications = [...state.notifications];
        if (idx !== -1) {
          newNotifications[idx] = { ...state.notifications[idx], ...data };
        }
        return { notifications: newNotifications };
      });
    },
    // partial actions
    _clearNotifications: () => set({ notifications: [] }),
    _isInitialValueAsNotifications: () => get().notifications === [],
    // persist options
    _persistNotifications: {
      partialize: (state: NotificationSlice) => ({
        notifications: state.notifications.filter((n: Notification) => !!n.isLocal),
      }),
      toMerge: (persistedState: PersistedNotificationSlice, currentState: NotificationSlice) => {
        const { notifications } = persistedState;
        const availableNotificationIds = currentState.notifications.map(
          (item: Notification) => item.id
        );
        const filteredNotifications = notifications.filter(
          (item: Notification) => !availableNotificationIds.includes(item.id)
        );
        return {
          notifications: currentState.sortNotifications([
            ...currentState.notifications,
            ...filteredNotifications,
          ]),
        };
      },
    },
  };
}
