const express = require("express");

const {
  getCategories,
  createCategory
} = require("../controllers/categoryController");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const router =
  express.Router();


router.get(
  "/",
  getCategories
);


router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createCategory
);


module.exports = router;