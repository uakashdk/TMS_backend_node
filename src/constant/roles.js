export const ROLES = {
  SUPER_ADMIN: 1,
  COMPANY_ADMIN: 2,
  ACCOUNTS_MANAGER: 4,
  OPERATIONAL_MANAGER: 3,
  SUPPORT_MANAGER: 5,
  DRIVER: 6,
};


export const ROLE_NAME_MAP = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.COMPANY_ADMIN]: "Company Admin",
  [ROLES.OPERATIONAL_MANAGER]: "Operational Manager",
  [ROLES.ACCOUNTS_MANAGER]: "Accounts Manager",
  [ROLES.SUPPORT_MANAGER]: "Support Manager",
  [ROLES.DRIVER]: "Driver",
};
