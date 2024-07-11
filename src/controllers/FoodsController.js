const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");
const DiskStorage = require("../provides/DiskStorage");

class FoodsController {
  async create(request, response) {
    const { title, description, category, cost, tags } = request.body;
    const user_id = request.user.id;
    const imageFilename = request.file.filename;
    const diskStorage = new DiskStorage();
    const database = await sqliteConnection();

    const checkFoodExists = await database.get(
      "SELECT * FROM foods  WHERE title = (?)",
      [title]
    );

    if (checkFoodExists) {
      throw new AppError("Este prato já existe no menu.");
    }

    const filename = await diskStorage.saveFile(imageFilename);
    const foodimage = filename;

    const [food_id] = await knex("foods").insert({
      title,
      description,
      category,
      foodimage,
      cost,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        food_id,
        user_id,
        name,
      };
    });

    await knex("tags").insert(tagsInsert);

    return response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const food = await knex("foods").where({ id }).first();
    const tags = await knex("tags").where({ food_id: id }).orderBy("name");

    return response.json({
      ...food,
      tags,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("foods").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { title, category, tags } = request.query;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());

      const foods = await knex("foods")
        .select([
          "foods.id",
          "foods.foodimage",
          "foods.title",
          "foods.category",
          "foods.description",
          "foods.cost",
        ])
        .leftJoin("tags", "foods.id", "tags.food_id")
        .whereLike("tags.name", `%${filterTags}%`)
        .orderBy("foods.title")
        .groupBy("foods.title");

      const foodIds = foods.map((food) => food.id);

      const tagsFood = await knex("tags")
        .select(["tags.food_id", "tags.name"])
        .whereIn("tags.food_id", foodIds)
        .orderBy("tags.name");

      const foodsWithTags = foods.map((food) => {
        const foodTags = tagsFood
          .filter((tag) => tag.food_id === food.id)
          .map((tag) => tag.name);

        return {
          id: food.id,
          foodimage: food.foodimage,
          title: food.title,
          category: food.category,
          description: food.description,
          cost: food.cost,
          tags: foodTags,
        };
      });

      return response.json(foodsWithTags);
    }
    if (category) {
      const foods = await knex("foods")
        .select([
          "foods.id",
          "foods.foodimage",
          "foods.title",
          "foods.category",
          "foods.description",
          "foods.cost",
        ])
        .where("foods.category", "like", `%${category}%`)
        .leftJoin("tags", "foods.id", "tags.food_id")
        .orderBy("foods.title")
        .groupBy("foods.title");

      const foodIds = foods.map((food) => food.id);

      const tagsFood = await knex("tags")
        .select(["tags.food_id", "tags.name"])
        .whereIn("tags.food_id", foodIds)
        .orderBy("tags.name");

      const foodsWithTags = foods.map((food) => {
        const foodTags = tagsFood
          .filter((tag) => tag.food_id === food.id)
          .map((tag) => tag.name);

        return {
          id: food.id,
          foodimage: food.foodimage,
          title: food.title,
          category: food.category,
          description: food.description,
          cost: food.cost,
          tags: foodTags,
        };
      });

      return response.json(foodsWithTags);
    } else {
      const foods = await knex("foods")
        .select([
          "foods.id",
          "foods.foodimage",
          "foods.title",
          "foods.category",
          "foods.description",
          "foods.cost",
        ])
        .where("foods.title", "like", `%${title}%`)
        .leftJoin("tags", "foods.id", "tags.food_id")
        .orderBy("foods.title")
        .groupBy("foods.title");

      const foodIds = foods.map((food) => food.id);

      const tagsFood = await knex("tags")
        .select(["tags.food_id", "tags.name"])
        .whereIn("tags.food_id", foodIds)
        .orderBy("tags.name");

      const foodsWithTags = foods.map((food) => {
        const foodTags = tagsFood
          .filter((tag) => tag.food_id === food.id)
          .map((tag) => tag.name);

        return {
          id: food.id,
          foodimage: food.foodimage,
          title: food.title,
          category: food.category,
          description: food.description,
          cost: food.cost,
          tags: foodTags,
        };
      });

      return response.json(foodsWithTags);
    }
  }

  async update(request, response) {
    const { id } = request.params;
    const { title, description, category, cost, tags } = request.body;

    const database = await sqliteConnection();
    const food = await database.get("SELECT * FROM foods WHERE id = (?)", [id]);

    const foodWithUpdatedTitle = await database.get(
      "SELECT * FROM foods WHERE title = (?)",
      [title]
    );

    if (foodWithUpdatedTitle && foodWithUpdatedTitle.id !== food.id) {
      throw new AppError("Já existe um prato com esse título.");
    }

    food.title = title ?? food.title;
    food.description = description ?? food.description;
    food.cost = cost ?? food.cost;
    food.category = category ?? food.category;

    await database.run(
      `
            UPDATE foods SET
            title = ?,
            description = ?,
            category = ?,
            cost = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
      [food.title, food.description, food.category, food.cost, id]
    );

    await knex("tags").where({ food_id: id }).delete();

    const tagsInsert = tags.map((name) => {
      return {
        food_id: id,
        user_id: food.user_id,
        name,
      };
    });

    await knex("tags").insert(tagsInsert);

    return response.json();
  }
}

module.exports = FoodsController;
