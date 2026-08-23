const db = require("../config/db");

const getOrCreateCart = async (userId) => {
  const [existing] = await db.execute(
    "SELECT id FROM cart WHERE user_id = ?",
    [userId]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await db.execute(
    "INSERT INTO cart (user_id) VALUES (?)",
    [userId]
  );

  return result.insertId;
};

const getCart = async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    const [items] = await db.execute(
      `
      SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.category_id,
        c.name AS category,
        (p.price * ci.quantity) AS item_total
      FROM cart_items ci
      INNER JOIN products p
        ON ci.product_id = p.id
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE ci.cart_id = ?
      ORDER BY ci.id DESC
      `,
      [cartId]
    );

    const totalItems = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.item_total),
      0
    );

    res.json({
      cartId,
      items,
      totalItems,
      subtotal: Number(subtotal.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity || 1);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Valid productId is required"
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const [products] = await db.execute(
      "SELECT id, stock FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const product = products[0];

    const cartId = await getOrCreateCart(req.user.id);

    const [existing] = await db.execute(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE cart_id = ? AND product_id = ?
      `,
      [cartId, productId]
    );

    const currentQuantity =
      existing.length > 0 ? Number(existing[0].quantity) : 0;

    const newQuantity = currentQuantity + quantity;

    if (newQuantity > Number(product.stock)) {
      return res.status(400).json({
        message: `Only ${product.stock} item(s) available`
      });
    }

    if (existing.length > 0) {
      await db.execute(
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
        `,
        [newQuantity, existing[0].id]
      );
    } else {
      await db.execute(
        `
        INSERT INTO cart_items
          (cart_id, product_id, quantity)
        VALUES (?, ?, ?)
        `,
        [cartId, productId, quantity]
      );
    }

    res.status(201).json({
      message: "Product added to cart"
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0"
      });
    }

    const [products] = await db.execute(
      "SELECT id, stock FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (quantity > Number(products[0].stock)) {
      return res.status(400).json({
        message: `Only ${products[0].stock} item(s) available`
      });
    }

    const cartId = await getOrCreateCart(req.user.id);

    const [result] = await db.execute(
      `
      UPDATE cart_items
      SET quantity = ?
      WHERE cart_id = ? AND product_id = ?
      `,
      [quantity, cartId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.json({
      message: "Cart updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const cartId = await getOrCreateCart(req.user.id);

    const [result] = await db.execute(
      `
      DELETE FROM cart_items
      WHERE cart_id = ? AND product_id = ?
      `,
      [cartId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.json({
      message: "Product removed from cart"
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    await db.execute(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cartId]
    );

    res.json({
      message: "Cart cleared successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
