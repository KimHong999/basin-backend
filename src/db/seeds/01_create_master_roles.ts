import { Knex } from "knex";
import bcrypt from "bcrypt";
export async function seed(knex: Knex): Promise<void> {
  const privilegeList = [
    {
      name: "Dashboard List",
      module: "dashboard-list",
      group: "dashboard",
    },
    {
      name: "User List",
      module: "user-list",
      group: "users",
    },
    {
      name: "Role List",
      module: "role-list",
      group: "roles",
    },
    {
      name: "Role Create",
      module: "role-create",
      group: "roles",
    },
    {
      name: "Configuration List",
      module: "configuration-list",
      group: "configurations",
    },
    {
      name: "Configuration Create",
      module: "configuration-create",
      group: "configurations",
    },
  ];
  let privileges = (await knex.select("id", "name").from("privileges")).map(
    (privilege) => privilege.name
  );
  const newPrivileges = privilegeList.filter(
    (privilege) => !privileges.includes(privilege.name)
  );
  if (newPrivileges.length) await knex("privileges").insert(newPrivileges);
  privileges = await knex.select("id", "name").from("privileges");

  const insertRole = await knex("roles")
    .insert({ name: "Admin" })
    .returning("id");

  const privilegeIds = (await knex.select("*").from("role_privileges")).map(
    (privilege) => privilege.privilege_id
  );
  const newPrivilegeIds = privileges.filter(
    (privilege) => !privilegeIds.includes(privilege.id)
  );
  const data = [];
  for (const privilege of newPrivilegeIds) {
    data.push({
      role_id: insertRole[0].id,
      privilege_id: privilege.id,
    });
  }
  return knex("role_privileges").insert(data);
}
