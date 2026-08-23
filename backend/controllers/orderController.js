const db = require("../config/db");

const SHIPPING_FEE = 80;
const FREE_SHIPPING_LIMIT = 1000;
const TAX_RATE = 0.18;

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/
const createOrder = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const {
      shippingAddress,
      paymentMethod = "cod",
    } = req.body || {};

    console.log("CREATE ORDER REQUEST:");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    /*
    |--------------------------------------------------------------------------
    | Validate logged-in user
    |--------------------------------------------------------------------------
    */
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "You must be logged in to place an order.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate shipping address
    |--------------------------------------------------------------------------
    */
    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required.",
      });
    }

    const fullName = String(
      shippingAddress.fullName || ""
    ).trim();

    const phone = String(
      shippingAddress.phone || ""
    ).trim();

    const address = String(
      shippingAddress.address ||
        shippingAddress.line1 ||
        ""
    ).trim();

    const city = String(
      shippingAddress.city || ""
    ).trim();

    const state = String(
      shippingAddress.state || ""
    ).trim();

    const pincode = String(
      shippingAddress.pincode ||
        shippingAddress.postalCode ||
        ""
    ).trim();

    if (!fullName) {
      return res.status(400).json({
        message: "Full name is required.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required.",
      });
    }

    if (!address) {
      return res.status(400).json({
        message: "Address is required.",
      });
    }

    if (!city) {
      return res.status(400).json({
        message: "City is required.",
      });
    }

    if (!state) {
      return res.status(400).json({
        message: "State is required.",
      });
    }

    if (!pincode) {
      return res.status(400).json({
        message: "Postal code is required.",
      });
    }

    const cleanShippingAddress = {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    };

    /*
    |--------------------------------------------------------------------------
    | Validate payment method
    |--------------------------------------------------------------------------
    */
    const cleanPaymentMethod = String(
      paymentMethod
    )
      .trim()
      .toLowerCase();

    const allowedPaymentMethods = [
      "cod",
      "card",
      "upi",
    ];

    if (
      !allowedPaymentMethods.includes(
        cleanPaymentMethod
      )
    ) {
      return res.status(400).json({
        message: "Invalid payment method.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Start transaction
    |--------------------------------------------------------------------------
    */
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Find user's cart
    |--------------------------------------------------------------------------
    */
    const [carts] = await connection.execute(
      `
      SELECT id
      FROM cart
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (carts.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "Your cart does not exist. Please add a product to your cart first.",
      });
    }

    const cartId = carts[0].id;

    /*
    |--------------------------------------------------------------------------
    | Get cart items
    |--------------------------------------------------------------------------
    */
    const [items] = await connection.execute(
      `
      SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.stock
      FROM cart_items ci
      INNER JOIN products p
        ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      FOR UPDATE
      `,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "Your cart is empty. Please add a product before checkout.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate subtotal and check stock
    |--------------------------------------------------------------------------
    */
    let subtotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const stock = Number(item.stock);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        await connection.rollback();

        return res.status(400).json({
          message:
            `Invalid quantity for product "${item.name}".`,
        });
      }

      if (stock <= 0) {
        await connection.rollback();

        return res.status(400).json({
          message:
            `"${item.name}" is currently out of stock.`,
        });
      }

      if (quantity > stock) {
        await connection.rollback();

        return res.status(400).json({
          message:
            `"${item.name}" does not have enough stock. Available stock: ${stock}.`,
        });
      }

      if (!Number.isFinite(price) || price < 0) {
        await connection.rollback();

        return res.status(400).json({
          message:
            `Invalid price for product "${item.name}".`,
        });
      }

      subtotal += price * quantity;
    }

    subtotal = Number(
      subtotal.toFixed(2)
    );

    /*
    |--------------------------------------------------------------------------
    | Shipping
    |--------------------------------------------------------------------------
    */
    const shipping =
      subtotal >= FREE_SHIPPING_LIMIT
        ? 0
        : SHIPPING_FEE;

    /*
    |--------------------------------------------------------------------------
    | Tax
    |--------------------------------------------------------------------------
    */
    const tax = Number(
      (subtotal * TAX_RATE).toFixed(2)
    );

    /*
    |--------------------------------------------------------------------------
    | Total
    |--------------------------------------------------------------------------
    */
    const total = Number(
      (
        subtotal +
        shipping +
        tax
      ).toFixed(2)
    );

    const paymentStatus = "pending";

    /*
    |--------------------------------------------------------------------------
    | Create order
    |--------------------------------------------------------------------------
    */
    const [orderResult] =
      await connection.execute(
        `
        INSERT INTO orders
        (
          user_id,
          total_amount,
          subtotal,
          shipping_amount,
          tax_amount,
          status,
          shipping_address,
          payment_method,
          payment_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          total,
          subtotal,
          shipping,
          tax,
          "pending",
          JSON.stringify(
            cleanShippingAddress
          ),
          cleanPaymentMethod,
          paymentStatus,
        ]
      );

    const orderId =
      orderResult.insertId;

    if (!orderId) {
      throw new Error(
        "Order was not created."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create order items
    |--------------------------------------------------------------------------
    */
    for (const item of items) {
      await connection.execute(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          product_name,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id,
          item.name,
          Number(item.quantity),
          Number(item.price),
        ]
      );

      /*
      |--------------------------------------------------------------------------
      | Decrease product stock
      |--------------------------------------------------------------------------
      */
      await connection.execute(
        `
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
        `,
        [
          Number(item.quantity),
          item.product_id,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear cart
    |--------------------------------------------------------------------------
    */
    await connection.execute(
      `
      DELETE FROM cart_items
      WHERE cart_id = ?
      `,
      [cartId]
    );

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */
    await connection.commit();

    console.log(
      `Order #${orderId} created successfully.`
    );

    return res.status(201).json({
      message:
        "Order created successfully",
      order: {
        id: orderId,
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod:
          cleanPaymentMethod,
        paymentStatus,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/*
|--------------------------------------------------------------------------
| Get My Orders
|--------------------------------------------------------------------------
*/
const getMyOrders = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const [orders] =
      await db.execute(
        `
        SELECT
          id,
          total_amount,
          subtotal,
          shipping_amount,
          tax_amount,
          status,
          shipping_address,
          payment_method,
          payment_status,
          created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

    res.status(200).json({
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get My Order By ID
|--------------------------------------------------------------------------
*/
const getMyOrderById = async (
  req,
  res,
  next
) => {
  try {
    const orderId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID.",
      });
    }

    const [orders] =
      await db.execute(
        `
        SELECT *
        FROM orders
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
        `,
        [
          orderId,
          req.user.id,
        ]
      );

    if (orders.length === 0) {
      return res.status(404).json({
        message:
          "Order not found.",
      });
    }

    const order = orders[0];

    /*
    |--------------------------------------------------------------------------
    | Parse shipping address
    |--------------------------------------------------------------------------
    */
    if (
      typeof order.shipping_address ===
      "string"
    ) {
      try {
        order.shipping_address =
          JSON.parse(
            order.shipping_address
          );
      } catch (error) {
        console.error(
          "Could not parse shipping address:",
          error
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Get order items
    |--------------------------------------------------------------------------
    */
    const [items] =
      await db.execute(
        `
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.product_name,
          oi.quantity,
          oi.price,
          oi.created_at,
          p.name AS current_product_name,
          p.image
        FROM order_items oi
        LEFT JOIN products p
          ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
        `,
        [orderId]
      );

    return res.status(200).json({
      order,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/
const cancelOrder = async (
  req,
  res,
  next
) => {
  let connection;

  try {
    connection =
      await db.getConnection();

    const orderId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID.",
      });
    }

    await connection.beginTransaction();

    const [orders] =
      await connection.execute(
        `
        SELECT *
        FROM orders
        WHERE id = ?
          AND user_id = ?
        FOR UPDATE
        `,
        [
          orderId,
          req.user.id,
        ]
      );

    if (orders.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message:
          "Order not found.",
      });
    }

    const order = orders[0];

    if (
      [
        "shipped",
        "delivered",
        "cancelled",
      ].includes(order.status)
    ) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "This order cannot be cancelled.",
      });
    }

    const [items] =
      await connection.execute(
        `
        SELECT
          product_id,
          quantity
        FROM order_items
        WHERE order_id = ?
        `,
        [orderId]
      );

    /*
    |--------------------------------------------------------------------------
    | Restore stock
    |--------------------------------------------------------------------------
    */
    for (const item of items) {
      await connection.execute(
        `
        UPDATE products
        SET stock = stock + ?
        WHERE id = ?
        `,
        [
          item.quantity,
          item.product_id,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel order
    |--------------------------------------------------------------------------
    */
    await connection.execute(
      `
      UPDATE orders
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [orderId]
    );

    await connection.commit();

    return res.status(200).json({
      message:
        "Order cancelled successfully.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/*
|--------------------------------------------------------------------------
| Get All Orders - Admin
|--------------------------------------------------------------------------
*/
const getAllOrders = async (req, res, next) => {
  try {
    console.log("========== GET ALL ORDERS ==========");
    console.log("Logged-in user:", req.user);

    const [orders] = await db.execute(
      `
      SELECT
        o.id,
        o.user_id,
        o.total_amount,
        o.subtotal,
        o.shipping_amount,
        o.tax_amount,
        o.status,
        o.shipping_address,
        o.payment_method,
        o.payment_status,
        o.created_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      INNER JOIN users u
        ON o.user_id = u.id
      ORDER BY o.created_at DESC
      `
    );

    console.log("Orders found:", orders.length);
    console.log("Orders:", orders);

    return res.status(200).json({
      orders
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Admin Order By ID
|--------------------------------------------------------------------------
*/
const getAdminOrderById = async (
  req,
  res,
  next
) => {
  try {
    const orderId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID.",
      });
    }

    const [orders] =
      await db.execute(
        `
        SELECT
          o.*,
          u.name AS customer_name,
          u.email AS customer_email
        FROM orders o
        INNER JOIN users u
          ON o.user_id = u.id
        WHERE o.id = ?
        LIMIT 1
        `,
        [orderId]
      );

    if (orders.length === 0) {
      return res.status(404).json({
        message:
          "Order not found.",
      });
    }

    const order = orders[0];

    if (
      typeof order.shipping_address ===
      "string"
    ) {
      try {
        order.shipping_address =
          JSON.parse(
            order.shipping_address
          );
      } catch {}
    }

    const [items] =
      await db.execute(
        `
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.product_name,
          oi.quantity,
          oi.price,
          oi.created_at,
          p.name AS current_product_name,
          p.image
        FROM order_items oi
        LEFT JOIN products p
          ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
        `,
        [orderId]
      );

    return res.status(200).json({
      order,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Order Status - Admin
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (
  req,
  res,
  next
) => {
  try {
    const orderId = Number(
      req.params.id
    );

    const {
      status,
      paymentStatus,
    } = req.body || {};

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID.",
      });
    }

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid order status.",
      });
    }

    if (
      paymentStatus &&
      !allowedPaymentStatuses.includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment status.",
      });
    }

    const fields = [];
    const values = [];

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (paymentStatus) {
      fields.push(
        "payment_status = ?"
      );
      values.push(paymentStatus);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message:
          "No update provided.",
      });
    }

    values.push(orderId);

    const [result] =
      await db.execute(
        `
        UPDATE orders
        SET ${fields.join(", ")}
        WHERE id = ?
        `,
        values
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message:
          "Order not found.",
      });
    }

    return res.status(200).json({
      message:
        "Order updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/
module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
};