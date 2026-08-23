const db = require("../config/db");

const getWishlist = async (req, res, next) => {
  try {
    const [items] = await db.execute(
      `
      SELECT
        w.id,
        w.product_id,
        w.created_at,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.category_id,
        c.name AS category
      FROM wishlist w
      INNER JOIN products p
        ON w.product_id = p.id
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      items
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const [products] = await db.execute(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    await db.execute(
      `
      INSERT INTO wishlist (user_id, product_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)
      `,
      [req.user.id, productId]
    );

    res.status(201).json({
      message: "Product added to wishlist"
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const [result] = await db.execute(
      `
      DELETE FROM wishlist
      WHERE user_id = ? AND product_id = ?
      `,
      [req.user.id, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Wishlist item not found"
      });
    }

    res.json({
      message: "Product removed from wishlist"
    });
  } catch (error) {
    next(error);
  }
};

const clearWishlist = async (req, res, next) => {
  try {
    await db.execute(
      "DELETE FROM wishlist WHERE user_id = ?",
      [req.user.id]
    );

    res.json({
      message: "Wishlist cleared successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};
