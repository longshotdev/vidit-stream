const express = require("express");
const router = express.Router();

const checkAuthentication = require("../middleware/checkAuthentication");
const userController = require("../controllers/userController");

// GET <URL>/api/users/info/:username // Get User Information
router.get("/info/:username", userController.getUser);

// POST <URL>/api/users/signup // Sign User Up
router.post("/signup", userController.signup);

// POST <URL>/api/users/login // GET JWT Token
router.post("/login", userController.login);

// PUT <URL>/api/users/changeAvatar/// Change Avatar
router.put("/changeAvatar", checkAuthentication, userController.changeAvatar);
module.exports = router;
