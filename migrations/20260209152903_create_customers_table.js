/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('records', (table) => {
    table.increments('id').primary();

    table.string('first_name');
    table.string('last_name');
    table.string('company');
    table.string('city');
    table.string('country');
    table.string('phone_1');
    table.string('phone_2');
    table.string('email').index();
    table.date('subscription_date');
    table.string('website');

    table.timestamps(true, true); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('records');
};