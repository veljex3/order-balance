const express = require("express");
const router = express.Router();

const {
  orderAdd,
  orderGetHistory,
  orderCancel,
} = require("../controllers/order.controller");

router.post("/add", orderAdd);

router.get("/history", orderGetHistory);

router.post("/cancel/:id", orderCancel);

module.exports = router;
