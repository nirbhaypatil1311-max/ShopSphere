const express = require("express");

const {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| USER ORDER ROUTES
|--------------------------------------------------------------------------
*/

/*
POST /api/orders
Create a new order
*/
router.post(
  "/",
  protect,
  createOrder
);

/*
GET /api/orders
Get logged-in user's orders
*/
router.get(
  "/",
  protect,
  getMyOrders
);

/*
|--------------------------------------------------------------------------
| ADMIN ORDER ROUTES
|--------------------------------------------------------------------------
*/

/*
IMPORTANT:
Admin routes MUST come BEFORE /:id
because /:id would match "admin".
*/

/*
GET /api/orders/admin
Get all orders
*/
router.get(
  "/admin",
  protect,
  adminOnly,
  getAllOrders
);

/*
GET /api/orders/admin/all
Get all orders
*/
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

/*
GET /api/orders/admin/:id
Get one order for admin
*/
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminOrderById
);

/*
PUT /api/orders/admin/:id
Update order status/payment status
*/
router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateOrderStatus
);

/*
|--------------------------------------------------------------------------
| USER SINGLE ORDER ROUTES
|--------------------------------------------------------------------------
*/

/*
GET /api/orders/:id
Get logged-in user's single order
*/
router.get(
  "/:id",
  protect,
  getMyOrderById
);

/*
PUT /api/orders/:id/cancel
Cancel logged-in user's order
*/
router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

module.exports = router;