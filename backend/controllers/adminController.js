const db = require("../config/db");

const getStats = async (req, res, next) => {
  try {
    const [[users]] = await db.execute(
      "SELECT COUNT(*) AS count FROM users"
    );

    const [[products]] = await db.execute(
      "SELECT COUNT(*) AS count FROM products"
    );

    const [[orders]] = await db.execute(
      "SELECT COUNT(*) AS count FROM orders"
    );

    const [[revenue]] = await db.execute(
      `
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM orders
      WHERE status != 'cancelled'
      `
    );

    const [[pendingOrders]] = await db.execute(
      `
      SELECT COUNT(*) AS count
      FROM orders
      WHERE status IN ('pending', 'processing')
      `
    );

    const [[deliveredOrders]] = await db.execute(
      `
      SELECT COUNT(*) AS count
      FROM orders
      WHERE status = 'delivered'
      `
    );

    res.json({
      users: Number(users.count),
      products: Number(products.count),
      orders: Number(orders.count),
      revenue: Number(revenue.total),
      pendingOrders: Number(pendingOrders.count),
      deliveredOrders: Number(deliveredOrders.count)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};