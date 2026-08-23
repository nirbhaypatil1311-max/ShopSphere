// const db = require("../config/db");


// const getWishlist =
//   async (req, res) => {
//     try {

//       const [items] =
//         await db.execute(
//           `
//           SELECT

//             wi.id
//               AS wishlist_item_id,

//             p.id,

//             p.name,

//             p.description,

//             p.price,

//             p.image,

//             p.stock,

//             c.name
//               AS category

//           FROM wishlist_items wi

//           JOIN wishlist w
//             ON wi.wishlist_id = w.id

//           JOIN products p
//             ON wi.product_id = p.id

//           LEFT JOIN categories c
//             ON p.category_id = c.id

//           WHERE
//             w.user_id = ?

//           ORDER BY
//             wi.created_at DESC
//           `,
//           [
//             req.user.id
//           ]
//         );


//       res.json({
//         wishlist:
//           items
//       });
//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not fetch wishlist"
//       });
//     }
//   };


// const getOrCreateWishlist =
//   async (
//     connection,
//     userId
//   ) => {

//     const [rows] =
//       await connection.execute(
//         `
//         SELECT id
//         FROM wishlist
//         WHERE user_id = ?
//         `,
//         [
//           userId
//         ]
//       );


//     if (rows.length) {
//       return rows[0].id;
//     }


//     const [result] =
//       await connection.execute(
//         `
//         INSERT INTO wishlist
//         (user_id)

//         VALUES (?)
//         `,
//         [
//           userId
//         ]
//       );


//     return result.insertId;
//   };


// const addToWishlist =
//   async (req, res) => {
//     try {

//       const productId =
//         Number(
//           req.body.product_id ||
//           req.body.productId
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


//       const [products] =
//         await db.execute(
//           `
//           SELECT id
//           FROM products
//           WHERE id = ?
//           `,
//           [
//             productId
//           ]
//         );


//       if (!products.length) {
//         return res.status(404).json({
//           message:
//             "Product not found"
//         });
//       }


//       const wishlistId =
//         await getOrCreateWishlist(
//           db,
//           req.user.id
//         );


//       await db.execute(
//         `
//         INSERT INTO wishlist_items
//         (
//           wishlist_id,
//           product_id
//         )

//         VALUES (?, ?)

//         ON DUPLICATE KEY UPDATE
//           product_id =
//             VALUES(product_id)
//         `,
//         [
//           wishlistId,
//           productId
//         ]
//       );


//       res.status(201).json({
//         message:
//           "Product added to wishlist"
//       });
//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not add product to wishlist"
//       });
//     }
//   };


// const removeFromWishlist =
//   async (req, res) => {
//     try {

//       const productId =
//         Number(
//           req.params.productId
//         );


//       const [result] =
//         await db.execute(
//           `
//           DELETE wi

//           FROM wishlist_items wi

//           JOIN wishlist w
//             ON wi.wishlist_id = w.id

//           WHERE
//             w.user_id = ?
//             AND wi.product_id = ?
//           `,
//           [
//             req.user.id,
//             productId
//           ]
//         );


//       if (
//         !result.affectedRows
//       ) {
//         return res.status(404).json({
//           message:
//             "Wishlist item not found"
//         });
//       }


//       res.json({
//         message:
//           "Product removed from wishlist"
//       });
//     } catch (error) {

//       console.error(error);

//       res.status(500).json({
//         message:
//           "Could not remove wishlist item"
//       });
//     }
//   };


// module.exports = {
//   getWishlist,
//   addToWishlist,
//   removeFromWishlist
// };
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