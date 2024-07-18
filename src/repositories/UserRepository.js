const sqliteConnection = require("../database/sqlite");

class UserRepository {
    async findByEmail(email) {
        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users  WHERE email = (?)", [email])

        return user;
    }

    async create({ name, email, password, admin }) {
        const database = await sqliteConnection();

        const userId = await database.run(
            "INSERT INTO users (name, email, password, admin) VALUES (?, ?, ?, ?)",
            [name, email, password, admin]
        );

        return { id: userId };
    }
}
module.exports = UserRepository;