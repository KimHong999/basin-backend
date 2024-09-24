import { table } from "console";
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("categories", (table) => {
    table.increments();
    table.string("name");
    table.string("status").defaultTo("active");
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("categories")
}
