import { IconType } from 'react-icons';
import { FiHome, FiCalendar, FiUser, FiDollarSign, FiBriefcase, FiSettings } from 'react-icons/fi';
import { IoPawOutline } from 'react-icons/io5';

export type NavItemAsItemData = {
  type: 'item';
  icon: IconType;
  title: string;
  description?: string;
  link: string;
  id: string;
  authRoles?: string[];
};

export type NavItemAsListData = {
  type: 'list';
  icon: IconType;
  title: string;
  description?: string;
  id: string;
  authRoles?: string[];
  items: NavItemAsItemData[];
};

export type NavItem = NavItemAsListData | NavItemAsItemData;

const navItems: NavItem[] = [
  {
    type: 'item',
    icon: FiHome,
    title: 'Dashboard',
    description: 'This is the description for the dashboard.',
    link: '/test',
    id: 'dashboard',
    authRoles: [],
  },
  {
    type: 'item',
    icon: FiCalendar,
    title: 'Calendar',
    link: '/test',
    id: 'calendar',
  },
  {
    type: 'list',
    icon: FiUser,
    title: 'Clients',
    description: 'This is the description for the clients.',
    id: 'my-id',
    authRoles: ['moderator', 'admin'],
    items: [
      {
        type: 'item',
        icon: FiHome,
        title: 'item 1',
        id: 'item1',
        description: 'This is the description for item 1.',
        link: '/test',
      },
      {
        type: 'item',
        icon: FiHome,
        title: 'item 2',
        id: 'item2',
        description: 'This is the description for item 2.',
        link: '/test',
      },
    ],
  },
  {
    type: 'item',
    icon: IoPawOutline,
    title: 'Animals',
    link: '/test',
    id: 'animals',
    authRoles: ['moderator', 'admin'],
  },
  {
    type: 'item',
    icon: FiDollarSign,
    title: 'Stocks',
    link: '/stats',
    id: 'stocks',
    authRoles: ['admin'],
  },
  {
    type: 'item',
    icon: FiBriefcase,
    title: 'Reports',
    link: '/test',
    id: 'reports',
    authRoles: ['admin'],
  },
  {
    type: 'item',
    icon: FiSettings,
    title: 'Settings',
    link: '/test',
    id: 'settings',
  },
];

export default navItems;
