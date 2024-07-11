exports.up = knex => knex.schema.createTable("tags", table => {
    table.increments("id");
    table.text("name");
    table.integer("user_id").references("id").inTable("users");
    table.integer("food_id").references("id").inTable("foods").onDelete("CASCADE");
    
});

exports.down =  knex => knex.schema.dropTable("tags");