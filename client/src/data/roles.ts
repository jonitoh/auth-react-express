/*
Data from https://randomuser.me/
*/

type Role = {
  name: string;
  src: string;
};

const ROLES = {
  INVITED: 'invited',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  ADMIN: 'admin',
  BASIC: 'basic',
} as const;

const roles: Role[] = [
  {
    name: 'invited',
    src: '',
  },

  {
    name: 'moderator',
    src: 'https://randomuser.me/api/portraits/women/67.jpg',
  },
  {
    name: 'admin',
    src: 'https://randomuser.me/api/portraits/men/25.jpg',
  },
  {
    name: 'basic',
    src: 'https://randomuser.me/api/portraits/lego/7.jpg',
  },
];

export { Role, roles, ROLES };
