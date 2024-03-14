import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("admins", (table) => {
    table.increments("id").primary();
    table.string("name");
    table.string("email");
    table.string("password");
    table.string("profile");
    table.string("status").defaultTo("active");
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
    table.bigInteger("role_id");
    table.dateTime("deleted_at");

    table.foreign("role_id").references("roles.id").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("admins");
}
