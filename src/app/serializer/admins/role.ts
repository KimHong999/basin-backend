import { pick } from "~/app/helper/utils";

export const roleListSerializer = (role: any) => {
  return pick(role, ["id", "name"]);
};

export const privilegeListSerializer = (privilege: any) => {
  return pick(privilege, ["id", "name", "group", "module"]);
};

export const detailRoleSerializer = (role: any) => {
  role.privileges = role.privileges.map(privilegeListSerializer);
  return pick(role, ["id", "name", "privileges"]);
};
