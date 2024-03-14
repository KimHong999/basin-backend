import { Knex } from "knex";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  const data = [];
  for (let i = 0; i < 10; i++) {
    const password = "123456789";
    const hash = bcrypt.hashSync(password, 12);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName}_${lastName}`;
    data.push({
      username,
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email({ firstName, lastName, provider: "gmail" }),
      password: hash,
      phone: faker.phone.number(),
      gender: faker.person.sex(),
    });
  }
  return knex("users").insert(data);
}
