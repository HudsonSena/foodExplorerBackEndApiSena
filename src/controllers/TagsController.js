const knex = require("../database/knex");
class TagsController {
  async index(request, response) {
    const food_id = request.food.id;

    const tags = await knex("tags")
      .where({ food_id })
      .orderBy("tags.name")
      .groupBy("tags.name");

    return response.json(tags);
  }
}

module.exports = TagsController;
