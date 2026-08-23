// const db = require("../config/db");


// const getOrCreateCart =
//   async (
//     connection,
//     userId
//   ) => {

//     const [rows] =
//       await connection.execute(
//         "SELECT id FROM cart WHERE user_id = ?",
//         [userId]
//       );


//     if (rows.length) {
//       return rows[0].id;
//     }


//     const [result] =
//       await connection.execute(
//         "INSERT INTO cart (user_id) VALUES (?)",
//         [userId]
//       );


//     return result.insertId;
//   };


// const getCart =
//   async (req, res) => {
//     try {
//       const userId =
//         req.user.id;


//       const [cartRows] =
//         await db.execute(
//           "SELECT id FROM cart WHERE user_id = ?",
//           [userId]
//         );


//       if (!cartRows.length) {
//         return res.json({
//           cartId: null,
//           items: [],
//           total: 0,
//           totalItems: 0
//         });
//       }


//       const cartId =
//         cartRows[0].id;


//       const [items] =
//         await db.execute(
//           `
//           SELECT
//             ci.id AS cart_item_id,
//             ci.product_id,
//             ci.quantity,

//             p.id,
//             p.name,
//             p.price,
//             p.image,
//             p.stock,

//             c.name AS category

//           FROM cart_items ci

//           JOIN products p
//             ON ci.product_id = p.id

//           LEFT JOIN categories c
//             ON p.category_id = c.id

//           WHERE ci.cart_id = ?

//           ORDER BY ci.id DESC
//           `,
//           [cartId]
//         );


//       const normalized =
//         items.map(
//           (item) => ({
//             ...item,

//             price:
//               Number(item.price),

//             quantity:
//               Number(item.quantity),

//             stock:
//               Number(item.stock)
//           })
//         );


//       const total =
//         normalized.reduce(
//           (sum, item) =>
//             sum +
//             item.price *
//               item.quantity,
//           0
//         );


//       const totalItems =
//         normalized.reduce(
//           (sum, item) =>
//             sum +
//             item.quantity,
//           0
//         );


//       res.json({
//         cartId,

//         items:
//           normalized,

//         total,

//         totalItems
//       });
//     } catch (error) {
//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not fetch cart"
//       });
//     }
//   };


// const addToCart =
//   async (req, res) => {

//     const connection =
//       await db.getConnection();

//     try {
//       const productId =
//         Number(
//           req.body.product_id ||
//           req.body.productId
//         );


//       const quantity =
//         Number(
//           req.body.quantity || 1
//         );


//       if (
//         !Number.isInteger(
//           productId
//         ) ||
//         productId <= 0
//       ) {
//         return res.status(400).json({
//           message:
//             "Valid product ID is required"
//         });
//       }


//       if (
//         !Number.isInteger(
//           quantity
//         ) ||
//         quantity <= 0
//       ) {
//         return res.status(400).json({
//           message:
//             "Quantity must be a positive integer"
//         });
//       }


//       await connection.beginTransaction();


//       const [products] =
//         await connection.execute(
//           `
//           SELECT
//             id,
//             stock
//           FROM products
//           WHERE id = ?
//           FOR UPDATE
//           `,
//           [productId]
//         );


//       if (!products.length) {
//         await connection.rollback();

//         return res.status(404).json({
//           message:
//             "Product not found"
//         });
//       }


//       const stock =
//         Number(
//           products[0].stock
//         );


//       const cartId =
//         await getOrCreateCart(
//           connection,
//           req.user.id
//         );


//       const [existing] =
//         await connection.execute(
//           `
//           SELECT
//             id,
//             quantity

//           FROM cart_items

//           WHERE
//             cart_id = ?
//             AND product_id = ?

//           FOR UPDATE
//           `,
//           [
//             cartId,
//             productId
//           ]
//         );


//       const newQuantity =
//         existing.length
//           ? Number(
//               existing[0].quantity
//             ) + quantity
//           : quantity;


//       if (
//         newQuantity > stock
//       ) {
//         await connection.rollback();

