import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("login_activities", (table) => {
    table.increments("id").primary();
    table.string("ip_address");
    table.string("country");
    table.string("action");
    table.string("os");
    table.string("browser");
    table.string("platform");
    table.string("source");
    table.bigInteger("admin_id").unsigned();
    table.integer("user_id");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.foreign("admin_id").references("admins.id").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("login_activities");
}
