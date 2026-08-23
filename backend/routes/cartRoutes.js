// const express = require("express");

// const {
//   getCart,
//   addToCart,
//   updateCartItem,
//   deleteCartItem,
//   clearCart
// } = require("../controllers/cartController");

// const authMiddleware =
//   require("../middleware/authMiddleware");

// const router =
//   express.Router();

// router.use(
//   authMiddleware
// );

// router.get(
//   "/",
//   getCart
// );

// router.post(
//   "/",
//   addToCart
// );

// router.put(
//   "/:itemId",
//   updateCartItem
// );

// router.delete(
//   "/:itemId",
//   deleteCartItem
// );

// router.delete(
//   "/",
//   clearCart
// );
// module.exports = router;
const express = require("express");

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;