const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const { Knex } = require("../database/knex");

class UserValidatedController {
    async index(request, response) {
        const { user } = request;
        const checkUserExists = await Knex("users").where({ id: user.id });

        if (checkUserExists.lenght === 0) {
            throw new AppError("Unautorized", 401)
        }

        return response.status(201).json();
    }
};

module.exports = UserValidatedController;