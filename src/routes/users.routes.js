const { Router } = require("express");

const UserController = require("../controllers/UserController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
//const UsersValidatedController = require("../controllers/UserValidatedController");

const userController = new UserController();
//const usersValidatedController = new UsersValidatedController();

const usersRoutes = Router();

usersRoutes.post("/", userController.create);
usersRoutes.put("/", ensureAuthenticated, userController.update);
//usersRoutes.get("/validated", ensureAuthenticated, usersValidatedController.index);

module.exports = usersRoutes;
