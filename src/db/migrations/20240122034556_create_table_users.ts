import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("provider");
    table.string("uuid");
    table.string("username");
    table.string("first_name");
    table.string("last_name");
    table.string("profile");
    table.string("email");
    table.string("password");
    table.string("phone");
    table.string("reset_password_token");
    table.dateTime("reset_password_sent_at");
    table.bigInteger("sign_in_count");
    table.dateTime("current_sign_in_at");
    table.dateTime("last_sign_in_at");
    table.string("current_sign_in_ip");
    table.string("last_sign_in_ip");
    table.string("confirmation_token");
    table.dateTime("confirmed_at");
    table.string("gender");
    table.text("bio");
    table.string("cover");
    table.date("dob");
    table.dateTime("confirmation_sent_at");
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
    table.dateTime("deleted_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
