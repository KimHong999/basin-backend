import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("role_privileges", (table) => {
    table.increments();
    table.bigInteger("role_id");
    table.bigInteger("privilege_id");
    table.foreign("role_id").references("roles.id").onDelete("CASCADE");
    table
      .foreign("privilege_id")
      .references("privileges.id")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("role_privileges");
}
