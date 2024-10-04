export const USER_ROLE = {
  user: "user",
  admin: "admin",
  company: "company",
  creator: "creator",
} as const;

export const UserStatus = ["block", "active"];

export const UserSearchableFields = ["email", "name", "role"];