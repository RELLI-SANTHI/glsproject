export enum ENVIRONMENTS {
  dev = 'dev',
  test = 'test',
  prod = 'prod'
}

export enum CONSOLE_LEVELS {
  error = 1,
  warning,
  info,
  debug,
  verbose
};

export enum MENU_STATE {
  Full,
  Collapsed,
  Hidden
};

export enum LOGIN_TYPES {
  NONE,
  SSO,
  AzureB2C,
  LDAP
}

export const CONSTANTS = {
  USER_PROFILE_KEY: 'userProfile',
};

export enum VIEW_MODE {
  DESKTOP,
  TABLET,
  MOBILE
}