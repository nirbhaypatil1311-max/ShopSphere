const express = require("express");

const {
  createContact,
  getContacts,
  updateContactStatus
} = require("../controllers/contactController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", createContact);

router.get(
  "/",
  protect,
  adminOnly,
  getContacts
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateContactStatus
);

module.exports = router;