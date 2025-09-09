export const Roles = {
  JUAN: 'juan',
  SLAVE: 'slave',
  DEVELOPER: 'developer',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
