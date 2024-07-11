const { Router } = require("express");

const UserController = require("../controllers/UserController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const userController = new UserController();

const usersRoutes = Router();

usersRoutes.post("/", userController.create);
usersRoutes.put("/", ensureAuthenticated, userController.update);

module.exports = usersRoutes;