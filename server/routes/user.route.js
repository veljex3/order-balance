const express = require("express");
const router = express.Router();

const {
  getUserBalance,
  resetUserBalance,
  createOrGetUser,
  updateUserBalance,
} = require("../controllers/user.controller");

router.post("/create", createOrGetUser);
router.post("/balance/reset/:walletAddress", resetUserBalance);
router.post("/balance/update/:walletAddress", updateUserBalance);
router.get("/balance/:walletAddress", getUserBalance);

module.exports = router;
