import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  const password = "123456789";
  const hash = bcrypt.hashSync(password, 12);
  const role = await knex.select("id").from("roles").where("name", "Admin");
  await knex("admins").del();
  await knex("admins").insert([
    {
      name: "admin",
      email: "admin@gmail.com",
      password: hash,
      role_id: role[0].id,
    },
  ]);
}
