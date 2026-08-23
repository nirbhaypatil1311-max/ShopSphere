// const express = require("express");

// const {
//   getWishlist,
//   addToWishlist,
//   removeFromWishlist
// } = require("../controllers/wishlistController");

// const authMiddleware =
//   require("../middleware/authMiddleware");

// const router =
//   express.Router();


// router.use(
//   authMiddleware
// );


// router.get(
//   "/",
//   getWishlist
// );


// router.post(
//   "/",
//   addToWishlist
// );


// router.delete(
//   "/:productId",
//   removeFromWishlist
// );


// module.exports = router;
const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.delete("/", clearWishlist);

module.exports = router;