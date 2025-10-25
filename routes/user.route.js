const express = require("express");
const router = express.Router();
const { signup, signin,transfer } = require("../controllers/user.controller");
const userController = require("../controllers/user.controller");


// Signup route
router.post("/signup", signup);

// Signin route
router.post("/signin", signin);
router.post("/transfer", userController.transfer);
router.get("/transactions/:userId", userController.getTransactions);
router.get("/recipient/:accountNumber", userController.getRecipient);



module.exports = router;