//         return res.status(400).json({
//           message:
//             "Requested quantity exceeds available stock"
//         });
//       }


//       if (existing.length) {
//         await connection.execute(
//           `
//           UPDATE cart_items

//           SET quantity = ?

//           WHERE id = ?
//           `,
//           [
//             newQuantity,
//             existing[0].id
//           ]
//         );
//       } else {
//         await connection.execute(
//           `
//           INSERT INTO cart_items
//           (
//             cart_id,
//             product_id,
//             quantity
//           )

//           VALUES (?, ?, ?)
//           `,
//           [
//             cartId,
//             productId,
//             quantity
//           ]
//         );
//       }


//       await connection.commit();


//       res.status(201).json({
//         message:
//           "Product added to cart",

//         cartId
//       });
//     } catch (error) {
//       await connection.rollback();

//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not add product to cart"
//       });
//     } finally {
//       connection.release();
//     }
//   };


// const updateCartItem =
//   async (req, res) => {
//     try {
//       const itemId =
//         Number(
//           req.params.itemId
//         );


//       const quantity =
//         Number(
//           req.body.quantity
//         );


//       if (
//         !Number.isInteger(
//           itemId
//         ) ||
//         itemId <= 0
//       ) {
//         return res.status(400).json({
//           message:
//             "Invalid cart item ID"
//         });
//       }


//       if (
//         !Number.isInteger(
//           quantity
//         ) ||
//         quantity <= 0
//       ) {
//         return res.status(400).json({
//           message:
//             "Quantity must be a positive integer"
//         });
//       }


//       const [items] =
//         await db.execute(
//           `
//           SELECT
//             ci.id,
//             p.stock

//           FROM cart_items ci

//           JOIN cart c
//             ON ci.cart_id = c.id

//           JOIN products p
//             ON ci.product_id = p.id

//           WHERE
//             ci.id = ?
//             AND c.user_id = ?
//           `,
//           [
//             itemId,
//             req.user.id
//           ]
//         );


//       if (!items.length) {
//         return res.status(404).json({
//           message:
//             "Cart item not found"
//         });
//       }


//       if (
//         quantity >
//         Number(items[0].stock)
//       ) {
//         return res.status(400).json({
//           message:
//             "Quantity exceeds available stock"
//         });
//       }


//       await db.execute(
//         `
//         UPDATE cart_items
//         SET quantity = ?
//         WHERE id = ?
//         `,
//         [
//           quantity,
//           itemId
//         ]
//       );


//       res.json({
//         message:
//           "Cart updated successfully"
//       });
//     } catch (error) {
//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not update cart"
//       });
//     }
//   };


// const deleteCartItem =
//   async (req, res) => {
//     try {
//       const itemId =
//         Number(
//           req.params.itemId
//         );


//       const [result] =
//         await db.execute(
//           `
//           DELETE ci

//           FROM cart_items ci

//           JOIN cart c
//             ON ci.cart_id = c.id

//           WHERE
//             ci.id = ?
//             AND c.user_id = ?
//           `,
//           [
//             itemId,
//             req.user.id
//           ]
//         );


//       if (
//         !result.affectedRows
//       ) {
//         return res.status(404).json({
//           message:
//             "Cart item not found"
//         });
//       }


//       res.json({
//         message:
//           "Cart item removed successfully"
//       });
//     } catch (error) {
//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not remove cart item"
//       });
//     }
//   };


// const clearCart =
//   async (req, res) => {
//     try {
//       const [cartRows] =
//         await db.execute(
//           "SELECT id FROM cart WHERE user_id = ?",
//           [req.user.id]
//         );


//       if (cartRows.length) {
//         await db.execute(
//           `
//           DELETE FROM cart_items
//           WHERE cart_id = ?
//           `,
//           [
//             cartRows[0].id
//           ]
//         );
//       }


//       res.json({
//         message:
//           "Cart cleared successfully"
//       });
//     } catch (error) {
//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not clear cart"
//       });
//     }
//   };


// module.exports = {
//   getCart,
//   addToCart,
//   updateCartItem,
//   deleteCartItem,
//   clearCart
// };
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